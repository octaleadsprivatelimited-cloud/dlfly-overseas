import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { LogOut, Plus, Save, Trash2, Upload } from "lucide-react";
import { ADMIN_EMAIL, isAdminSession } from "@/lib/admin-access";
import { firebaseConfigured, getFirebaseClients } from "@/lib/firebase";
import {
  articleSchema,
  defaultSettings,
  gallerySchema,
  settingsSchema,
  slugify,
  videoSchema,
  type CollectionName,
  type SiteSettings,
} from "@/lib/content";
import { useSiteSettings } from "@/context/site-settings";
import { SiteBrand } from "./site-brand";
import { EnquiriesManager } from "./enquiries-manager";
import { initialArticles, initialGallery } from "@/data/initial-content";

type Tab = CollectionName | "enquiries" | "settings";
type Values = Record<string, string | boolean>;
type Item = { id: string; title: string; published: boolean; [key: string]: unknown };
const emptyValues: Record<CollectionName, Values> = {
  articles: {
    title: "",
    slug: "",
    excerpt: "",
    body: "",
    category: "Study abroad",
    coverUrl: "",
    published: false,
  },
  gallery: { title: "", imageUrl: "", alt: "", caption: "", published: false },
  videos: { title: "", youtubeUrl: "", description: "", published: false },
};
const fields: Record<
  CollectionName,
  { key: string; label: string; multiline?: boolean; rows?: number; hint?: string }[]
> = {
  articles: [
    { key: "title", label: "Article title" },
    {
      key: "slug",
      label: "Article URL slug",
      hint: "Lowercase words separated by hyphens. The URL stays fixed after creation.",
    },
    { key: "excerpt", label: "Summary", multiline: true },
    { key: "coverUrl", label: "Cover image URL" },
    { key: "body", label: "Article content (Markdown)", multiline: true, rows: 14 },
  ],
  gallery: [
    { key: "title", label: "Image title" },
    { key: "imageUrl", label: "Image URL" },
    {
      key: "alt",
      label: "Alternative text",
      hint: "Describe what the image shows for visitors using screen readers.",
    },
    { key: "caption", label: "Caption", multiline: true },
  ],
  videos: [
    { key: "title", label: "Video title" },
    { key: "youtubeUrl", label: "YouTube URL or video ID" },
    { key: "description", label: "Video description", multiline: true },
  ],
};
const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring";
function message(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function ImageUploader({
  onUploaded,
  setError,
}: {
  onUploaded: (url: string) => void;
  setError: (error: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  if (import.meta.env.VITE_ENABLE_STORAGE_UPLOADS !== "true") return null;
  return (
    <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold">
      <Upload className="size-4" />
      {busy ? "Uploading…" : "Upload an image"}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        disabled={busy}
        className="sr-only"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          if (
            file.size > 5 * 1024 * 1024 ||
            !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)
          ) {
            setError("Choose a JPG, PNG, WebP or GIF image up to 5 MB.");
            return;
          }
          setBusy(true);
          setError("");
          try {
            const extension = file.type.split("/")[1] ?? "jpg";
            const location = ref(
              getFirebaseClients().storage,
              `media/${crypto.randomUUID()}.${extension}`,
            );
            await uploadBytes(location, file, { contentType: file.type });
            onUploaded(await getDownloadURL(location));
          } catch {
            setError(
              "Image upload is unavailable. You can enter an HTTPS image URL. Firebase Storage must be enabled for uploads.",
            );
          } finally {
            setBusy(false);
            event.target.value = "";
          }
        }}
      />
    </label>
  );
}

function ContentManager({ tab }: { tab: CollectionName }) {
  const [items, setItems] = useState<Item[]>([]);
  const [values, setValues] = useState<Values>({ ...emptyValues[tab] });
  const [editing, setEditing] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  useEffect(
    () =>
      onSnapshot(
        query(collection(getFirebaseClients().db, tab), limit(100)),
        (snapshot) => {
          setItems(snapshot.docs.map((item) => ({ ...item.data(), id: item.id }) as Item));
        },
        (error) => setError(message(error)),
      ),
    [tab],
  );
  function change(key: string, value: string | boolean) {
    setValues((current) => ({
      ...current,
      [key]: value,
      ...(key === "title" &&
      !editing &&
      tab === "articles" &&
      current["slug"] === slugify(String(current["title"] ?? ""))
        ? { slug: slugify(String(value)) }
        : {}),
    }));
  }
  function reset() {
    setValues({ ...emptyValues[tab] });
    setEditing(null);
    setError("");
    setNotice("");
  }
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotice("");
    const schema =
      tab === "articles" ? articleSchema : tab === "gallery" ? gallerySchema : videoSchema;
    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      setError(
        parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n"),
      );
      return;
    }
    setBusy(true);
    try {
      const { db } = getFirebaseClients();
      const id = editing ?? (tab === "articles" ? String(values["slug"]) : crypto.randomUUID());
      const target = doc(db, tab, id);
      if (editing)
        await setDoc(target, { ...parsed.data, updatedAt: serverTimestamp() }, { merge: true });
      else
        await runTransaction(db, async (transaction) => {
          if ((await transaction.get(target)).exists())
            throw new Error("This URL is already used. Choose a different slug.");
          transaction.set(target, {
            ...parsed.data,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
      setEditing(id);
      setNotice(
        values["published"]
          ? "Saved and published. The public website updates automatically."
          : "Draft saved. It is visible only to you.",
      );
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="grid min-w-0 gap-8 lg:grid-cols-[0.7fr_1.3fr]">
      <section className="min-w-0">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-extrabold">Your {tab}</h2>
          <button
            onClick={reset}
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-border px-3 font-semibold"
          >
            <Plus className="size-4" />
            New
          </button>
        </div>
        <div className="mt-5 grid gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className={`rounded-lg border p-4 ${editing === item.id ? "border-primary bg-secondary" : "border-border bg-card"}`}
            >
              <button
                className="w-full text-left"
                onClick={() => {
                  const next = { ...emptyValues[tab] };
                  for (const key of Object.keys(next))
                    if (typeof item[key] === "string" || typeof item[key] === "boolean")
                      next[key] = item[key] as string | boolean;
                  setValues(next);
                  setEditing(item.id);
                  setNotice("");
                  setError("");
                }}
              >
                <span className="block font-semibold">{item.title}</span>
                <span className="mt-1 block text-xs text-muted-foreground">
                  {item.published ? "Published" : "Draft"}
                </span>
              </button>
              <button
                className="mt-3 inline-flex min-h-10 items-center gap-2 text-sm text-destructive"
                aria-label={`Delete ${item.title}`}
                disabled={busy}
                onClick={async () => {
                  if (!window.confirm(`Delete “${item.title}”? This removes it from the website.`))
                    return;
                  setBusy(true);
                  try {
                    await deleteDoc(doc(getFirebaseClients().db, tab, item.id));
                    if (editing === item.id) reset();
                  } catch (error) {
                    setError(message(error));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>
          ))}
          {!items.length && (
            <p className="rounded-lg bg-muted p-5 text-sm leading-6 text-muted-foreground">
              Create your first item. Keep it as a draft until you are ready to publish.
            </p>
          )}
        </div>
      </section>
      <form onSubmit={save} className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-8">
        <h2 className="mb-6 font-display text-xl font-extrabold">
          {editing ? "Edit item" : "Create item"}
        </h2>
        <div className="grid gap-5">
          {fields[tab].map((field) => (
            <label key={field.key} className="grid gap-2 text-sm font-semibold">
              {field.label}
              {field.multiline ? (
                <textarea
                  className={inputClass}
                  rows={field.rows ?? 3}
                  value={String(values[field.key] ?? "")}
                  onChange={(event) => change(field.key, event.target.value)}
                  required={field.key === "body" || field.key === "excerpt"}
                />
              ) : (
                <input
                  className={inputClass}
                  value={String(values[field.key] ?? "")}
                  onChange={(event) => change(field.key, event.target.value)}
                  disabled={field.key === "slug" && Boolean(editing)}
                  required
                />
              )}
              {field.hint && (
                <span className="text-xs font-normal leading-5 text-muted-foreground">
                  {field.hint}
                </span>
              )}
            </label>
          ))}
          {tab === "articles" && (
            <label className="grid gap-2 text-sm font-semibold">
              Category
              <select
                className={inputClass}
                value={String(values["category"])}
                onChange={(event) => change("category", event.target.value)}
              >
                {articleSchema.shape.category.options.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          )}
          {tab !== "videos" && (
            <ImageUploader
              onUploaded={(url) => change(tab === "gallery" ? "imageUrl" : "coverUrl", url)}
              setError={setError}
            />
          )}
          <label className="flex min-h-11 items-center gap-3 text-sm font-semibold">
            <input
              type="checkbox"
              className="size-5 accent-primary"
              checked={Boolean(values["published"])}
              onChange={(event) => change("published", event.target.checked)}
            />
            Publish on the website
          </label>
          <p className="text-xs leading-5 text-muted-foreground">
            Uncheck to keep this item as a private draft.
          </p>
          {error && (
            <p
              role="alert"
              className="whitespace-pre-line rounded-md bg-destructive/10 p-4 text-sm text-destructive"
            >
              {error}
            </p>
          )}
          {notice && (
            <p role="status" className="rounded-md bg-secondary p-4 text-sm">
              {notice}
            </p>
          )}
          <button
            type="submit"
            disabled={busy}
            className="inline-flex min-h-12 w-fit items-center gap-2 rounded-md bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-60"
          >
            <Save className="size-4" />
            {busy ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

function SettingsManager() {
  const live = useSiteSettings();
  const [values, setValues] = useState<SiteSettings>(live);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const labels: Record<keyof SiteSettings, string> = {
    logoUrl: "Official logo image URL",
    address: "Office address",
    mapsEmbedUrl: "Google Maps embed URL",
    ga4Id: "GA4 measurement ID",
    clarityId: "Microsoft Clarity project ID",
    searchConsoleVerification: "Google Search Console verification value",
  };
  useEffect(() => {
    setValues(live);
  }, [live]);
  return (
    <form
      className="max-w-3xl rounded-xl border border-border bg-card p-5 sm:p-8"
      onSubmit={async (event) => {
        event.preventDefault();
        setError("");
        setNotice("");
        const parsed = settingsSchema.safeParse(values);
        if (!parsed.success) {
          setError(
            parsed.error.issues
              .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
              .join("\n"),
          );
          return;
        }
        setBusy(true);
        try {
          await setDoc(doc(getFirebaseClients().db, "settings", "site"), {
            ...parsed.data,
            updatedAt: serverTimestamp(),
          });
          setNotice(
            "Settings saved. The website updates automatically. Reload public pages to confirm search verification metadata.",
          );
        } catch (error) {
          setError(message(error));
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="font-display text-2xl font-extrabold">Website settings</h2>
      <p className="mt-3 text-sm leading-7 text-muted-foreground">
        Use the company’s approved logo and office location. Tracking IDs are public configuration;
        never enter an account password or secret key.
      </p>
      <div className="mt-7 grid gap-5">
        {(Object.keys(labels) as (keyof SiteSettings)[]).map((key) => (
          <label key={key} className="grid gap-2 text-sm font-semibold">
            {labels[key]}
            <input
              className={inputClass}
              value={values[key]}
              onChange={(event) =>
                setValues((current) => ({ ...current, [key]: event.target.value }))
              }
            />
          </label>
        ))}
        <ImageUploader
          onUploaded={(url) => setValues((current) => ({ ...current, logoUrl: url }))}
          setError={setError}
        />
        <p className="text-xs leading-6 text-muted-foreground">
          For Maps, paste only the src URL from Google Maps → Share → Embed a map. GA4 IDs begin
          with G-. Analytics load after visitor consent. Keep page views and browser-history
          tracking enabled in your GA4 web stream.
        </p>
        {error && (
          <p role="alert" className="whitespace-pre-line text-sm text-destructive">
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="text-sm text-primary">
            {notice}
          </p>
        )}
        <button
          disabled={busy}
          className="inline-flex min-h-12 w-fit items-center gap-2 rounded-md bg-primary px-5 font-semibold text-primary-foreground"
        >
          <Save className="size-4" />
          {busy ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}

export function AdminPanel() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("articles");
  const [starterNotice, setStarterNotice] = useState("");
  async function addStarterContent() {
    setBusy(true);
    setError("");
    try {
      const { db } = getFirebaseClients();
      const records = [
        ...initialArticles.map(({ id, ...data }) => ({ target: doc(db, "articles", id), data })),
        ...initialGallery.map(({ id, ...data }) => ({ target: doc(db, "gallery", id), data })),
        { target: doc(db, "settings", "site"), data: defaultSettings },
      ];
      await runTransaction(db, async (transaction) => {
        const existing = await Promise.all(records.map((record) => transaction.get(record.target)));
        records.forEach((record, index) => {
          if (!existing[index]?.exists())
            transaction.set(record.target, {
              ...record.data,
              ...(record.target.parent.id !== "settings" ? { createdAt: serverTimestamp() } : {}),
              updatedAt: serverTimestamp(),
            });
        });
      });
      setStarterNotice("Starter content is ready. Your existing items were preserved.");
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!firebaseConfigured) {
      setReady(true);
      return;
    }
    let active = true;
    const auth = getFirebaseClients().auth;
    const stop = onAuthStateChanged(auth, async (candidate) => {
      try {
        if (candidate) {
          const token = await candidate.getIdTokenResult();
          if (!isAdminSession(candidate.email, candidate.emailVerified, token.signInProvider)) {
            await signOut(auth);
            if (active)
              setError(`Admin access is available only to ${ADMIN_EMAIL} using Google sign-in.`);
            candidate = null;
          }
        }
        if (active) setUser(candidate);
      } catch (error) {
        if (active) {
          setUser(null);
          setError(message(error));
        }
      } finally {
        if (active) setReady(true);
      }
    });
    return () => {
      active = false;
      stop();
    };
  }, []);
  async function login() {
    setBusy(true);
    setError("");
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account", login_hint: ADMIN_EMAIL });
      await signInWithPopup(getFirebaseClients().auth, provider);
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
          <Link to="/" aria-label="DLFLY Overseas home">
            <SiteBrand />
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm font-semibold text-primary">
              View website
            </Link>
            {user && (
              <button
                onClick={() => signOut(getFirebaseClients().auth)}
                className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold"
              >
                <LogOut className="size-4" />
                Sign out
              </button>
            )}
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6">
        {!ready ? (
          <p role="status">Checking your session…</p>
        ) : !user ? (
          <section className="mx-auto mt-10 max-w-lg rounded-xl border border-border bg-card p-7 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              DLFLY website administration
            </p>
            <h1 className="mt-3 font-display text-3xl font-extrabold">Welcome back.</h1>
            <p className="mt-4 break-all text-sm leading-7 text-muted-foreground">
              Sign in with the verified Google account {ADMIN_EMAIL} to manage enquiries, articles,
              gallery images, videos and website settings.
            </p>
            {!firebaseConfigured && (
              <p role="status" className="mt-5 rounded-md bg-muted p-4 text-sm">
                Firebase configuration is required before admin sign-in can be enabled.
              </p>
            )}
            {error && (
              <p role="alert" className="mt-5 break-words text-sm text-destructive">
                {error}
              </p>
            )}
            <button
              onClick={login}
              disabled={busy || !firebaseConfigured}
              className="mt-7 min-h-12 w-full rounded-md bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-50"
            >
              {busy ? "Opening Google…" : "Sign in with Google"}
            </button>
          </section>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-primary">
                  Your content workspace
                </p>
                <h1 className="mt-3 font-display text-3xl font-extrabold">
                  Manage DLFLY Overseas.
                </h1>
              </div>
              <p className="break-all text-sm text-muted-foreground">{user.email}</p>
            </div>
            <nav
              aria-label="Admin sections"
              className="my-8 flex flex-wrap gap-2 border-b border-border pb-4"
            >
              {(["enquiries", "articles", "gallery", "videos", "settings"] as const).map((item) => (
                <button
                  key={item}
                  onClick={() => setTab(item)}
                  aria-current={tab === item ? "page" : undefined}
                  className={`min-h-11 rounded-md px-4 text-sm font-bold capitalize ${tab === item ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"}`}
                >
                  {item}
                </button>
              ))}
            </nav>
            {tab !== "enquiries" && (
              <details className="mb-8 rounded-lg border border-border p-4">
                <summary className="cursor-pointer font-semibold">Starter content</summary>
                <p className="my-3 text-sm leading-6 text-muted-foreground">
                  Add the prepared study, visa and finance articles and illustrative gallery images.
                  Existing items are preserved.
                </p>
                <button
                  onClick={addStarterContent}
                  disabled={busy}
                  className="min-h-11 rounded-md bg-secondary px-4 text-sm font-semibold"
                >
                  {busy ? "Adding…" : "Add starter articles and gallery"}
                </button>
                {starterNotice && (
                  <p role="status" className="mt-3 text-sm">
                    {starterNotice}
                  </p>
                )}
              </details>
            )}
            {error && (
              <p role="alert" className="mb-5 text-sm text-destructive">
                {error}
              </p>
            )}
            {tab === "enquiries" ? (
              <EnquiriesManager />
            ) : tab === "settings" ? (
              <SettingsManager />
            ) : (
              <ContentManager key={tab} tab={tab} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
