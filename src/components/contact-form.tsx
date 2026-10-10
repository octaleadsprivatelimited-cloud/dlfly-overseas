import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Mail, MessageCircle, Phone, Send } from "lucide-react";
import {
  enquiryCountries,
  enquirySchema,
  enquiryServiceOptions,
  submitEnquiry,
  type EnquirySubmission,
} from "@/lib/enquiries";
import { firebaseConfigured } from "@/lib/firebase";

type FormValues = Omit<EnquirySubmission, "consent" | "sourcePath"> & { consent: boolean };
type FieldName = keyof FormValues;
const inputClass =
  "min-h-12 w-full min-w-0 rounded-xl border border-input bg-background px-3 py-3 text-base text-foreground outline-none transition-shadow focus:ring-2 focus:ring-ring disabled:opacity-60";

export function ContactForm({
  initialService = "General enquiry",
}: {
  initialService?: EnquirySubmission["service"] | undefined;
}) {
  const id = useId();
  const sourcePath = useRouterState({ select: (state) => state.location.pathname });
  const formRef = useRef<HTMLFormElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const sending = useRef(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const [values, setValues] = useState<FormValues>({
    name: "",
    email: "",
    phone: "",
    service: initialService,
    country: "Not decided",
    message: "",
    consent: false,
  });
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [website, setWebsite] = useState("");

  function change<K extends FieldName>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
    setError("");
  }
  function fieldProps(field: FieldName) {
    return {
      id: `${id}-${field}`,
      name: field,
      "aria-invalid": Boolean(errors[field]),
      "aria-describedby": errors[field] ? `${id}-${field}-error` : undefined,
    };
  }
  function fieldError(field: FieldName) {
    return errors[field] ? (
      <p id={`${id}-${field}-error`} className="mt-1 text-sm text-destructive">
        {errors[field]}
      </p>
    ) : null;
  }
  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current || sent) return;
    setError("");
    const parsed = enquirySchema.safeParse({ ...values, sourcePath });
    if (!parsed.success) {
      const next: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName;
        if (!next[field]) next[field] = issue.message;
      }
      setErrors(next);
      setError("Please check the highlighted fields before sending.");
      const control = formRef.current?.elements.namedItem(
        parsed.error.issues[0]?.path[0] as string,
      );
      if (control instanceof HTMLElement) control.focus();
      return;
    }
    if (website.trim() || !navigator.onLine) {
      setError(
        "We couldn’t send your enquiry. Please check your connection and try again, or call our team.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
      return;
    }
    sending.current = true;
    setBusy(true);
    try {
      await submitEnquiry(parsed.data);
      setSent(true);
      setValues({
        name: "",
        email: "",
        phone: "",
        service: initialService,
        country: "Not decided",
        message: "",
        consent: false,
      });
      // Dispatch only a completion signal. Visitor values never enter analytics.
      window.dispatchEvent(new Event("dlfly-enquiry-submitted"));
      requestAnimationFrame(() => successRef.current?.focus());
    } catch {
      setError(
        "We couldn’t send your enquiry. Your details are still here. Please try again or call +91 6304636998.",
      );
      requestAnimationFrame(() => errorRef.current?.focus());
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  if (sent)
    return (
      <div
        ref={successRef}
        tabIndex={-1}
        role="status"
        className="rounded-2xl border border-primary/40 bg-secondary p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring"
        data-clarity-mask="True"
      >
        <CheckCircle2 className="size-9 text-primary" aria-hidden="true" />
        <h3 className="mt-4 font-display text-2xl font-extrabold">Your enquiry has been sent.</h3>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Our team can now review your plans and contact you using the details you provided.
        </p>
        <button
          onClick={() => {
            setSent(false);
            requestAnimationFrame(() =>
              (formRef.current?.elements.namedItem("name") as HTMLElement | null)?.focus(),
            );
          }}
          className="mt-5 min-h-11 rounded-full border border-border px-5 text-sm font-bold focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          Send another enquiry
        </button>
      </div>
    );

  return (
    <form
      ref={formRef}
      onSubmit={send}
      method="post"
      noValidate
      aria-label="Contact enquiry"
      aria-busy={busy}
      data-clarity-mask="True"
      className="mt-5"
    >
      <p className="mb-4 text-xs leading-6 text-muted-foreground">
        Name, email, phone, service and message are required.
      </p>
      <div className="absolute -left-[10000px]" aria-hidden="true">
        <label htmlFor={`${id}-website`}>Company website</label>
        <input
          id={`${id}-website`}
          name="companyWebsite"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      {error && (
        <p
          ref={errorRef}
          tabIndex={-1}
          role="alert"
          className="mb-4 rounded-xl border border-destructive/30 p-3 text-sm leading-6 text-destructive outline-none"
        >
          {error}
        </p>
      )}
      {!firebaseConfigured && (
        <p role="alert" className="mb-4 text-sm leading-6 text-muted-foreground">
          The enquiry form is temporarily unavailable. Please use the phone or WhatsApp links to
          contact us.
        </p>
      )}
      <fieldset
        disabled={!ready || busy}
        className="grid min-w-0 gap-4 border-0 p-0 sm:grid-cols-2"
      >
        <legend className="sr-only">Your contact details and plans</legend>
        <div className="min-w-0">
          <label htmlFor={`${id}-name`} className="mb-2 block text-sm font-bold">
            Full name
          </label>
          <input
            {...fieldProps("name")}
            value={values.name}
            onChange={(event) => change("name", event.target.value)}
            autoComplete="name"
            maxLength={100}
            required
            className={inputClass}
          />
          {fieldError("name")}
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-phone`} className="mb-2 block text-sm font-bold">
            Phone number
          </label>
          <input
            {...fieldProps("phone")}
            type="tel"
            value={values.phone}
            onChange={(event) => change("phone", event.target.value)}
            autoComplete="tel"
            maxLength={30}
            placeholder="Include your country code"
            required
            className={inputClass}
          />
          {fieldError("phone")}
        </div>
        <div className="min-w-0 sm:col-span-2">
          <label htmlFor={`${id}-email`} className="mb-2 block text-sm font-bold">
            Email address
          </label>
          <input
            {...fieldProps("email")}
            type="email"
            value={values.email}
            onChange={(event) => change("email", event.target.value)}
            autoComplete="email"
            maxLength={254}
            required
            className={inputClass}
          />
          {fieldError("email")}
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-service`} className="mb-2 block text-sm font-bold">
            Service you’re interested in
          </label>
          <select
            {...fieldProps("service")}
            value={values.service}
            onChange={(event) => change("service", event.target.value as FormValues["service"])}
            required
            className={`${inputClass} h-12`}
          >
            {enquiryServiceOptions.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          {fieldError("service")}
        </div>
        <div className="min-w-0">
          <label htmlFor={`${id}-country`} className="mb-2 block text-sm font-bold">
            Preferred destination
          </label>
          <select
            {...fieldProps("country")}
            value={values.country}
            onChange={(event) => change("country", event.target.value as FormValues["country"])}
            className={`${inputClass} h-12`}
          >
            {enquiryCountries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
          {fieldError("country")}
        </div>
        <div className="min-w-0 sm:col-span-2">
          <label htmlFor={`${id}-message`} className="mb-2 block text-sm font-bold">
            How can we help?
          </label>
          <textarea
            {...fieldProps("message")}
            value={values.message}
            onChange={(event) => change("message", event.target.value)}
            maxLength={2000}
            rows={4}
            required
            placeholder="Tell us about your plans and the guidance you need."
            className={`${inputClass} resize-y`}
          />
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            10–2,000 characters. Please leave out passport, financial and other sensitive details.
          </p>
          {fieldError("message")}
        </div>
        <div className="sm:col-span-2">
          <div className="flex items-start gap-3">
            <input
              {...fieldProps("consent")}
              type="checkbox"
              checked={values.consent}
              onChange={(event) => change("consent", event.target.checked)}
              required
              className="mt-1 size-5 shrink-0 accent-primary"
            />
            <label htmlFor={`${id}-consent`} className="text-sm leading-6">
              I agree to DLFLY Overseas contacting me about this enquiry.{" "}
              <Link
                to="/privacy"
                className="font-semibold text-primary underline underline-offset-4"
              >
                Privacy details
              </Link>
              .
            </label>
          </div>
          {fieldError("consent")}
        </div>
        <button
          type="submit"
          disabled={!ready || !firebaseConfigured || busy}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:opacity-60 sm:col-span-2"
        >
          {!ready ? "Loading form…" : busy ? "Sending your enquiry…" : "Send enquiry"}
          <Send className="size-4" aria-hidden="true" />
        </button>
      </fieldset>
    </form>
  );
}

export function ContactEnquirySection({
  initialService,
  showImage = false,
}: {
  initialService?: EnquirySubmission["service"];
  showImage?: boolean;
}) {
  return (
    <section id="contact-form" aria-labelledby="contact-form-heading" className="scroll-mt-28">
      <div className="grid bg-card lg:grid-cols-[0.8fr_1.2fr]">
        <div className="brand-dark relative isolate flex flex-col justify-between overflow-hidden p-6 sm:p-8 lg:p-10">
          {showImage ? (
            <>
              <img
                src="/images/dlfly-study.jpg"
                alt="Students starting their international university journey"
                width={1536}
                height={1024}
                loading="lazy"
                className="absolute inset-0 -z-20 size-full object-cover"
              />
              <div className="absolute inset-0 -z-10 bg-brand-ink/85" />
            </>
          ) : (
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,#265e88_0%,transparent_65%),linear-gradient(145deg,#0c1c36,#173453)]"
            />
          )}
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.17em] text-primary">
              A conversation can change your next step
            </p>
            <h2
              id="contact-form-heading"
              className="mt-4 max-w-sm font-display text-3xl font-extrabold leading-tight sm:text-4xl"
            >
              Let’s find your way forward.
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
              Share your plans and questions. We’ll help you explore your options and organise the
              next steps with a clearer plan.
            </p>
            <div className="mt-6 flex items-center gap-3 rounded-xl border border-white/20 bg-white/5 p-4 text-sm leading-6">
              <CheckCircle2 className="size-6 shrink-0 text-primary" aria-hidden="true" />
              Your enquiry goes directly to the DLFLY team.
            </div>
          </div>
          <div className="mt-8 grid gap-3">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Prefer a conversation now?
            </p>
            <a
              href="tel:+916304636998"
              className="flex min-h-11 items-center gap-3 text-sm font-bold text-primary"
            >
              <Phone className="size-5 shrink-0" />
              +91 6304636998
            </a>
            <a
              href="https://wa.me/916304636998"
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-11 items-center gap-3 text-sm font-bold text-primary"
            >
              <MessageCircle className="size-5 shrink-0" />
              Chat on WhatsApp
              <ArrowRight className="size-4" />
            </a>
            <a
              href="mailto:dlflyoverseas@gmail.com"
              className="flex min-h-11 items-center gap-3 text-sm font-bold text-primary"
            >
              <Mail className="size-5 shrink-0" />
              <span className="min-w-0 break-all">dlflyoverseas@gmail.com</span>
            </a>
          </div>
        </div>
        <div className="min-w-0 p-5 sm:p-8 lg:p-10">
          <p className="text-xs font-bold uppercase tracking-[0.17em] text-primary">
            Connect with an advisor
          </p>
          <h3 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
            Tell us about your plans.
          </h3>
          <ContactForm initialService={initialService} />
        </div>
      </div>
    </section>
  );
}
