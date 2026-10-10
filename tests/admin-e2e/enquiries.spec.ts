import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { test, expect, type BrowserContext, type Locator, type Page } from "@playwright/test";

const outputDirectory = resolve(process.cwd(), "../../outputs");
const servicePages = [
  ["/", "General enquiry"],
  ["/contact", "General enquiry"],
  ["/study-abroad", "Study abroad"],
  ["/visa", "Visa guidance"],
  ["/visit-visa", "Visit visa"],
  ["/dependent-visa", "Dependent visa"],
  ["/permanent-residency", "Permanent residency"],
  ["/education-loans", "Education finance"],
] as const;
const contact = {
  name: "Local Contact Enquiry E2E",
  email: "contact-flow@example.invalid",
  phone: "+91 9000000000",
  country: "New Zealand",
  message: `Please help plan my study application.\n${"LongMessageForWrapping".repeat(12)}`,
};

async function googleLogin(page: Page) {
  await page.goto("/admin");
  await expect(
    page.getByRole("button", { name: "Sign in with Google", exact: true }),
  ).toBeEnabled();
  // This documented mock token flow is confined to the local demo Firebase emulator.
  await page.evaluate(async () => {
    if (location.origin !== "http://localhost:4180") throw new Error("Emulator origin required.");
    const clientsPath = "/src/lib/firebase.ts";
    const authPath = "/node_modules/.vite/deps/firebase_auth.js";
    const { getFirebaseClients } = await import(clientsPath);
    const { GoogleAuthProvider, signInWithCredential } = await import(authPath);
    const { auth } = getFirebaseClients();
    if (!auth.emulatorConfig) throw new Error("Auth emulator required.");
    const email = "dlflyoverseas@gmail.com";
    await signInWithCredential(
      auth,
      GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true })),
    );
  });
  await expect(page.getByRole("heading", { name: "Manage DLFLY Overseas." })).toBeVisible();
  await page.getByRole("button", { name: "enquiries", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Website enquiries", exact: true })).toBeVisible();
}

async function prepareVisitor(context: BrowserContext) {
  // Keep these integration tests isolated from external analytics services.
  await context.route(
    /https:\/\/(www\.googletagmanager\.com|www\.google-analytics\.com|www\.clarity\.ms)\//,
    (route) => route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await context.addInitScript(() => {
    localStorage.setItem("dlfly-analytics-consent", "denied");
    const completionSignals: unknown[] = [];
    Object.assign(window, { contactCompletionSignals: completionSignals });
    window.addEventListener("dlfly-enquiry-submitted", (event) => {
      completionSignals.push({
        type: event.type,
        detail: event instanceof CustomEvent ? event.detail : null,
      });
    });
  });
}

async function fillEnquiry(form: Locator, name = contact.name) {
  await expect(form.getByRole("button", { name: "Send enquiry", exact: true })).toBeEnabled();
  await form.getByLabel("Full name", { exact: true }).fill(name);
  await form.getByLabel("Phone number", { exact: true }).fill(contact.phone);
  await form.getByLabel("Email address", { exact: true }).fill(contact.email);
  await form.getByLabel("Preferred destination", { exact: true }).selectOption(contact.country);
  await form.getByLabel("How can we help?", { exact: true }).fill(contact.message);
  await form.getByRole("checkbox").check();
}

async function expectNoOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() => ({
        viewport: document.documentElement.clientWidth,
        document: document.documentElement.scrollWidth,
      })),
    )
    .toEqual({ viewport: 320, document: 320 });
}

async function screenshot(page: Page, name: string) {
  await mkdir(outputDirectory, { recursive: true });
  await page.screenshot({ path: resolve(outputDirectory, name), fullPage: false });
}

test("contact forms validate before sending and fit every service page on a small phone", async ({
  page,
  context,
}) => {
  test.setTimeout(120000);
  await prepareVisitor(context);
  await page.setViewportSize({ width: 320, height: 740 });
  for (const [route, service] of servicePages) {
    await page.goto(route);
    const form = page.getByRole("form", { name: "Contact enquiry" });
    await expect(form).toBeVisible();
    await expect(form.getByRole("button", { name: "Send enquiry", exact: true })).toBeEnabled();
    await expect(form.getByLabel("Service you’re interested in", { exact: true })).toHaveValue(
      service,
    );
    await expect(form).toHaveAttribute("data-clarity-mask", "True");
    const controls = form.locator(
      'input:not([name="companyWebsite"]):not([type="checkbox"]), select, textarea, button[type="submit"]',
    );
    const geometry = await controls.evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return { left: box.left, right: box.right, height: box.height };
      }),
    );
    expect(geometry.length).toBe(7);
    for (const control of geometry) {
      expect(control.left).toBeGreaterThanOrEqual(0);
      expect(control.right).toBeLessThanOrEqual(320);
      expect(control.height).toBeGreaterThanOrEqual(44);
    }
    await expectNoOverflow(page);
  }

  await page.goto("/contact");
  const form = page.getByRole("form", { name: "Contact enquiry" });
  await form.getByRole("button", { name: "Send enquiry", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText("Please check the highlighted fields");
  await expect(form.getByLabel("Full name", { exact: true })).toBeFocused();
  for (const label of ["Full name", "Phone number", "Email address", "How can we help?"]) {
    await expect(form.getByLabel(label, { exact: true })).toHaveAttribute("aria-invalid", "true");
  }
  await fillEnquiry(form);
  await form.getByLabel("Email address", { exact: true }).fill("invalid-email");
  await form.getByLabel("Phone number", { exact: true }).fill("123abc");
  await form.getByRole("checkbox").uncheck();
  await form.getByRole("button", { name: "Send enquiry", exact: true }).click();
  await expect(form.getByLabel("Email address", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(form.getByLabel("Phone number", { exact: true })).toHaveAttribute(
    "aria-invalid",
    "true",
  );
  await expect(form.getByRole("checkbox")).toHaveAttribute("aria-invalid", "true");
  await expect(form.getByLabel("How can we help?", { exact: true })).toHaveValue(contact.message);
  await expect(page.getByRole("heading", { name: "Your enquiry has been sent." })).toHaveCount(0);
  await expectNoOverflow(page);
  expect(await page.evaluate(() => Reflect.get(window, "contactCompletionSignals"))).toEqual([]);

  // Clean synthetic values before capturing the public design for review.
  await page.reload();
  await page.getByRole("form", { name: "Contact enquiry" }).scrollIntoViewIfNeeded();
  await screenshot(page, "contact-form-mobile.png");
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.locator("#contact-form").scrollIntoViewIfNeeded();
  await screenshot(page, "contact-form-desktop.png");
});

test("anonymous contact submission reaches the restricted admin inbox and follow-up persists", async ({
  page,
  context,
  browser,
}) => {
  test.setTimeout(120000);
  await prepareVisitor(context);
  const adminContext = await browser.newContext({ baseURL: "http://localhost:4180" });
  try {
    const admin = await adminContext.newPage();
    await googleLogin(admin);
    await page.goto("/contact");
    expect(
      await page.evaluate(async () => {
        const path = "/src/lib/firebase.ts";
        const { getFirebaseClients } = await import(path);
        return getFirebaseClients().auth.currentUser;
      }),
    ).toBeNull();
    const form = page.getByRole("form", { name: "Contact enquiry" });
    await fillEnquiry(form);
    await form
      .getByLabel("Service you’re interested in", { exact: true })
      .selectOption("Study abroad");
    await form.getByRole("button", { name: "Send enquiry", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Your enquiry has been sent." })).toBeVisible();
    const signals = await page.evaluate(() => Reflect.get(window, "contactCompletionSignals"));
    expect(signals).toEqual([{ type: "dlfly-enquiry-submitted", detail: null }]);
    for (const value of [contact.name, contact.email, contact.phone, contact.message]) {
      expect(JSON.stringify(signals)).not.toContain(value);
    }

    const openRecord = admin.getByRole("button", { name: `View enquiry from ${contact.name}` });
    await expect(openRecord).toBeVisible();
    await openRecord.click();
    const details = admin.getByRole("region", { name: contact.name, exact: true });
    await expect(details.getByRole("link", { name: contact.email, exact: true })).toHaveAttribute(
      "href",
      `mailto:${contact.email}`,
    );
    await expect(details.getByRole("link", { name: contact.phone, exact: true })).toHaveAttribute(
      "href",
      "tel:+919000000000",
    );
    await expect(details.getByText(contact.country, { exact: true })).toBeVisible();
    await expect(details.getByText("Study abroad", { exact: true })).toBeVisible();
    await expect(details.getByText(contact.message, { exact: true })).toBeVisible();
    await expect(details.locator('a[href="/contact"]')).toBeVisible();
    await expect(
      details.getByText("The visitor agreed to be contacted about this enquiry."),
    ).toBeVisible();
    await expect(details.getByLabel("Follow-up status")).toHaveValue("new");
    await expect(details.getByLabel("Private follow-up notes")).toHaveValue("");

    const observer = await adminContext.newPage();
    await observer.goto("/admin");
    await observer.getByRole("button", { name: "enquiries", exact: true }).click();
    await observer.getByRole("button", { name: `View enquiry from ${contact.name}` }).click();
    const notes = "Local follow-up: discussed intake and next documents. No reply was sent.";
    await details.getByLabel("Follow-up status").selectOption("contacted");
    await details.getByLabel("Private follow-up notes").fill(notes);
    await details.getByRole("button", { name: "Save enquiry", exact: true }).click();
    await expect(details.getByRole("status")).toContainText("Enquiry updated");
    await expect(observer.getByLabel("Follow-up status")).toHaveValue("contacted");
    await expect(observer.getByLabel("Private follow-up notes")).toHaveValue(notes);
    await admin.reload();
    await admin.getByRole("button", { name: "enquiries", exact: true }).click();
    await openRecord.click();
    await expect(details.getByLabel("Follow-up status")).toHaveValue("contacted");
    await expect(details.getByLabel("Private follow-up notes")).toHaveValue(notes);
    await expect(details.getByText(contact.message, { exact: true })).toBeVisible();

    // A second visitor submission proves newest-first ordering and realtime inbox updates.
    const secondName = "Newest Local Enquiry E2E";
    await page.goto("/visa");
    const secondForm = page.getByRole("form", { name: "Contact enquiry" });
    await fillEnquiry(secondForm, secondName);
    await secondForm.getByRole("button", { name: "Send enquiry", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Your enquiry has been sent." })).toBeVisible();
    await expect(
      admin.getByRole("list", { name: "Enquiry inbox" }).getByRole("button").first(),
    ).toHaveAccessibleName(`View enquiry from ${secondName}`);
    const filters = admin.getByRole("group", { name: "Filter enquiries by status" });
    await filters.getByRole("button", { name: /^New / }).click();
    await expect(
      admin.getByRole("button", { name: `View enquiry from ${secondName}` }),
    ).toBeVisible();
    await expect(openRecord).toHaveCount(0);
    await filters.getByRole("button", { name: /^Contacted / }).click();
    await expect(openRecord).toBeVisible();
    await expect(
      admin.getByRole("button", { name: `View enquiry from ${secondName}` }),
    ).toHaveCount(0);
    await filters.getByRole("button", { name: /^All / }).click();
    await screenshot(admin, "contact-admin-desktop.png");
    await admin.setViewportSize({ width: 320, height: 740 });
    await expectNoOverflow(admin);
    await details.scrollIntoViewIfNeeded();
    await expect(details.getByText(contact.message, { exact: true })).toBeVisible();
    await screenshot(admin, "contact-admin-mobile.png");
  } finally {
    await adminContext.close();
  }
});

test("offline and honeypot failures keep the draft without creating an enquiry or success signal", async ({
  page,
  context,
  browser,
}) => {
  await prepareVisitor(context);
  await page.goto("/contact");
  const form = page.getByRole("form", { name: "Contact enquiry" });
  const name = "Unsent Local Enquiry E2E";
  await fillEnquiry(form, name);
  await context.setOffline(true);
  try {
    await form.getByRole("button", { name: "Send enquiry", exact: true }).click();
    await expect(form.getByRole("alert")).toContainText("check your connection");
    await expect(form.getByLabel("Full name", { exact: true })).toHaveValue(name);
    await expect(form.getByLabel("Email address", { exact: true })).toHaveValue(contact.email);
    await expect(form.getByLabel("Phone number", { exact: true })).toHaveValue(contact.phone);
    await expect(form.getByLabel("How can we help?", { exact: true })).toHaveValue(contact.message);
    await expect(form.getByRole("checkbox")).toBeChecked();
    await expect(page.getByRole("heading", { name: "Your enquiry has been sent." })).toHaveCount(0);
  } finally {
    await context.setOffline(false);
  }
  await form
    .locator('input[name="companyWebsite"]')
    .fill("https://bot.example.invalid", { force: true });
  await form.getByRole("button", { name: "Send enquiry", exact: true }).click();
  await expect(form.getByRole("alert")).toContainText("check your connection");
  await expect(form.getByLabel("Full name", { exact: true })).toHaveValue(name);
  await expect(form.getByLabel("How can we help?", { exact: true })).toHaveValue(contact.message);
  expect(await page.evaluate(() => Reflect.get(window, "contactCompletionSignals"))).toEqual([]);
  const adminContext = await browser.newContext({ baseURL: "http://localhost:4180" });
  try {
    const admin = await adminContext.newPage();
    await googleLogin(admin);
    await expect(admin.getByRole("button", { name: `View enquiry from ${name}` })).toHaveCount(0);
  } finally {
    await adminContext.close();
  }
});
