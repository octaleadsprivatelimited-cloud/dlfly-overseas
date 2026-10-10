import { readFileSync } from "node:fs";
import { beforeAll, afterAll, beforeEach, describe, it } from "vitest";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  setDoc,
  Timestamp,
  where,
  updateDoc,
  deleteDoc,
  setLogLevel,
  serverTimestamp,
} from "firebase/firestore";
let environment: RulesTestEnvironment;
const article = {
  title: "Test study planning article",
  slug: "test-study-planning",
  excerpt: "A complete and useful summary for this test article.",
  body: "A practical preparation guide with enough content to explain a complete study planning process for students.",
  category: "Study abroad",
  coverUrl: "/images/dlfly-study.jpg",
  published: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};
beforeAll(async () => {
  setLogLevel("silent");
  environment = await initializeTestEnvironment({
    projectId: "demo-dlfly-overseas",
    firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 },
  });
});
afterAll(async () => {
  await environment?.cleanup();
});
beforeEach(async () => {
  await environment.clearFirestore();
});
function admin(
  email = "dlflyoverseas@gmail.com",
  verified = true,
  provider: "google.com" | "password" = "google.com",
) {
  return environment
    .authenticatedContext(email, {
      email,
      email_verified: verified,
      firebase: { sign_in_provider: provider },
    })
    .firestore();
}
describe("Firestore content protection", () => {
  it("allows the approved admin to create, edit and delete content", async () => {
    const target = doc(admin(), "articles", article.slug);
    await assertSucceeds(setDoc(target, article));
    await assertSucceeds(updateDoc(target, { title: "Updated study planning article" }));
    await assertSucceeds(deleteDoc(target));
  });
  it("blocks other accounts, unverified email and non-Google authentication", async () => {
    for (const db of [
      admin("other@gmail.com"),
      admin(undefined, false),
      admin(undefined, true, "password"),
      environment.unauthenticatedContext().firestore(),
    ])
      await assertFails(setDoc(doc(db, "articles", article.slug), article));
  });
  it("publishes only approved content and keeps drafts private", async () => {
    await environment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "articles", article.slug), article);
      await setDoc(doc(context.firestore(), "articles", "draft-article"), {
        ...article,
        slug: "draft-article",
        published: false,
      });
    });
    const publicDb = environment.unauthenticatedContext().firestore();
    await assertSucceeds(getDoc(doc(publicDb, "articles", article.slug)));
    await assertFails(getDoc(doc(publicDb, "articles", "draft-article")));
    await assertSucceeds(
      getDocs(query(collection(publicDb, "articles"), where("published", "==", true), limit(100))),
    );
    await assertFails(getDocs(collection(publicDb, "articles")));
    await assertSucceeds(getDoc(doc(admin(), "articles", "draft-article")));
  });
  it("rejects malformed documents and mismatched article URLs", async () => {
    await assertFails(setDoc(doc(admin(), "articles", "wrong-url"), article));
    await assertFails(
      setDoc(doc(admin(), "articles", article.slug), {
        ...article,
        coverUrl: "javascript:alert(1)",
      }),
    );
    await assertFails(
      setDoc(doc(admin(), "articles", article.slug), { ...article, injected: "extra-field" }),
    );
  });
  it("wires gallery images, video embeds and public settings with admin-only writes", async () => {
    const db = admin();
    await assertSucceeds(
      setDoc(doc(db, "gallery", "image"), {
        title: "Campus image",
        imageUrl: "/images/dlfly-study.jpg",
        alt: "Students on a university campus",
        caption: "Study planning",
        published: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }),
    );
    await assertSucceeds(
      setDoc(doc(db, "videos", "video"), {
        title: "Video guide",
        youtubeUrl: "https://youtu.be/dQw4w9WgXcQ",
        description: "Helpful video",
        published: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      }),
    );
    const settings = {
      logoUrl: "",
      address: "Office appointment by phone",
      mapsEmbedUrl: "https://www.google.com/maps?q=DLFLY&output=embed",
      ga4Id: "",
      clarityId: "",
      searchConsoleVerification: "",
    };
    await assertSucceeds(setDoc(doc(db, "settings", "site"), settings));
    await assertSucceeds(
      getDoc(doc(environment.unauthenticatedContext().firestore(), "settings", "site")),
    );
    await assertFails(setDoc(doc(admin("other@gmail.com"), "settings", "site"), settings));
  });
});

const enquiry = {
  name: "Asha Rao",
  email: "asha@example.com",
  phone: "+91 63046 36998",
  service: "Study abroad",
  country: "Germany",
  message: "I would like guidance on my university application.",
  consent: true,
  sourcePath: "/contact",
  status: "new",
  notes: "",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

function publicEnquiry() {
  return { ...enquiry, createdAt: serverTimestamp(), updatedAt: serverTimestamp() };
}

async function seedEnquiry() {
  await environment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "enquiries", "test-enquiry"), enquiry);
  });
}

describe("Firestore enquiry protection", () => {
  it("allows a visitor to submit a valid consented enquiry with server timestamps", async () => {
    const db = environment.unauthenticatedContext().firestore();
    await assertSucceeds(setDoc(doc(db, "enquiries", "public-enquiry"), publicEnquiry()));
    await assertSucceeds(
      setDoc(doc(db, "enquiries", "general-enquiry"), {
        ...publicEnquiry(),
        service: "General enquiry",
        country: "Not decided",
        sourcePath: "/",
      }),
    );
    await assertSucceeds(getDoc(doc(admin(), "enquiries", "public-enquiry")));
  });

  it("never exposes enquiry contact information to visitors or other accounts", async () => {
    await seedEnquiry();
    for (const db of [
      environment.unauthenticatedContext().firestore(),
      admin("other@gmail.com"),
      admin(undefined, false),
      admin(undefined, true, "password"),
    ]) {
      await assertFails(getDoc(doc(db, "enquiries", "test-enquiry")));
      await assertFails(getDocs(query(collection(db, "enquiries"), limit(100))));
      await assertFails(
        updateDoc(doc(db, "enquiries", "test-enquiry"), {
          status: "closed",
          updatedAt: serverTimestamp(),
        }),
      );
      await assertFails(deleteDoc(doc(db, "enquiries", "test-enquiry")));
    }
    await assertSucceeds(getDocs(query(collection(admin(), "enquiries"), limit(100))));
  });

  it("allows only the approved Google admin to update status and private notes", async () => {
    await seedEnquiry();
    const target = doc(admin(), "enquiries", "test-enquiry");
    await assertSucceeds(
      updateDoc(target, {
        status: "contacted",
        notes: "Discussed the application and agreed a follow-up call.",
        updatedAt: serverTimestamp(),
      }),
    );
    await assertSucceeds(updateDoc(target, { status: "closed", updatedAt: serverTimestamp() }));
    await assertFails(deleteDoc(target));
  });

  it("preserves original submissions and rejects invalid admin changes", async () => {
    await seedEnquiry();
    const target = doc(admin(), "enquiries", "test-enquiry");
    for (const change of [
      { name: "Changed name" },
      { email: "changed@example.com" },
      { phone: "+91 1234567890" },
      { service: "Visit visa" },
      { country: "Ireland" },
      { message: "Changed original visitor request." },
      { consent: false },
      { sourcePath: "/study-abroad" },
      { createdAt: serverTimestamp() },
      { status: "deleted" },
      { notes: "A".repeat(2001) },
      { extraField: true },
    ])
      await assertFails(updateDoc(target, { ...change, updatedAt: serverTimestamp() }));
    await assertFails(
      updateDoc(target, { status: "contacted", updatedAt: Timestamp.fromMillis(1) }),
    );
  });

  it.each([
    { name: "A" },
    { name: " ".repeat(10) },
    { name: "  Asha Rao  " },
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
    { consent: "true" },
    { status: "contacted" },
    { notes: "Injected admin note" },
    { extraField: "Injected" },
    { createdAt: Timestamp.fromMillis(1) },
    { updatedAt: Timestamp.fromMillis(1) },
  ])("rejects invalid, privileged or backdated public submissions %j", async (invalid) => {
    const db = environment.unauthenticatedContext().firestore();
    await assertFails(
      setDoc(doc(db, "enquiries", "invalid-enquiry"), {
        ...publicEnquiry(),
        ...invalid,
      }),
    );
  });

  it("requires the complete submission shape", async () => {
    const db = environment.unauthenticatedContext().firestore();
    for (const omitted of ["consent", "sourcePath", "status", "notes", "createdAt", "updatedAt"]) {
      const incomplete: Record<string, unknown> = publicEnquiry();
      delete incomplete[omitted];
      await assertFails(setDoc(doc(db, "enquiries", "invalid-enquiry"), incomplete));
    }
  });
});
