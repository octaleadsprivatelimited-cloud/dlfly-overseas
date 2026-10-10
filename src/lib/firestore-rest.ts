import {
  articleSchema,
  defaultSettings,
  gallerySchema,
  settingsSchema,
  videoSchema,
  type Article,
  type CollectionName,
  type GalleryImage,
  type SiteSettings,
  type Video,
} from "./content";
import { initialArticles, initialGallery } from "../data/initial-content";

type FirestoreValue = {
  stringValue?: string;
  booleanValue?: boolean;
  integerValue?: string;
  timestampValue?: string;
};
type RestDocument = { name: string; fields?: Record<string, FirestoreValue> };

function decodeDocument(document: RestDocument) {
  const data: Record<string, unknown> = { id: document.name.split("/").at(-1) };
  for (const [key, value] of Object.entries(document.fields ?? {})) {
    data[key] =
      value.stringValue ??
      value.booleanValue ??
      value.timestampValue ??
      (value.integerValue === undefined ? null : Number(value.integerValue));
  }
  return data;
}

function apiConfig() {
  const project = import.meta.env.VITE_FIREBASE_PROJECT_ID;
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const emulator = import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true";
  return {
    project,
    apiKey,
    base: emulator ? "http://127.0.0.1:8080/v1" : "https://firestore.googleapis.com/v1",
  };
}

export async function readPublishedContent(
  name: CollectionName,
): Promise<(Article | GalleryImage | Video)[]> {
  const { project, apiKey, base } = apiConfig();
  const fallback = name === "articles" ? initialArticles : name === "gallery" ? initialGallery : [];
  if (!project || !apiKey) return fallback;
  try {
    const response = await fetch(
      `${base}/projects/${project}/databases/(default)/documents:runQuery?key=${encodeURIComponent(apiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: name }],
            where: {
              fieldFilter: {
                field: { fieldPath: "published" },
                op: "EQUAL",
                value: { booleanValue: true },
              },
            },
            limit: 100,
          },
        }),
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!response.ok) throw new Error(`Public content request failed (${response.status}).`);
    const rows = (await response.json()) as { document?: RestDocument }[];
    const schema =
      name === "articles" ? articleSchema : name === "gallery" ? gallerySchema : videoSchema;
    return rows
      .flatMap((row) => {
        if (!row.document) return [];
        const raw = decodeDocument(row.document);
        const parsed = schema.safeParse(raw);
        if (!parsed.success) return [];
        return [
          {
            ...parsed.data,
            id: String(raw["id"]),
            ...(typeof raw["updatedAt"] === "string" ? { updatedAt: raw["updatedAt"] } : {}),
          } as Article | GalleryImage | Video,
        ];
      })
      .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));
  } catch (error) {
    console.error("Unable to load public content", error);
    return [];
  }
}

export async function readSiteSettings(): Promise<SiteSettings> {
  const { project, apiKey, base } = apiConfig();
  if (!project || !apiKey) return defaultSettings;
  try {
    const response = await fetch(
      `${base}/projects/${project}/databases/(default)/documents/settings/site?key=${encodeURIComponent(apiKey)}`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (response.status === 404) return defaultSettings;
    if (!response.ok) throw new Error(`Site settings request failed (${response.status}).`);
    const parsed = settingsSchema.safeParse({
      ...defaultSettings,
      ...decodeDocument((await response.json()) as RestDocument),
    });
    return parsed.success ? parsed.data : defaultSettings;
  } catch (error) {
    console.error("Unable to load site settings", error);
    return defaultSettings;
  }
}

export async function readArticle(slug: string): Promise<Article | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const { project, apiKey, base } = apiConfig();
  if (!project || !apiKey) return initialArticles.find((article) => article.slug === slug) ?? null;
  try {
    const response = await fetch(
      `${base}/projects/${project}/databases/(default)/documents/articles/${encodeURIComponent(slug)}?key=${encodeURIComponent(apiKey)}`,
      { signal: AbortSignal.timeout(6000) },
    );
    if (response.status === 404 || response.status === 403) return null;
    if (!response.ok) throw new Error(`Article request failed (${response.status}).`);
    const raw = decodeDocument((await response.json()) as RestDocument);
    const parsed = articleSchema.safeParse(raw);
    if (!parsed.success || !parsed.data.published) return null;
    return {
      ...parsed.data,
      id: slug,
      ...(typeof raw["updatedAt"] === "string" ? { updatedAt: raw["updatedAt"] } : {}),
    };
  } catch (error) {
    console.error("Unable to load article", error);
    return null;
  }
}
