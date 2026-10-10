import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { z } from "zod";
import { studyDestinations } from "@/data/study-destinations";
import { getFirebaseClients } from "./firebase";

export const enquiryServices = [
  "Study abroad",
  "Visa guidance",
  "Visit visa",
  "Dependent visa",
  "Permanent residency",
  "Education finance",
] as const;
export const enquiryServiceOptions = [...enquiryServices, "General enquiry"] as const;
export const enquiryCountries = [
  "Not decided",
  ...studyDestinations.map((destination) => destination.name),
  "Other",
] as const;
export const enquiryStatuses = ["new", "contacted", "closed"] as const;
export const enquirySourcePaths = [
  "/",
  "/contact",
  "/study-abroad",
  "/visa",
  "/visit-visa",
  "/dependent-visa",
  "/permanent-residency",
  "/education-loans",
] as const;

// Dialling punctuation is allowed, but a number must still contain 7–15 digits.
const phoneNumber = /^[+() .-]*([0-9][() .-]*){7,15}$/;

export const enquirySchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(100),
    email: z.string().trim().email("Enter a valid email address.").max(254),
    phone: z
      .string()
      .trim()
      .min(7, "Enter a phone number with 7 to 15 digits, including your country code.")
      .max(30, "Enter a shorter phone number with 7 to 15 digits.")
      .regex(phoneNumber, "Enter a phone number with 7 to 15 digits, including your country code."),
    service: z.enum(enquiryServiceOptions),
    country: z.enum(enquiryCountries),
    message: z.string().trim().min(10, "Tell us a little more about your enquiry.").max(2000),
    consent: z.literal(true, { errorMap: () => ({ message: "Please agree to be contacted." }) }),
    sourcePath: z.enum(enquirySourcePaths),
  })
  .strict();

export const enquiryUpdateSchema = z
  .object({ status: z.enum(enquiryStatuses), notes: z.string().trim().max(2000) })
  .strict();

export type EnquirySubmission = z.infer<typeof enquirySchema>;
export type EnquiryStatus = (typeof enquiryStatuses)[number];
export type EnquiryRecord = EnquirySubmission &
  z.infer<typeof enquiryUpdateSchema> & {
    id: string;
    createdAt: Timestamp | null;
    updatedAt: Timestamp | null;
  };

const enquiryRecordSchema = enquirySchema.extend({
  id: z.string().min(1),
  ...enquiryUpdateSchema.shape,
  createdAt: z.instanceof(Timestamp).nullable(),
  updatedAt: z.instanceof(Timestamp).nullable(),
});

export async function submitEnquiry(input: EnquirySubmission): Promise<string> {
  const submission = enquirySchema.parse(input);
  const { db } = getFirebaseClients();
  const saved = await addDoc(collection(db, "enquiries"), {
    ...submission,
    status: "new",
    notes: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return saved.id;
}

export function subscribeEnquiries(
  onData: (items: EnquiryRecord[]) => void,
  onError: (error: Error) => void,
) {
  const { db } = getFirebaseClients();
  return onSnapshot(
    query(collection(db, "enquiries"), orderBy("createdAt", "desc"), limit(100)),
    (snapshot) => {
      const records: EnquiryRecord[] = [];
      let invalidRecords = false;
      for (const record of snapshot.docs) {
        const parsed = enquiryRecordSchema.safeParse({ ...record.data(), id: record.id });
        if (parsed.success) records.push(parsed.data);
        else invalidRecords = true;
      }
      onData(records);
      if (invalidRecords)
        onError(
          new Error("Some enquiries could not be loaded because their saved data is invalid."),
        );
    },
    onError,
  );
}

export async function updateEnquiry(
  id: string,
  input: z.infer<typeof enquiryUpdateSchema>,
): Promise<void> {
  if (!id || id.includes("/")) throw new Error("Select a valid enquiry.");
  const update = enquiryUpdateSchema.parse(input);
  const { db } = getFirebaseClients();
  await updateDoc(doc(db, "enquiries", id), { ...update, updatedAt: serverTimestamp() });
}
