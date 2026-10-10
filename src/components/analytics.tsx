import { Link, useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useSiteSettings } from "@/context/site-settings";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
    clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  }
}
const CONSENT_KEY = "dlfly-analytics-consent";
function loadScript(id: string, source: string) {
  if (document.getElementById(id)) return;
  const script = document.createElement("script");
  script.id = id;
  script.src = source;
  script.async = true;
  document.head.appendChild(script);
}

function safeReferrer(value: string) {
  try {
    const url = new URL(value);
    return url.origin + url.pathname;
  } catch {
    return "";
  }
}

export function Analytics() {
  const { ga4Id, clarityId } = useSiteSettings();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const [consent, setConsent] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const configuredGa = useRef("");
  const lastPage = useRef("");
  useEffect(() => {
    try {
      setConsent(localStorage.getItem(CONSENT_KEY));
    } catch {
      setConsent(null);
    }
    setLoaded(true);
    const reopen = () => setConsent(null);
    window.addEventListener("dlfly-cookie-preferences", reopen);
    return () => window.removeEventListener("dlfly-cookie-preferences", reopen);
  }, []);
  useEffect(() => {
    if (!loaded || pathname.startsWith("/admin") || consent !== "granted") return;
    if (ga4Id) {
      window.dataLayer ??= [];
      window.gtag ??= function (..._args: unknown[]) {
        // gtag.js recognises command entries as Arguments objects.
        // eslint-disable-next-line prefer-rest-params
        window.dataLayer?.push(arguments);
      };
      if (configuredGa.current !== ga4Id) {
        window.gtag("consent", "default", {
          analytics_storage: "granted",
          ad_storage: "denied",
          ad_user_data: "denied",
          ad_personalization: "denied",
        });
        window.gtag("js", new Date());
        // Page views are sent once per public route below; disable automatic history views in GA4.
        window.gtag("config", ga4Id, { send_page_view: false, allow_google_signals: false });
        loadScript(
          "dlfly-ga4",
          `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`,
        );
        configuredGa.current = ga4Id;
      }
      window[`ga-disable-${ga4Id}`] = false;
      window.gtag("consent", "update", { analytics_storage: "granted" });
      const pageKey = `${ga4Id}:${pathname}`;
      if (lastPage.current !== pageKey) {
        window.gtag("event", "page_view", {
          send_to: ga4Id,
          page_location: window.location.origin + pathname,
          page_title: document.title,
          page_referrer: safeReferrer(document.referrer),
        });
        lastPage.current = pageKey;
      }
    }
    if (clarityId) {
      window.clarity ??= Object.assign(
        (...args: unknown[]) => {
          window.clarity?.q?.push(args);
        },
        { q: [] as unknown[][] },
      );
      window.clarity("consentv2", { analytics_Storage: "granted", ad_Storage: "denied" });
      loadScript("dlfly-clarity", `https://www.clarity.ms/tag/${encodeURIComponent(clarityId)}`);
    }
  }, [clarityId, consent, ga4Id, loaded, pathname]);
  useEffect(() => {
    if (consent === "denied" || pathname.startsWith("/admin")) {
      if (ga4Id) window[`ga-disable-${ga4Id}`] = true;
      lastPage.current = "";
      window.gtag?.("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      window.clarity?.("consentv2", { analytics_Storage: "denied", ad_Storage: "denied" });
    }
  }, [consent, ga4Id, pathname]);
  useEffect(() => {
    if (!loaded || consent !== "granted" || pathname.startsWith("/admin")) return;
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest("a");
      const href = link?.getAttribute("href") ?? "";
      const method = href.startsWith("tel:")
        ? "phone"
        : href.startsWith("mailto:")
          ? "email"
          : /^https:\/\/wa\.me\//.test(href)
            ? "whatsapp"
            : "";
      if (method) {
        if (ga4Id)
          window.gtag?.("event", "contact_click", {
            send_to: ga4Id,
            contact_method: method,
            page_path: pathname,
          });
        if (clarityId) window.clarity?.("event", `contact_${method}`);
      }
      const videoId = event.target.closest("[data-video-id]")?.getAttribute("data-video-id");
      if (videoId) {
        if (ga4Id)
          window.gtag?.("event", "video_start", {
            send_to: ga4Id,
            video_provider: "youtube",
            video_id: videoId,
            page_path: pathname,
          });
        if (clarityId) window.clarity?.("event", "video_start");
      }
    };
    document.addEventListener("click", onClick);
    const onEnquiry = () => {
      if (ga4Id)
        window.gtag?.("event", "generate_lead", {
          send_to: ga4Id,
          page_path: pathname,
        });
      if (clarityId) window.clarity?.("event", "enquiry_submitted");
    };
    window.addEventListener("dlfly-enquiry-submitted", onEnquiry);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("dlfly-enquiry-submitted", onEnquiry);
    };
  }, [clarityId, consent, ga4Id, loaded, pathname]);
  function choose(value: string) {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {
      /* Browser privacy settings may disable storage. */
    }
    setConsent(value);
    if (
      value === "denied" &&
      (document.getElementById("dlfly-ga4") || document.getElementById("dlfly-clarity"))
    )
      window.location.reload();
  }
  if (!loaded || consent !== null || pathname.startsWith("/admin") || (!ga4Id && !clarityId))
    return null;
  return (
    <aside
      className="fixed bottom-4 left-4 z-50 w-[min(420px,calc(100vw-2rem))] rounded-xl border border-border bg-card p-5 shadow-xl"
      aria-label="Analytics preferences"
    >
      <p className="font-display font-bold">Your analytics preferences</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Allow optional analytics to help improve this website. You can change your choice from the
        footer.{" "}
        <Link to="/privacy" className="underline">
          Privacy details
        </Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={() => choose("denied")}
          className="min-h-11 rounded-md border border-border px-4 text-sm font-semibold"
        >
          Decline
        </button>
        <button
          onClick={() => choose("granted")}
          className="min-h-11 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
        >
          Allow analytics
        </button>
      </div>
    </aside>
  );
}
