import { useEffect, useState } from "react";
import { ArrowUpRight, Inbox, Mail, Phone, RefreshCw, Save } from "lucide-react";
import {
  enquiryStatuses,
  enquiryUpdateSchema,
  subscribeEnquiries,
  updateEnquiry,
  type EnquiryRecord,
  type EnquiryStatus,
} from "@/lib/enquiries";

const statusLabels: Record<EnquiryStatus, string> = {
  new: "New",
  contacted: "Contacted",
  closed: "Closed",
};
const statusClasses: Record<EnquiryStatus, string> = {
  new: "border-primary/25 bg-primary/10 text-primary",
  contacted: "border-blue-200 bg-blue-50 text-blue-900",
  closed: "border-border bg-muted text-muted-foreground",
};
const inputClass =
  "w-full rounded-md border border-input bg-background px-3 py-3 text-base outline-none focus:ring-2 focus:ring-ring disabled:opacity-60";

function errorMessage(error: unknown, action: "load" | "save") {
  const code =
    typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  if (code === "permission-denied")
    return "Your admin session cannot access enquiries. Sign out and sign in again with the approved Google account.";
  if (code === "unavailable")
    return "Enquiries are temporarily unavailable. Check your connection and try again.";
  if (
    error instanceof Error &&
    error.message === "Some enquiries could not be loaded because their saved data is invalid."
  )
    return error.message;
  return action === "load"
    ? "Could not load enquiries. Please try again."
    : "Could not save this enquiry. Your changes are still here; please try again.";
}

function dateValue(timestamp: EnquiryRecord["createdAt"]) {
  if (!timestamp || typeof timestamp.toDate !== "function") return null;
  try {
    const date = timestamp.toDate();
    return Number.isFinite(date.getTime()) ? date : null;
  } catch {
    return null;
  }
}

function EnquiryTime({ timestamp }: { timestamp: EnquiryRecord["createdAt"] }) {
  const date = dateValue(timestamp);
  if (!date) return <span>Time unavailable</span>;
  return (
    <time dateTime={date.toISOString()}>
      {new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }).format(date)}
    </time>
  );
}

function StatusBadge({ status }: { status: EnquiryStatus }) {
  return (
    <span
      className={`inline-flex w-fit shrink-0 rounded-full border px-2.5 py-1 text-xs font-bold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

function EnquiryDetails({ enquiry }: { enquiry: EnquiryRecord }) {
  const [form, setForm] = useState({
    status: enquiry.status,
    notes: enquiry.notes,
    savedStatus: enquiry.status,
    savedNotes: enquiry.notes,
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notesError, setNotesError] = useState("");
  const [notice, setNotice] = useState("");
  const dirty = form.status !== form.savedStatus || form.notes !== form.savedNotes;

  useEffect(() => {
    // A realtime update refreshes a clean editor without discarding unsaved notes.
    // Ignore optimistic snapshots during a save so a rejected write preserves the draft.
    if (busy) return;
    setForm((current) => {
      const pristine =
        current.status === current.savedStatus && current.notes === current.savedNotes;
      return {
        status: pristine ? enquiry.status : current.status,
        notes: pristine ? enquiry.notes : current.notes,
        savedStatus: enquiry.status,
        savedNotes: enquiry.notes,
      };
    });
  }, [enquiry.status, enquiry.notes, busy]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setNotesError("");
    setNotice("");
    const parsed = enquiryUpdateSchema.safeParse({ status: form.status, notes: form.notes });
    if (!parsed.success) {
      const notesIssue = parsed.error.issues.find((issue) => issue.path[0] === "notes");
      if (notesIssue) setNotesError(notesIssue.message);
      else setError("Choose a valid enquiry status before saving.");
      return;
    }
    setBusy(true);
    try {
      await updateEnquiry(enquiry.id, parsed.data);
      setForm({
        ...parsed.data,
        savedStatus: parsed.data.status,
        savedNotes: parsed.data.notes,
      });
      setNotice("Enquiry updated. The visitor's original submission is preserved.");
    } catch (error) {
      setError(errorMessage(error, "save"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      aria-labelledby="enquiry-details-title"
      className="min-w-0 rounded-xl border border-border bg-card p-5 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Enquiry details
          </p>
          <h3
            id="enquiry-details-title"
            className="mt-2 break-words font-display text-xl font-extrabold [overflow-wrap:anywhere] sm:text-2xl"
          >
            {enquiry.name}
          </h3>
        </div>
        <StatusBadge status={enquiry.status} />
      </div>
      <dl className="mt-6 grid min-w-0 gap-5 text-sm sm:grid-cols-2">
        <div className="min-w-0">
          <dt className="font-semibold text-muted-foreground">Email</dt>
          <dd className="mt-1">
            <a
              href={`mailto:${enquiry.email}`}
              className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-sm text-primary underline decoration-primary/30 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <Mail className="size-4 shrink-0" aria-hidden="true" />
              <span className="break-all">{enquiry.email}</span>
            </a>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold text-muted-foreground">Phone</dt>
          <dd className="mt-1">
            <a
              href={`tel:${enquiry.phone.trim().startsWith("+") ? "+" : ""}${enquiry.phone.replace(/\D/g, "")}`}
              className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-sm text-primary underline decoration-primary/30 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <Phone className="size-4 shrink-0" aria-hidden="true" />
              <span className="break-all">{enquiry.phone}</span>
            </a>
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold text-muted-foreground">Service</dt>
          <dd className="mt-1 break-words">{enquiry.service}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold text-muted-foreground">Destination</dt>
          <dd className="mt-1 break-words">{enquiry.country}</dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold text-muted-foreground">Submitted (India time)</dt>
          <dd className="mt-1">
            <EnquiryTime timestamp={enquiry.createdAt} />
          </dd>
        </div>
        <div className="min-w-0">
          <dt className="font-semibold text-muted-foreground">Last updated (India time)</dt>
          <dd className="mt-1">
            <EnquiryTime timestamp={enquiry.updatedAt} />
          </dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="font-semibold text-muted-foreground">Submitted from</dt>
          <dd className="mt-1">
            <a
              href={enquiry.sourcePath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 max-w-full items-center gap-2 rounded-sm text-primary underline decoration-primary/30 underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
            >
              <span className="break-all">{enquiry.sourcePath}</span>
              <ArrowUpRight className="size-4 shrink-0" aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="font-semibold text-muted-foreground">Visitor's message</dt>
          <dd className="mt-2 whitespace-pre-wrap break-words rounded-lg bg-muted/70 p-4 leading-6 [overflow-wrap:anywhere]">
            {enquiry.message}
          </dd>
        </div>
        <div className="min-w-0 sm:col-span-2">
          <dt className="font-semibold text-muted-foreground">Contact consent</dt>
          <dd className="mt-1 leading-6">The visitor agreed to be contacted about this enquiry.</dd>
        </div>
      </dl>
      <form onSubmit={save} className="mt-7 grid gap-5 border-t border-border pt-6">
        <label className="grid gap-2 text-sm font-semibold" htmlFor="enquiry-status">
          Follow-up status
          <select
            id="enquiry-status"
            className={`${inputClass} h-12`}
            value={form.status}
            disabled={busy}
            onChange={(event) => {
              setForm((current) => ({ ...current, status: event.target.value as EnquiryStatus }));
              setNotice("");
              setError("");
            }}
          >
            {enquiryStatuses.map((status) => (
              <option key={status} value={status}>
                {statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold" htmlFor="enquiry-notes">
          Private follow-up notes
          <textarea
            id="enquiry-notes"
            className={inputClass}
            rows={5}
            maxLength={2000}
            value={form.notes}
            disabled={busy}
            aria-invalid={notesError ? true : undefined}
            aria-describedby={`enquiry-notes-hint${notesError ? " enquiry-notes-error" : ""}`}
            onChange={(event) => {
              setForm((current) => ({ ...current, notes: event.target.value }));
              setNotice("");
              setError("");
              setNotesError("");
            }}
          />
          <span
            id="enquiry-notes-hint"
            className="text-xs font-normal leading-5 text-muted-foreground"
          >
            Visible only to the admin. Saving does not send a reply. {form.notes.length}/2,000
            characters.
          </span>
        </label>
        {notesError && (
          <p id="enquiry-notes-error" role="alert" className="text-sm text-destructive">
            {notesError}
          </p>
        )}
        <p className="text-xs leading-6 text-muted-foreground">
          Choose Contacted after following up, or Closed when no further action is needed. The
          original submission stays read-only.
        </p>
        {error && (
          <p
            role="alert"
            className="rounded-md bg-destructive/10 p-4 text-sm leading-6 text-destructive"
          >
            {error}
          </p>
        )}
        {notice && (
          <p role="status" className="rounded-md bg-secondary p-4 text-sm leading-6">
            {notice}
          </p>
        )}
        <button
          type="submit"
          disabled={busy || !dirty}
          className="inline-flex min-h-12 w-fit items-center gap-2 rounded-md bg-primary px-5 font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-60"
        >
          <Save className="size-4" aria-hidden="true" />
          {busy ? "Saving…" : "Save enquiry"}
        </button>
      </form>
    </section>
  );
}

export function EnquiriesManager() {
  const [items, setItems] = useState<EnquiryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | EnquiryStatus>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    let stop: (() => void) | undefined;
    setLoading(true);
    setError("");
    function fail(error: unknown) {
      if (!active) return;
      setError(errorMessage(error, "load"));
      setLoading(false);
    }
    try {
      stop = subscribeEnquiries((records) => {
        if (!active) return;
        setItems(records);
        setLoading(false);
        setError("");
      }, fail);
    } catch (error) {
      fail(error);
    }
    return () => {
      active = false;
      stop?.();
    };
  }, [retry]);

  const visibleItems = filter === "all" ? items : items.filter((item) => item.status === filter);
  const selected = items.find((item) => item.id === selectedId);

  return (
    <div className="grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
      <section aria-labelledby="enquiries-title" className="min-w-0">
        <h2 id="enquiries-title" className="font-display text-2xl font-extrabold">
          Website enquiries
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Contact form submissions appear here, newest first. Review the latest 100 enquiries and
          record your follow-up privately.
        </p>
        <div
          aria-label="Filter enquiries by status"
          role="group"
          className="mt-5 flex flex-wrap gap-2"
        >
          {(["all", ...enquiryStatuses] as const).map((status) => {
            const count =
              status === "all"
                ? items.length
                : items.filter((item) => item.status === status).length;
            return (
              <button
                key={status}
                type="button"
                aria-pressed={filter === status}
                onClick={() => setFilter(status)}
                className={`inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${filter === status ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground"}`}
              >
                {status === "all" ? "All" : statusLabels[status]}
                <span className="text-xs font-semibold">{count}</span>
              </button>
            );
          })}
        </div>
        {error && (
          <div className="mt-5 rounded-lg border border-destructive/25 bg-destructive/10 p-4">
            <p role="alert" className="text-sm leading-6 text-destructive">
              {error}
            </p>
            <button
              type="button"
              onClick={() => setRetry((current) => current + 1)}
              disabled={loading}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-semibold disabled:opacity-60"
            >
              <RefreshCw className="size-4" aria-hidden="true" />
              Retry loading
            </button>
          </div>
        )}
        {loading ? (
          <p role="status" className="mt-5 rounded-lg border border-border bg-card p-5 text-sm">
            Loading enquiries…
          </p>
        ) : visibleItems.length ? (
          <ul
            aria-label="Enquiry inbox"
            className="mt-5 grid max-h-[32rem] min-w-0 gap-3 overflow-y-auto overscroll-contain p-1"
          >
            {visibleItems.map((item) => (
              <li key={item.id} className="min-w-0">
                <button
                  type="button"
                  aria-label={`View enquiry from ${item.name}`}
                  aria-pressed={selectedId === item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full min-w-0 rounded-lg border p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${selectedId === item.id ? "border-primary bg-secondary" : "border-border bg-card hover:border-primary/50"}`}
                >
                  <span className="flex min-w-0 items-start justify-between gap-3">
                    <span className="min-w-0 break-words font-semibold [overflow-wrap:anywhere]">
                      {item.name}
                    </span>
                    <StatusBadge status={item.status} />
                  </span>
                  <span className="mt-2 block break-words text-sm leading-5">
                    {item.service} · {item.country}
                  </span>
                  <span className="mt-2 block text-xs leading-5 text-muted-foreground">
                    <EnquiryTime timestamp={item.createdAt} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : !error ? (
          <p
            role="status"
            className="mt-5 rounded-lg border border-border bg-card p-5 text-sm leading-6 text-muted-foreground"
          >
            {items.length
              ? `No ${statusLabels[filter as EnquiryStatus].toLowerCase()} enquiries in the latest 100 submissions.`
              : "No enquiries yet. New website contact form submissions will appear here."}
          </p>
        ) : null}
        {!loading && items.length === 100 && (
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Showing the latest 100 submissions. Status filters apply to these enquiries.
          </p>
        )}
      </section>
      {selected ? (
        <EnquiryDetails key={selected.id} enquiry={selected} />
      ) : (
        <section
          aria-label="Enquiry details"
          className="min-w-0 rounded-xl border border-dashed border-border bg-card p-6 text-center sm:p-10"
        >
          <Inbox className="mx-auto size-9 text-muted-foreground" aria-hidden="true" />
          <h3 className="mt-4 font-display text-xl font-extrabold">Select an enquiry</h3>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Open a submission to view the full message, contact details and private follow-up notes.
          </p>
        </section>
      )}
    </div>
  );
}
