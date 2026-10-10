export const siteUrl = (import.meta.env.VITE_SITE_URL || "https://dlflyoverseas.com").replace(
  /\/$/,
  "",
);
export function pageHead(
  title: string,
  description: string,
  path: string,
  image = "/images/dlfly-study.jpg",
) {
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:url", content: siteUrl + path },
      { property: "og:image", content: new URL(image, siteUrl).href },
      { name: "twitter:title", content: title },
      { name: "twitter:description", content: description },
      { name: "twitter:image", content: new URL(image, siteUrl).href },
    ],
    links: [{ rel: "canonical", href: siteUrl + path }],
  };
}
export function jsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
export const publicPaths = [
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
export function xmlEscape(value: string) {
  return value.replace(
    /[<>&"']/g,
    (character) =>
      ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&apos;" })[character] ??
      character,
  );
}
