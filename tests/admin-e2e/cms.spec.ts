import { test, expect, type Page } from "@playwright/test";

async function googleLogin(page: Page, email: string) {
  if (!page.url().endsWith("/admin")) await page.goto("/admin");
  await expect(
    page.getByRole("button", { name: "Sign in with Google", exact: true }),
  ).toBeEnabled();
  // Firebase's documented mock ID-token flow avoids external Google iframe dependencies.
  // This helper runs only against the localhost demo emulator, never a production account.
  await page.evaluate(async (email) => {
    if (location.origin !== "http://localhost:4180") throw new Error("Emulator origin required.");
    const clientsPath = "/src/lib/firebase.ts";
    const authPath = "/node_modules/.vite/deps/firebase_auth.js";
    const { getFirebaseClients } = await import(clientsPath);
    const { GoogleAuthProvider, signInWithCredential } = await import(authPath);
    const { auth } = getFirebaseClients();
    if (!auth.emulatorConfig) throw new Error("Auth emulator required.");
    await signInWithCredential(
      auth,
      GoogleAuthProvider.credential(JSON.stringify({ sub: email, email, email_verified: true })),
    );
  }, email);
}

test("Google admin can manage content and another email is rejected", async ({ page, context }) => {
  await googleLogin(page, "dlflyoverseas@gmail.com");
  await expect(page.getByRole("heading", { name: "Manage DLFLY Overseas." })).toBeVisible();
  await page.getByText("Starter content", { exact: true }).click();
  await page.getByRole("button", { name: "Add starter articles and gallery" }).click();
  await expect(page.getByRole("status")).toContainText("Starter content is ready");
  await page.getByLabel("Article title", { exact: true }).fill("Testing an application checklist");
  await page
    .getByLabel("Summary", { exact: true })
    .fill("A complete application checklist for our local end-to-end verification.");
  await page.getByLabel("Cover image URL", { exact: true }).fill("/images/dlfly-study.jpg");
  await page
    .getByLabel("Article content (Markdown)", { exact: true })
    .fill(
      "## Prepare your documents\nCollect academic records and check the official institution requirements before preparing your application.",
    );
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Draft saved" })).toBeVisible();
  const visitor = await context.newPage();
  await visitor.goto("/articles/testing-an-application-checklist");
  await expect(visitor.getByRole("heading", { name: "404", exact: true })).toBeVisible();
  await page.getByLabel("Publish on the website", { exact: true }).check();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved and published" })).toBeVisible();
  await visitor.reload();
  await expect(visitor.locator("h1")).toHaveText("Testing an application checklist");
  await page.getByRole("button", { name: "gallery", exact: true }).click();
  await page.getByLabel("Image title", { exact: true }).fill("Application preparation");
  await page.getByLabel("Image URL", { exact: true }).fill("/images/dlfly-visa.jpg");
  await page.getByLabel("Alternative text").fill("An advisor reviews the application checklist");
  await page.getByLabel("Publish on the website", { exact: true }).check();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved and published" })).toBeVisible();
  await visitor.goto("/gallery");
  await expect(
    visitor.getByRole("heading", { name: "Application preparation", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "videos", exact: true }).click();
  await page.getByLabel("Video title", { exact: true }).fill("Application preparation video");
  await page.getByLabel("YouTube URL or video ID", { exact: true }).fill("M7lc1UVf-VE");
  await page.getByLabel("Publish on the website", { exact: true }).check();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved and published" })).toBeVisible();
  await visitor.goto("/videos");
  await expect(
    visitor.getByRole("heading", { name: "Application preparation video", exact: true }),
  ).toBeVisible();
  await visitor.route("https://www.youtube-nocookie.com/embed/**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<html><body>Video player</body></html>" }),
  );
  await visitor.getByRole("button", { name: "Play video: Application preparation video" }).click();
  await expect(visitor.getByTitle("Application preparation video")).toHaveAttribute(
    "src",
    "https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?autoplay=1",
  );
  await page.getByRole("button", { name: "settings", exact: true }).click();
  await page
    .getByLabel("Office address", { exact: true })
    .fill("Contact our team to arrange an office visit.");
  await page
    .getByLabel("Google Search Console verification value", { exact: true })
    .fill("local-verification-test");
  await page.getByRole("button", { name: "Save settings", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Settings saved" })).toBeVisible();
  await visitor.goto("/");
  await expect(visitor.locator('meta[name="google-site-verification"]')).toHaveAttribute(
    "content",
    "local-verification-test",
  );
  await page.getByRole("button", { name: "articles", exact: true }).click();
  page.once("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Delete Testing an application checklist", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Delete Testing an application checklist", exact: true }),
  ).toHaveCount(0);
  await visitor.goto("/articles/testing-an-application-checklist");
  await expect(visitor.getByRole("heading", { name: "404", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Sign in with Google", exact: true }),
  ).toBeEnabled();
  await googleLogin(page, "unauthorized@example.com");
  await expect(page.getByRole("alert")).toContainText(
    "Admin access is available only to dlflyoverseas@gmail.com",
  );
  await expect(page.getByRole("button", { name: "Save changes", exact: true })).toHaveCount(0);
});
