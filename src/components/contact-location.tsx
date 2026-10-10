import { MapPin, Mail, Instagram, ArrowUpRight } from "lucide-react";
import { useSiteSettings } from "@/context/site-settings";
import { instagramUrl } from "@/lib/social-links";
import { Reveal } from "./reveal";

export function ContactLocation() {
  const settings = useSiteSettings();
  return (
    <Reveal className="site-section">
      <div className="grid bg-card md:grid-cols-[0.8fr_1.2fr]">
        <div className="brand-dark p-6 sm:p-9">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Stay connected</p>
          <h2 className="mt-3 font-display text-2xl font-extrabold">
            Let’s talk about your future.
          </h2>
          <p className="mt-5 flex gap-3 text-sm leading-7 text-muted-foreground">
            <MapPin className="mt-1 size-5 shrink-0 text-primary" />
            {settings.address}
          </p>
          <a
            href="mailto:dlflyoverseas@gmail.com"
            className="mt-5 flex items-start gap-3 break-all text-sm font-semibold text-primary"
          >
            <Mail className="size-5 shrink-0" />
            dlflyoverseas@gmail.com
          </a>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow DLFLY Overseas on Instagram (opens in a new tab)"
            className="mt-3 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <Instagram className="size-5 shrink-0" aria-hidden="true" />
            @dlflyoverseas
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </a>
          <p className="mt-6 text-sm leading-6 text-muted-foreground">
            Please call before visiting so we can arrange time with the right advisor.
          </p>
        </div>
        {settings.mapsEmbedUrl ? (
          <iframe
            src={settings.mapsEmbedUrl}
            title="Find DLFLY Overseas on Google Maps"
            className="min-h-[320px] w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        ) : (
          <div className="grid min-h-[280px] place-items-center bg-secondary p-8 text-center text-sm text-muted-foreground">
            Call our team for directions and an appointment.
          </div>
        )}
      </div>
    </Reveal>
  );
}
