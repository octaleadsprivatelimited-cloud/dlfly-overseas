import { beforeEach, describe, expect, it, vi } from "vitest";
import { Timestamp } from "firebase/firestore";
import {
  enquiryCountries,
  enquirySchema,
  enquiryServiceOptions,
  enquirySourcePaths,
  enquiryStatuses,
  enquiryUpdateSchema,
  submitEnquiry,
  subscribeEnquiries,
  updateEnquiry,
} from "@/lib/enquiries";

const firebase = vi.hoisted(() => ({
  addDoc: vi.fn(),
  updateDoc: vi.fn(),
  onSnapshot: vi.fn(),
  timestamp: { method: "serverTimestamp" },
}));
vi.mock("@/lib/firebase", () => ({ getFirebaseClients: () => ({ db: {} }) }));
vi.mock("firebase/firestore", async (importOriginal) => ({
  ...(await importOriginal<typeof import("firebase/firestore")>()),
  addDoc: firebase.addDoc,
  updateDoc: firebase.updateDoc,
  onSnapshot: firebase.onSnapshot,
  collection: (_db: unknown, name: string) => ({ name }),
  doc: (_db: unknown, name: string, id: string) => ({ name, id }),
  query: (...parts: unknown[]) => parts,
  limit: (count: number) => ({ limit: count }),
  orderBy: (field: string, direction: string) => ({ field, direction }),
  serverTimestamp: () => firebase.timestamp,
}));

const submission = {
  name: "Asha Rao",
  email: "asha@example.com",
  phone: "+91 63046 36998",
  service: "Study abroad" as const,
  country: "Germany" as const,
  message: "I would like guidance on my university application.",
  consent: true as const,
  sourcePath: "/contact" as const,
};

beforeEach(() => {
  vi.clearAllMocks();
  firebase.addDoc.mockResolvedValue({ id: "saved-enquiry" });
  firebase.updateDoc.mockResolvedValue(undefined);
});

describe("Enquiry validation", () => {
  it("accepts each supported service, destination and public form route", () => {
    for (const service of enquiryServiceOptions)
      expect(enquirySchema.safeParse({ ...submission, service }).success).toBe(true);
    for (const country of enquiryCountries)
      expect(enquirySchema.safeParse({ ...submission, country }).success).toBe(true);
    for (const sourcePath of enquirySourcePaths)
      expect(enquirySchema.safeParse({ ...submission, sourcePath }).success).toBe(true);
  });

  it("trims public text before saving", () => {
    expect(
      enquirySchema.parse({
        ...submission,
        name: "  Asha Rao  ",
        email: " asha@example.com ",
        phone: " +91 63046 36998 ",
        message: ` ${submission.message} `,
      }),
    ).toEqual(submission);
  });

  it.each([
    { name: "A" },
    { name: " ".repeat(10) },
    { name: "A".repeat(101) },
    { email: "invalid-email" },
    { email: `${"a".repeat(245)}@example.com` },
    { phone: "123456" },
    { phone: "+91CALLNOW" },
    { phone: "1".repeat(16) },
    { phone: `${"(".repeat(20)}12345678901` },
    { message: "Too short" },
    { message: " ".repeat(20) },
    { message: "A".repeat(2001) },
    { service: "Unsupported service" },
    { country: "Unsupported country" },
    { sourcePath: "/admin" },
    { consent: false },
    { status: "closed" },
    { notes: "Injected admin note" },
    { createdAt: new Date() },
  ])("rejects invalid or privileged submission fields %j", (invalid) => {
    expect(enquirySchema.safeParse({ ...submission, ...invalid }).success).toBe(false);
  });

  it("allows only bounded admin notes and valid statuses", () => {
    for (const status of enquiryStatuses)
      expect(enquiryUpdateSchema.parse({ status, notes: "  Follow up tomorrow.  " })).toEqual({
        status,
        notes: "Follow up tomorrow.",
      });
    expect(enquiryUpdateSchema.safeParse({ status: "deleted", notes: "" }).success).toBe(false);
    expect(enquiryUpdateSchema.safeParse({ status: "new", notes: "A".repeat(2001) }).success).toBe(
      false,
    );
    expect(
      enquiryUpdateSchema.safeParse({ status: "new", notes: "", email: "changed@example.com" })
        .success,
    ).toBe(false);
  });
});

describe("Enquiry Firestore wiring", () => {
  it("saves validated submissions with server timestamps and fresh admin fields", async () => {
    await expect(submitEnquiry(submission)).resolves.toBe("saved-enquiry");
    expect(firebase.addDoc).toHaveBeenCalledWith(
      { name: "enquiries" },
      {
        ...submission,
        status: "new",
        notes: "",
        createdAt: firebase.timestamp,
        updatedAt: firebase.timestamp,
      },
    );
  });

  it("rejects malformed submissions before writing and propagates write failures", async () => {
    await expect(submitEnquiry({ ...submission, email: "invalid" })).rejects.toThrow();
    expect(firebase.addDoc).not.toHaveBeenCalled();
    const failure = new Error("Service temporarily unavailable");
    firebase.addDoc.mockRejectedValueOnce(failure);
    await expect(submitEnquiry(submission)).rejects.toBe(failure);
  });

  it("updates only validated status, notes and a server timestamp", async () => {
    await updateEnquiry("saved-enquiry", { status: "contacted", notes: " Called today. " });
    expect(firebase.updateDoc).toHaveBeenCalledWith(
      { name: "enquiries", id: "saved-enquiry" },
      { status: "contacted", notes: "Called today.", updatedAt: firebase.timestamp },
    );
    await expect(updateEnquiry("", { status: "new", notes: "" })).rejects.toThrow();
    await expect(updateEnquiry("wrong/path", { status: "new", notes: "" })).rejects.toThrow();
    expect(firebase.updateDoc).toHaveBeenCalledTimes(1);
  });

  it("subscribes to the latest 100 enquiries and reports invalid records safely", () => {
    const onData = vi.fn();
    const onError = vi.fn();
    const unsubscribe = vi.fn();
    firebase.onSnapshot.mockReturnValue(unsubscribe);
    expect(subscribeEnquiries(onData, onError)).toBe(unsubscribe);
    const call = firebase.onSnapshot.mock.calls[0];
    if (!call) throw new Error("The enquiry subscription was not registered.");
    const [source, onSnapshot, errorCallback] = call;
    expect(source).toEqual([
      { name: "enquiries" },
      { field: "createdAt", direction: "desc" },
      { limit: 100 },
    ]);
    const saved = {
      ...submission,
      status: "new",
      notes: "",
      createdAt: Timestamp.now(),
      updatedAt: null,
    };
    onSnapshot({
      docs: [
        { id: "valid", data: () => saved },
        { id: "malformed", data: () => ({ ...saved, createdAt: "invalid-date" }) },
      ],
    });
    expect(onData).toHaveBeenCalledWith([{ ...saved, id: "valid" }]);
    expect(onError).toHaveBeenCalledWith(expect.any(Error));
    const failure = new Error("permission-denied");
    errorCallback(failure);
    expect(onError).toHaveBeenLastCalledWith(failure);
  });
});
