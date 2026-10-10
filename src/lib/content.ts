import { z } from "zod";

export function isSafeImageUrl(value: string) {
  if (/^\/images\/[a-zA-Z0-9._-]+$/.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password;
  } catch {
    return false;
  }
}

export function youtubeId(value: string): string | null {
  if (/^[a-zA-Z0-9_-]{11}$/.test(value)) return value;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return null;
    const host = url.hostname.replace(/^www\./, "");
    const id =
      host === "youtu.be"
        ? url.pathname.slice(1)
        : ["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)
          ? (url.searchParams.get("v") ?? url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1])
          : null;
    return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}

export function isGoogleMapsEmbed(value: string) {
  if (!value) return true;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      ["www.google.com", "maps.google.com"].includes(url.hostname) &&
      (url.pathname.startsWith("/maps/embed") ||
        (url.pathname === "/maps" && url.searchParams.get("output") === "embed"))
    );
  } catch {
    return false;
  }
}

const imageUrl = z
  .string()
  .max(2000)
  .refine(isSafeImageUrl, "Use an HTTPS image URL or a project /images/ file.");
export const articleSchema = z.object({
  title: z.string().trim().min(5).max(180),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase words separated by hyphens."),
  excerpt: z.string().trim().min(20).max(400),
  body: z.string().trim().min(80).max(50000),
  category: z.enum([
    "Study abroad",
    "Visa guidance",
    "Permanent residency",
    "Education loans",
    "Company news",
  ]),
  coverUrl: imageUrl,
  published: z.boolean(),
});
export const gallerySchema = z.object({
  title: z.string().trim().min(3).max(180),
  imageUrl,
  alt: z.string().trim().min(5).max(300),
  caption: z.string().trim().max(500),
  published: z.boolean(),
});
export const videoSchema = z.object({
  title: z.string().trim().min(3).max(180),
  youtubeUrl: z
    .string()
    .max(2000)
    .refine((value) => youtubeId(value) !== null, "Enter a valid YouTube video URL or ID."),
  description: z.string().trim().max(1000),
  published: z.boolean(),
});
export const settingsSchema = z.object({
  logoUrl: z
    .string()
    .max(2000)
    .refine((value) => !value || isSafeImageUrl(value), "Use an HTTPS image URL."),
  address: z.string().trim().max(500),
  mapsEmbedUrl: z
    .string()
    .max(3000)
    .refine(isGoogleMapsEmbed, "Use a Google Maps embed URL, without iframe HTML."),
  ga4Id: z
    .string()
    .trim()
    .regex(/^(G-[A-Z0-9]+)?$/, "Use a GA4 ID such as G-XXXXXXXXXX."),
  clarityId: z
    .string()
    .trim()
    .regex(/^[a-z0-9]*$/i, "Use only the Clarity project ID."),
  searchConsoleVerification: z
    .string()
    .trim()
    .max(300)
    .regex(/^[a-zA-Z0-9_-]*$/, "Use the verification value without HTML."),
});

export type ArticleInput = z.infer<typeof articleSchema>;
export type GalleryInput = z.infer<typeof gallerySchema>;
export type VideoInput = z.infer<typeof videoSchema>;
export type SiteSettings = z.infer<typeof settingsSchema>;
export type ContentRecord<T> = T & { id: string; createdAt?: string; updatedAt?: string };
export type Article = ContentRecord<ArticleInput>;
export type GalleryImage = ContentRecord<GalleryInput>;
export type Video = ContentRecord<VideoInput>;
export type CollectionName = "articles" | "gallery" | "videos";

export const defaultSettings: SiteSettings = {
  logoUrl: "/images/dlfly-logo.png",
  address: "Contact our team to arrange an office visit.",
  mapsEmbedUrl: "https://www.google.com/maps?q=DLFLY%20Overseas&output=embed",
  ga4Id: import.meta.env.VITE_GA4_MEASUREMENT_ID ?? "",
  clarityId: import.meta.env.VITE_CLARITY_PROJECT_ID ?? "",
  searchConsoleVerification: import.meta.env.VITE_GOOGLE_SITE_VERIFICATION ?? "",
};

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 100);
}
