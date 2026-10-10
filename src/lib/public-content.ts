import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const loadArticle = createServerFn({ method: "GET" })
  .validator(z.object({ slug: z.string().max(120) }))
  .handler(async ({ data }) => {
    const { readArticle } = await import("./firestore-rest");
    return readArticle(data.slug);
  });

export const loadSiteSettings = createServerFn({ method: "GET" }).handler(async () => {
  const { readSiteSettings } = await import("./firestore-rest");
  return readSiteSettings();
});
export const loadArticles = createServerFn({ method: "GET" }).handler(async () => {
  const { readPublishedContent } = await import("./firestore-rest");
  return readPublishedContent("articles");
});
export const loadGallery = createServerFn({ method: "GET" }).handler(async () => {
  const { readPublishedContent } = await import("./firestore-rest");
  return readPublishedContent("gallery");
});
export const loadVideos = createServerFn({ method: "GET" }).handler(async () => {
  const { readPublishedContent } = await import("./firestore-rest");
  return readPublishedContent("videos");
});
