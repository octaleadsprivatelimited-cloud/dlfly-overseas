import { defineHandler } from "nitro";
import { readPublishedContent } from "../../src/lib/firestore-rest";
import { publicPaths, siteUrl, xmlEscape } from "../../src/lib/seo";
import type { Article } from "../../src/lib/content";

export default defineHandler(async () => {
  const articles = (await readPublishedContent("articles")) as Article[];
  const entries = [
    ...publicPaths.map((path) => ({ path, date: "" })),
    ...articles.map((article) => ({
      path: "/articles/" + article.slug,
      date: article.updatedAt ?? "",
    })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries.map((entry) => `<url><loc>${xmlEscape(siteUrl + entry.path)}</loc>${entry.date ? `<lastmod>${xmlEscape(entry.date)}</lastmod>` : ""}</url>`).join("")}</urlset>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
});
