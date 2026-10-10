import { Check, ChevronDown } from "lucide-react";
import { serviceDetails } from "@/data/service-details";
import { Reveal } from "./reveal";

export function ServiceProcess({ service }: { service: keyof typeof serviceDetails }) {
  const detail = serviceDetails[service];
  return (
    <>
      <section id="service-process" className="brand-cool service-process-background scroll-mt-28">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
          <Reveal className="max-w-4xl rounded-2xl border border-white/70 bg-white/90 p-5 backdrop-blur-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Your process, step by step
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
              {detail.heading}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {detail.introduction}
            </p>
          </Reveal>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {detail.process.map(([title, text], index) => (
              <Reveal
                key={title}
                delay={(index % 3) * 0.06}
                className="brand-dark brand-journey-card rounded-xl border border-border bg-card p-5 sm:p-6"
              >
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-extrabold text-primary">
                  0{index + 1}
                </span>
                <h3 className="mt-4 font-display text-lg font-extrabold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-9 sm:px-6 sm:py-12 lg:grid-cols-2 lg:gap-10">
          <div
            id="service-checklist"
            className="brand-gold scroll-mt-28 rounded-xl border border-border p-5 sm:p-6"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Prepare for your conversation
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
              A useful starting checklist.
            </h2>
            <ul className="mt-5 divide-y divide-border">
              {detail.checklist.map((item) => (
                <li key={item} className="flex gap-3 py-3 text-sm leading-6">
                  <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div id="service-faqs" className="scroll-mt-28 py-1 lg:py-6">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">
              Common questions
            </p>
            <h2 className="mt-3 font-display text-2xl font-extrabold sm:text-3xl">
              Know what comes next.
            </h2>
            <div className="mt-5 divide-y divide-border border-y border-border">
              {detail.faqs.map(([question, answer]) => (
                <details key={question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                    <span>{question}</span>
                    <ChevronDown
                      className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
