import { ArrowUpRight } from "lucide-react";
import { destinationEnquiryLink, studyDestinations } from "@/data/study-destinations";

function DestinationLink({ code, name }: { code: string; name: string }) {
  return (
    <a
      href={destinationEnquiryLink(name)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Discuss studying in ${name} on WhatsApp (opens in a new tab)`}
      className="brand-destination-card group flex h-full min-h-20 min-w-0 flex-col items-center gap-1.5 rounded-lg border border-border bg-card py-2 transition-colors hover:border-primary hover:bg-secondary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:min-h-0 sm:flex-row sm:gap-2 sm:rounded-xl sm:p-3 lg:gap-4 lg:p-4"
    >
      <span className="flex h-[25px] w-10 shrink-0 items-center justify-center sm:h-7 sm:w-11 lg:h-10 lg:w-16">
        <img
          src={`/images/flags/${code}.svg`}
          alt={`Flag of ${name}`}
          width={64}
          height={40}
          loading="lazy"
          className="h-full w-full object-contain"
        />
      </span>
      <span className="flex min-h-7 w-full min-w-0 flex-1 items-center justify-center sm:min-h-0 sm:justify-between sm:gap-1 lg:gap-2">
        <span className="font-display text-center text-[10px] font-extrabold leading-[14px] min-[360px]:text-[11px] sm:text-left sm:text-[13px] sm:leading-5 md:text-sm lg:text-base">
          {name}
        </span>
        <ArrowUpRight
          className="hidden size-3 shrink-0 text-primary sm:block lg:size-4"
          aria-hidden="true"
        />
      </span>
    </a>
  );
}

export function StudyDestinations() {
  return (
    <section
      id="study-destinations"
      aria-labelledby="study-destinations-heading"
      className="brand-dark brand-destinations scroll-mt-28 border-b border-border"
    >
      <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 sm:py-12">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary sm:mb-3">
          Find your destination
        </p>
        <h2
          id="study-destinations-heading"
          className="font-display text-xl font-extrabold leading-tight sm:text-3xl"
        >
          Explore your study destinations
        </h2>
        <p className="mt-3 max-w-3xl text-xs leading-5 text-muted-foreground sm:text-base sm:leading-6">
          Choose a country to discuss your course interests, application preparation and next steps
          with our team.
        </p>
        <ul className="-mx-3 mt-4 grid grid-cols-4 gap-1 sm:mx-0 sm:mt-6 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
          {studyDestinations.map((destination) => (
            <li key={destination.code} className="min-w-0 lg:[&:nth-last-child(-n+2)]:col-span-2">
              <DestinationLink {...destination} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
