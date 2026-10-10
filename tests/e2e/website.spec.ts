import { test, expect } from "@playwright/test";
const paths = [
  "/",
  "/study-abroad",
  "/visa",
  "/visit-visa",
  "/dependent-visa",
  "/permanent-residency",
  "/education-loans",
  "/about",
  "/contact",
  "/articles",
  "/gallery",
  "/videos",
  "/privacy",
];
test.beforeEach(async ({ page }) => {
  await page.route("https://www.google.com/maps**", (route) =>
    route.fulfill({ contentType: "text/html", body: "<html><body>Maps embed</body></html>" }),
  );
});
test("public pages render without runtime errors or horizontal overflow", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const path of paths) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Chat with DLFLY Overseas on WhatsApp" }),
    ).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /https:\/\//);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1),
      `Overflow on ${path}`,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});
test("mobile menu overlays the hero and service dropdown works", async ({ page }) => {
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open menu", exact: true });
  if (!(await trigger.isVisible())) return;
  const before = await page.locator('[aria-roledescription="carousel"]').boundingBox();
  await trigger.click();
  const nav = page.getByRole("navigation", { name: "Mobile navigation" });
  await expect(nav).toBeVisible();
  const after = await page.locator('[aria-roledescription="carousel"]').boundingBox();
  expect(after?.y).toBe(before?.y);
  await nav.getByRole("button", { name: "Our services" }).click();
  await nav.getByRole("link", { name: "Study abroad", exact: true }).click();
  await expect(page).toHaveURL(/study-abroad/);
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).not.toBeVisible();
});
test("articles, gallery, maps and restricted admin entry are wired", async ({ page }) => {
  await page.goto("/articles");
  const article = page.getByRole("link", { name: /How to plan your study abroad application/ });
  await expect(article).toBeVisible();
  await article.click();
  await expect(page.locator(".article-content h2").first()).toBeVisible();
  await page.goto("/gallery");
  await expect(page.locator("figure")).toHaveCount(3);
  await page.goto("/contact");
  await expect(page.locator('iframe[title="Find DLFLY Overseas on Google Maps"]')).toHaveAttribute(
    "src",
    /google\.com\/maps/,
  );
  await page.goto("/admin");
  await expect(page.getByRole("button", { name: "Sign in with Google" })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex, nofollow");
  await expect(page.getByRole("button", { name: "Save changes" })).toHaveCount(0);
});
test("sitemap and robots advertise public content and exclude admin", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("/articles/plan-your-study-abroad-application");
  expect(await sitemap.text()).not.toContain("/admin");
  const robots = await request.get("/robots.txt");
  expect(await robots.text()).toContain("Disallow: /admin");
});

test("business analytics respect consent and exclude administration", async ({ page }) => {
  await page.route("https://www.googletagmanager.com/gtag/js**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.route("https://www.clarity.ms/tag/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.goto("/");
  await expect(page.getByRole("complementary", { name: "Analytics preferences" })).toBeVisible();
  await expect(page.locator("#dlfly-ga4, #dlfly-clarity")).toHaveCount(0);
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await expect(page.locator("#dlfly-ga4")).toHaveAttribute("src", /id=G-HZXF3MF7CH/);
  await expect(page.locator("#dlfly-clarity")).toHaveAttribute("src", /tag\/yu0nizh9b1$/);
  await page.getByRole("button", { name: "Cookie preferences", exact: true }).click();
  await page.getByRole("button", { name: "Decline", exact: true }).click();
  await expect(page.locator("#dlfly-ga4, #dlfly-clarity")).toHaveCount(0);
  await page.getByRole("button", { name: "Cookie preferences", exact: true }).click();
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  await expect(page.locator("#dlfly-ga4")).toHaveCount(1);
  await page.getByRole("link", { name: "Admin", exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  await expect(
    page.getByRole("button", { name: "Sign in with Google", exact: true }),
  ).toBeEnabled();
  await expect(page.locator("#dlfly-ga4, #dlfly-clarity")).toHaveCount(0);
});

test("analytics send one page view per route and classify contact clicks", async ({ page }) => {
  await page.route("https://www.googletagmanager.com/gtag/js**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.route("https://www.clarity.ms/tag/**", (route) =>
    route.fulfill({ contentType: "application/javascript", body: "" }),
  );
  await page.goto("/?email=private-test@example.com#private-fragment");
  await page.getByRole("button", { name: "Allow analytics", exact: true }).click();
  const pageViews = () =>
    page.evaluate(() =>
      (window.dataLayer ?? [])
        .map((item) => Array.from(item as IArguments))
        .filter((item) => item[0] === "event" && item[1] === "page_view"),
    );
  await expect.poll(async () => (await pageViews()).length).toBe(1);
  const first = await pageViews();
  expect(first[0]?.[2]).toMatchObject({ page_location: new URL(page.url()).origin + "/" });
  expect(await page.evaluate(() => Object.prototype.toString.call(window.dataLayer?.[0]))).toBe(
    "[object Arguments]",
  );
  await page.locator('main a[href="/articles"]').first().click();
  await expect(page).toHaveURL(/\/articles$/);
  await expect.poll(async () => (await pageViews()).length).toBe(2);
  await page.evaluate(() =>
    document.addEventListener("click", (event) => {
      if (event.target instanceof Element && event.target.closest('a[href^="https://wa.me/"]'))
        event.preventDefault();
    }),
  );
  await page
    .getByRole("link", { name: "Chat with DLFLY Overseas on WhatsApp", exact: true })
    .click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          (window.dataLayer ?? [])
            .map((item) => Array.from(item as IArguments))
            .filter((item) => item[1] === "contact_click").length,
      ),
    )
    .toBe(1);
  expect(
    await page.evaluate(
      () =>
        (window.dataLayer ?? [])
          .map((item) => Array.from(item as IArguments))
          .find((item) => item[1] === "contact_click")?.[2],
    ),
  ).toMatchObject({ contact_method: "whatsapp", page_path: "/articles" });
});
