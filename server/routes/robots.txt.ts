import { defineHandler } from "nitro";
import { siteUrl } from "../../src/lib/seo";

export default defineHandler(
  () =>
    new Response(`User-agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: ${siteUrl}/sitemap.xml\n`, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    }),
);
