import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  ChevronDown,
  ChevronRight,
  CircleDollarSign,
  Compass,
  GraduationCap,
  Instagram,
  Menu,
  Mail,
  MessageCircle,
  Phone,
  Plane,
  ShieldCheck,
  Sparkles,
  UsersRound,
  X,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SiteBrand } from "./site-brand";
import { FloatingContact } from "./floating-contact";
import { ContactLocation } from "./contact-location";
import { ContactEnquirySection } from "./contact-form";
import { ServiceProcess } from "./service-process";
import { StudyDestinations } from "./study-destinations";
import { Reveal } from "./reveal";
import { Button } from "@/components/ui/button";
import { servicePresentation } from "@/data/service-presentation";
import { instagramUrl } from "@/lib/social-links";
import campusImage from "@/assets/dlfly-campus.jpg";
import studyImage from "@/assets/dlfly-study.jpg";
import visaImage from "@/assets/dlfly-visa.jpg";
import residencyImage from "@/assets/dlfly-residency.jpg";
import financeImage from "@/assets/dlfly-finance.jpg";

const phoneNumber = "+91 6304636998";
const telephoneLink = "tel:+916304636998";
const whatsappLink = "https://wa.me/916304636998";

const serviceLinks = [
  { to: "/study-abroad", title: "Study abroad", icon: GraduationCap },
  { to: "/visa", title: "Visa guidance", icon: Plane },
  { to: "/visit-visa", title: "Visit visa", icon: Compass },
  { to: "/dependent-visa", title: "Dependent visa", icon: UsersRound },
  { to: "/permanent-residency", title: "Permanent residency", icon: Compass },
  { to: "/education-loans", title: "Education loans", icon: CircleDollarSign },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const reducedMotion = useReducedMotion();
  useEffect(() => {
    if (!menuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [menuOpen]);
  return (
    <>
      <div className="brand-red hidden sm:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2 text-xs">
          <span>Your next chapter, with a clearer plan.</span>
          <a className="inline-flex items-center gap-2" href={telephoneLink}>
            <Phone className="size-3.5" aria-hidden="true" />
            Speak with an advisor <span className="font-semibold">{phoneNumber}</span>
          </a>
        </div>
      </div>
      <header className="site-header brand-dark sticky top-0 z-40 border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-3.5 sm:px-6">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5"
            aria-label="DLFLY Overseas home"
            onClick={() => setMenuOpen(false)}
          >
            <SiteBrand />
          </Link>
          <nav className="hidden items-center gap-5 xl:flex" aria-label="Main navigation">
            <Link to="/" activeOptions={{ exact: true }} className="nav-link">
              Home
            </Link>
            <div className="group relative">
              <Link to="/study-abroad" className="nav-link inline-flex items-center gap-1">
                Our services{" "}
                <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
              </Link>
              <div className="site-dropdown invisible absolute left-0 top-full w-64 translate-y-2 rounded-2xl border border-border p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                {serviceLinks.map(({ to, title, icon: Icon }) => (
                  <Link key={to} to={to} className="menu-link">
                    <Icon className="size-4 text-primary" /> {title}
                  </Link>
                ))}
              </div>
            </div>
            <Link to="/about" className="nav-link">
              About us
            </Link>
            <Link to="/articles" className="nav-link">
              Articles
            </Link>
            <Link to="/gallery" className="nav-link">
              Gallery
            </Link>
            <Link to="/videos" className="nav-link">
              Videos
            </Link>
            <Link to="/contact" className="nav-link">
              Contact
            </Link>
          </nav>
          <div className="hidden items-center gap-3 xl:flex">
            <a href={telephoneLink} className="text-sm font-semibold text-foreground">
              {phoneNumber}
            </a>
            <Button asChild className="rounded-full px-5">
              <a href={whatsappLink} target="_blank" rel="noreferrer">
                Free consultation <ArrowUpRight />
              </a>
            </Button>
          </div>
          <div className="flex items-center gap-2 xl:hidden">
            <Button
              asChild
              variant="outline"
              size="icon"
              className="rounded-full border-border bg-transparent text-foreground hover:bg-secondary"
              aria-label="Call DLFLY Overseas"
            >
              <a href={telephoneLink}>
                <Phone />
              </a>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-border bg-transparent text-foreground hover:bg-secondary"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              disabled={!ready}
              onClick={() => setMenuOpen((current) => !current)}
            >
              {menuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.nav
              id="mobile-navigation"
              initial={reducedMotion ? false : { opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="site-dropdown absolute inset-x-0 top-full max-h-[calc(100dvh-5rem)] overflow-y-auto border-t border-border px-5 py-4 shadow-xl xl:hidden"
              aria-label="Mobile navigation"
            >
              <div className="mx-auto grid max-w-7xl gap-1">
                <Link to="/" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  Home
                </Link>
                <button
                  type="button"
                  className="mobile-nav-link flex w-full items-center justify-between text-left"
                  onClick={() => setServicesOpen(!servicesOpen)}
                  aria-expanded={servicesOpen}
                  aria-controls="mobile-services"
                >
                  Our services{" "}
                  <ChevronDown
                    className={`size-4 transition-transform ${servicesOpen ? "rotate-180" : ""}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {servicesOpen && (
                    <motion.div
                      id="mobile-services"
                      className="overflow-hidden border-l-2 border-accent pl-2"
                      initial={reducedMotion ? false : { height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      {serviceLinks.map(({ to, title }) => (
                        <Link
                          key={to}
                          to={to}
                          className="mobile-nav-link"
                          onClick={() => setMenuOpen(false)}
                        >
                          {title}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <Link to="/about" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  About us
                </Link>
                <Link to="/articles" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  Articles
                </Link>
                <Link to="/gallery" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  Gallery
                </Link>
                <Link to="/videos" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  Videos
                </Link>
                <Link to="/contact" className="mobile-nav-link" onClick={() => setMenuOpen(false)}>
                  Contact
                </Link>
                <a
                  className="mt-3 flex items-center gap-2 border-t border-border pt-4 font-semibold text-primary"
                  href={telephoneLink}
                >
                  <Phone className="size-4" /> {phoneNumber}
                </a>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

export function SiteFooter() {
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return (
    <footer className="site-footer">
      <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] md:gap-8 md:py-10">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 md:block">
          <Link to="/" className="inline-flex items-center gap-3" aria-label="DLFLY Overseas home">
            <SiteBrand />
          </Link>
          <p className="mt-3 hidden max-w-sm text-sm leading-6 text-muted-foreground md:block">
            Thoughtful guidance for your journey to study, work and build a future abroad.
          </p>
          <a
            href={instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow DLFLY Overseas on Instagram (opens in a new tab)"
            className="mt-1 inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-foreground md:mt-2"
          >
            <Instagram className="size-4 shrink-0" aria-hidden="true" /> Instagram
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </a>
        </div>
        <div>
          <h2 className="mb-1 text-xs font-bold uppercase tracking-wider md:mb-2">Services</h2>
          <nav
            aria-label="Footer services"
            className="grid grid-cols-2 gap-x-3 text-sm text-muted-foreground md:grid-cols-1"
          >
            {serviceLinks.map(({ to, title }) => (
              <Link
                key={to}
                to={to}
                className="inline-flex min-h-10 items-center hover:text-foreground"
              >
                {title}
              </Link>
            ))}
          </nav>
        </div>
        <div
          id="footer-contact-actions"
          className="grid grid-cols-[1.1fr_0.9fr] items-center gap-2 md:block"
        >
          <h2 className="mb-2 hidden text-xs font-bold uppercase tracking-wider md:block">
            Let’s talk
          </h2>
          <a
            href={telephoneLink}
            className="inline-flex min-h-10 items-center gap-1.5 whitespace-nowrap text-[13px] font-bold sm:text-base md:text-lg"
          >
            <Phone className="size-3.5 shrink-0 md:size-4" /> {phoneNumber}
          </a>
          <p className="mt-2 hidden text-sm text-muted-foreground md:block">
            Call us to start a conversation.
          </p>
          <Button
            asChild
            variant="secondary"
            className="min-h-10 rounded-full px-3 text-[13px] md:mt-4 md:px-4 md:text-sm"
          >
            <a href={whatsappLink} target="_blank" rel="noreferrer">
              WhatsApp <ArrowUpRight />
            </a>
          </Button>
        </div>
      </div>
      <div className="footer-legal border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-0 px-5 py-2 text-[11px] leading-4 text-muted-foreground sm:px-6 md:flex-row md:flex-wrap md:items-center md:gap-x-6 md:py-3 md:text-xs">
          <span>© {new Date().getFullYear()} DLFLY Overseas. All rights reserved.</span>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-0">
            <Link to="/privacy" className="inline-flex min-h-8 items-center">
              Privacy
            </Link>
            <button
              disabled={!ready}
              className="min-h-8"
              onClick={() => window.dispatchEvent(new Event("dlfly-cookie-preferences"))}
            >
              Cookie preferences
            </button>
            <a href="/admin" className="inline-flex min-h-8 items-center">
              Admin
            </a>
          </div>
          <span>
            Developed by{" "}
            <a
              href="https://www.octaleads.com"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-foreground underline underline-offset-4"
            >
              Octaleads
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-public">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SiteFooter />
      <FloatingContact />
    </div>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.19em] text-primary">
      {children}
    </p>
  );
}

export function PageBanner({
  eyebrow,
  title,
  description,
  image = studyImage,
  imageAlt = "Students planning an international education journey",
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="brand-dark border-b border-border">
      <div className="mx-auto grid max-w-7xl items-center gap-7 px-5 py-9 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10 lg:py-12">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-primary/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary">
            {eyebrow}
          </p>
          <h1 className="max-w-3xl font-display text-3xl font-extrabold leading-tight text-foreground sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">{description}</p>
          <Button asChild className="mt-6 rounded-full px-6">
            <a href={whatsappLink} target="_blank" rel="noreferrer">
              Talk to an advisor <ArrowUpRight />
            </a>
          </Button>
        </div>
        <div className="relative overflow-hidden rounded-3xl">
          <img
            src={image}
            alt={imageAlt}
            width={1536}
            height={1024}
            className="aspect-[16/10] w-full object-cover"
          />
          <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-2xl bg-white p-4 text-sm font-semibold text-brand-ink">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-primary">
              <GraduationCap className="size-5" />
            </span>
            Your ambitions. Our guidance. A practical plan.
          </div>
        </div>
      </div>
    </section>
  );
}

export const serviceContent = {
  study: {
    eyebrow: "Study abroad",
    title: "Find your course. Build your future.",
    description:
      "Find a course and campus that fit your ambitions, with practical guidance from your first shortlist to departure day.",
    icon: GraduationCap,
    intro:
      "Your international education journey should feel exciting—not overwhelming. We help you make thoughtful choices at every step, from selecting a destination to getting ready for your first day on campus.",
    points: [
      "Course and university shortlisting",
      "Application document guidance",
      "Application timeline planning",
      "Pre-departure preparation",
    ],
  },
  visa: {
    eyebrow: "Visa guidance",
    title: "Prepare with a clearer plan.",
    description:
      "Get organised, understand what your application needs, and move forward with a clearer plan for your next destination.",
    icon: Plane,
    intro:
      "Visa processes can feel complicated when requirements, timelines and paperwork all come at once. We help you understand the steps for your destination and prepare an application that is clear, complete and carefully organised.",
    points: [
      "Student visa application guidance",
      "Document and checklist support",
      "Application timeline planning",
      "Interview preparation guidance",
    ],
  },
  visit: {
    eyebrow: "Visit visa",
    title: "Plan a visit worth looking forward to.",
    description:
      "Prepare for holidays and visits to family or friends with a clear travel plan and an organised application checklist.",
    icon: Compass,
    intro:
      "A well-prepared visit starts with the purpose of your trip, where you will stay and how you will cover your costs. We help you organise these details around your destination’s official visitor requirements, so your application explains your plans clearly.",
    points: [
      "Travel purpose and itinerary planning",
      "Visitor document checklist support",
      "Invitation and funding preparation",
      "Appointment and submission planning",
    ],
  },
  dependent: {
    eyebrow: "Dependent visa",
    title: "Prepare for your next chapter together.",
    description:
      "Organise the documents and next steps for joining your partner or family abroad, guided by the requirements for their visa route.",
    icon: UsersRound,
    intro:
      "Joining family abroad involves connecting your relationship records with the main applicant’s immigration status and the destination’s rules. We help you organise the information, prepare questions about the appropriate route and coordinate the family’s application steps.",
    points: [
      "Family route preparation",
      "Relationship document organisation",
      "Main applicant and funding checklist",
      "Family application timeline planning",
    ],
  },
  residency: {
    eyebrow: "Permanent residency",
    title: "Get ready for your next chapter abroad.",
    description:
      "Explore residency possibilities and understand the preparation involved before taking your next step abroad.",
    icon: Compass,
    intro:
      "A long-term move begins with understanding your options. We can help you review your goals, learn about common migration pathways and organise questions to discuss with a qualified immigration professional.",
    points: [
      "Initial pathway orientation",
      "Profile and document organisation",
      "Planning for language and skills assessments",
      "Referral guidance for case-specific advice",
    ],
  },
  loans: {
    eyebrow: "Education loans",
    title: "Bring your study budget into focus.",
    description:
      "Understand the costs ahead and get support exploring education finance options for your international studies.",
    icon: CircleDollarSign,
    intro:
      "Planning the finances for an overseas education can be a big part of choosing where and what to study. We help you organise the costs, understand the documents lenders may request, and explore options that could fit your plans.",
    points: [
      "Study cost planning",
      "Education loan document checklist",
      "Loan option exploration",
      "Funding and application timeline support",
    ],
  },
} as const;

type ServiceKey = keyof typeof serviceContent;
const enquiryService = {
  study: "Study abroad",
  visa: "Visa guidance",
  visit: "Visit visa",
  dependent: "Dependent visa",
  residency: "Permanent residency",
  loans: "Education finance",
} as const;

export function ServicePage({ service }: { service: ServiceKey }) {
  const item = serviceContent[service];
  const presentation = servicePresentation[service];
  const Icon = item.icon;
  return (
    <>
      <section
        className="service-hero relative isolate overflow-hidden bg-background"
        aria-label={`${item.eyebrow} introduction`}
      >
        <img
          src={presentation.image}
          alt={presentation.imageAlt}
          fetchPriority="high"
          width={1200}
          height={800}
          className="service-hero-image block aspect-[3/2] w-full object-cover object-center sm:aspect-[16/7] lg:absolute lg:inset-0 lg:-z-10 lg:aspect-auto lg:h-full"
        />
        <div className="mx-auto flex max-w-7xl items-end px-5 py-6 sm:px-6 sm:py-8 lg:min-h-[580px] lg:items-center lg:py-12">
          <div className="service-hero-copy brand-dark brand-hero-panel w-full max-w-[580px] rounded-lg p-6 sm:p-8 lg:p-10">
            <nav
              aria-label="Breadcrumb"
              className="mb-6 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
            >
              <Link to="/" className="underline-offset-4 hover:underline">
                Home
              </Link>
              <ChevronRight className="size-3" aria-hidden="true" />
              <span>Services</span>
              <ChevronRight className="size-3" aria-hidden="true" />
              <span aria-current="page" className="text-foreground">
                {item.eyebrow}
              </span>
            </nav>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
              <Icon className="size-4 shrink-0" aria-hidden="true" /> DLFLY Overseas services
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
              {item.eyebrow}
            </h1>
            <p className="mt-4 font-display text-lg font-semibold leading-snug sm:text-xl">
              {item.title}
            </p>
            <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              {item.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="min-h-11 rounded-full px-5">
                <a href="#contact-form">
                  Enquire with our team <ArrowUpRight />
                </a>
              </Button>
              <Button asChild variant="outline" className="min-h-11 rounded-full px-5">
                <a href="#service-process">
                  Explore the process <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
      <nav aria-label="On this service page" className="brand-gold border-b border-border">
        <div className="mx-auto grid max-w-7xl grid-cols-3 px-3 sm:flex sm:flex-wrap sm:gap-x-6 sm:px-6">
          {[
            ["Overview", "service-overview"],
            ...(service === "study" ? [["Destinations", "study-destinations"]] : []),
            ["Our support", "service-support"],
            ["Process", "service-process"],
            ["Checklist", "service-checklist"],
            ["FAQs", "service-faqs"],
            ["Enquire", "contact-form"],
          ].map(([label, id]) => (
            <a
              key={id}
              href={`#${id}`}
              className="flex min-h-12 items-center justify-center border-b-2 border-transparent px-2 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary sm:justify-start sm:px-0 sm:text-sm"
            >
              {label}
            </a>
          ))}
        </div>
      </nav>
      <section id="service-overview" className="brand-cool service-overview scroll-mt-28">
        <div className="mx-auto grid max-w-7xl gap-7 px-5 py-9 sm:px-6 sm:py-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12">
          <div className="rounded-2xl border border-white/70 bg-white/80 p-5 backdrop-blur-sm sm:p-6">
            <SectionLabel>Overview</SectionLabel>
            <h2 className="max-w-2xl font-display text-2xl font-extrabold leading-tight sm:text-3xl">
              {presentation.overviewTitle}
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
              {item.intro}
            </p>
          </div>
          <aside
            className="rounded-2xl border border-white/70 bg-white/80 p-5 backdrop-blur-sm sm:p-6"
            aria-label="Your first conversation"
          >
            <h3 className="font-display text-base font-extrabold">Start with your goals</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Share a few details to make your first conversation useful.
            </p>
            <ul className="mt-4 grid gap-3">
              {presentation.startingPoints.map((point) => (
                <li key={point} className="flex items-start gap-2 text-sm leading-5">
                  <ChevronRight
                    className="mt-0.5 size-4 shrink-0 text-primary"
                    aria-hidden="true"
                  />{" "}
                  {point}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
      {service === "study" && <StudyDestinations />}
      <section id="service-support" className="scroll-mt-28">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
          <SectionLabel>Our support</SectionLabel>
          <h2 className="font-display text-2xl font-extrabold sm:text-3xl">
            How we help you move forward
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {item.points.map((point, index) => (
              <Reveal
                key={point}
                delay={index * 0.04}
                className="rounded-xl border border-border border-t-4 border-t-primary bg-card p-5"
              >
                <span className="text-xs font-bold text-primary">0{index + 1}</span>
                <h3 className="mt-3 font-display text-base font-extrabold leading-6">{point}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {presentation.support[index]}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <ServiceProcess service={service} />
      {service === "residency" && (
        <p className="site-section px-5 py-5 text-xs leading-6 text-muted-foreground sm:px-6">
          Immigration eligibility and requirements depend on your circumstances and may change.
          DLFLY Overseas provides general orientation and referral guidance, not legal or
          immigration advice.
        </p>
      )}
      <ContactEnquirySection initialService={enquiryService[service]} />
      <ContactStrip />
    </>
  );
}

export function ContactStrip() {
  return (
    <section className="brand-contact-strip text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-9 sm:px-6 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.17em]">
            Your plans deserve a conversation
          </p>
          <h2 className="mt-2 font-display text-2xl font-extrabold">
            Let’s make your next step count.
          </h2>
        </div>
        <Button
          asChild
          variant="secondary"
          className="w-fit rounded-full bg-brand-gold text-brand-ink hover:bg-brand-gold/90"
        >
          <a href={telephoneLink}>
            <Phone /> Call {phoneNumber} <ArrowUpRight />
          </a>
        </Button>
      </div>
    </section>
  );
}

export function ContactPage() {
  return (
    <>
      <PageBanner
        eyebrow="Contact DLFLY Overseas"
        title="Your next chapter starts with a conversation."
        description="Tell us about your goals. We’ll help you understand your options and prepare a practical plan for study, visa, residency or education finance."
        image={visaImage}
        imageAlt="Student and advisor discussing overseas study plans"
      />
      <ContactEnquirySection showImage />
      <ContactLocation />
      <ContactStrip />
    </>
  );
}

export function AboutPage() {
  const values = [
    {
      icon: BookOpenCheck,
      title: "Guidance with a plan",
      text: "A clearer sequence of next steps helps you move ahead with confidence.",
    },
    {
      icon: ShieldCheck,
      title: "Careful preparation",
      text: "Thoughtful document and timeline preparation helps take the guesswork out.",
    },
    {
      icon: Sparkles,
      title: "Your goals come first",
      text: "Start with your ambitions, then make choices that fit the future you want.",
    },
  ];
  return (
    <>
      <PageBanner
        eyebrow="About DLFLY Overseas"
        title="Big ambitions deserve thoughtful support."
        description="We help students and families approach international education and future planning with clarity, care and a practical plan."
        image={studyImage}
        imageAlt="Students walking through a university campus"
      />
      <section>
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-12 sm:px-6 sm:py-14 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <SectionLabel>Who we are</SectionLabel>
            <h2 className="font-display text-3xl font-extrabold">
              A steady hand for a big life decision.
            </h2>
            <p className="mt-5 text-base leading-7 text-muted-foreground">
              Planning to study or build a life abroad is a big undertaking. DLFLY Overseas brings
              key parts of that journey into one conversation—from choosing a course and preparing
              an application to understanding visa steps and exploring education finance.
            </p>
            <p className="mt-4 text-base leading-7 text-muted-foreground">
              We believe helpful guidance starts with listening. Your goals, your circumstances and
              your questions shape what comes next.
            </p>
          </div>
          <div className="grid gap-0 border-t-2 border-accent">
            {values.map(({ icon: Icon, title, text }, index) => (
              <div key={title} className="flex gap-5 border-b border-border py-6">
                <span className="font-display text-sm font-bold text-primary">0{index + 1}</span>
                <div>
                  <h3 className="font-display font-extrabold">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
                <Icon className="ml-auto size-5 shrink-0 text-primary" />
              </div>
            ))}
          </div>
        </div>
      </section>
      <Reveal className="site-section brand-dark">
        <div className="mx-auto grid max-w-7xl items-center gap-7 px-5 py-9 sm:px-6 sm:py-12 lg:grid-cols-2">
          <div>
            <SectionLabel>How we work</SectionLabel>
            <h2 className="font-display text-3xl font-extrabold">
              Listen. Organise. Prepare. Support.
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
              We start by understanding your ambitions and circumstances. Together, we organise the
              research, documents and timelines that matter, explain the next steps clearly and help
              you prepare for conversations with institutions, lenders and qualified professionals.
              You stay involved in every decision.
            </p>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted-foreground">
              Our support covers study abroad planning, visa preparation, general residency
              orientation and education finance organisation. Universities, immigration authorities
              and lenders make their own decisions; we focus on careful preparation and clear
              communication.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/contact">
                Meet your next step <ArrowRight />
              </Link>
            </Button>
          </div>
          <img
            src={visaImage}
            alt="An advisor and student organising a study plan"
            width={1536}
            height={1024}
            loading="lazy"
            className="aspect-[4/3] w-full rounded-2xl object-cover"
          />
        </div>
      </Reveal>
      <ContactStrip />
    </>
  );
}

export function HomePage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = [
    {
      image: studyImage,
      alt: "Indian students walking through a modern university campus",
      eyebrow: "Make your world bigger",
      title: (
        <>
          Your future has
          <br className="hidden sm:block" /> no borders.
        </>
      ),
      text: "Choose your course, prepare your application and plan your move with guidance at every step.",
      action: "Study abroad",
      to: "/study-abroad",
    },
    {
      image: visaImage,
      alt: "Student and advisor reviewing an overseas application",
      eyebrow: "A clearer way forward",
      title: (
        <>
          One plan for
          <br className="hidden sm:block" /> every next step.
        </>
      ),
      text: "Get practical help with visa requirements, documents and the next steps in your application.",
      action: "Visa guidance",
      to: "/visa",
    },
    {
      image: residencyImage,
      alt: "Indian couple planning a future abroad",
      eyebrow: "Think beyond today",
      title: (
        <>
          Build a future
          <br className="hidden sm:block" /> that feels yours.
        </>
      ),
      text: "Explore pathways abroad and organise your preparation around your goals.",
      action: "Residency",
      to: "/permanent-residency",
    },
  ] as const;
  const currentSlide = slides[activeSlide] ?? slides[0];
  useEffect(() => {
    const timer = window.setInterval(
      () => setActiveSlide((index) => (index + 1) % slides.length),
      6500,
    );
    return () => window.clearInterval(timer);
  }, [slides.length]);
  const services = [
    {
      icon: GraduationCap,
      title: "Study abroad",
      text: "Find your course, university and next steps.",
      to: "/study-abroad",
    },
    {
      icon: Plane,
      title: "Visa guidance",
      text: "Get organised with clear application guidance.",
      to: "/visa",
    },
    {
      icon: Compass,
      title: "Visit visa",
      text: "Prepare your travel plans and visitor application.",
      to: "/visit-visa",
    },
    {
      icon: UsersRound,
      title: "Dependent visa",
      text: "Plan the next steps to join your family abroad.",
      to: "/dependent-visa",
    },
    {
      icon: BriefcaseBusiness,
      title: "Permanent residency",
      text: "Explore pathways and plan your preparation.",
      to: "/permanent-residency",
    },
    {
      icon: CircleDollarSign,
      title: "Education loans",
      text: "Explore study budgets and funding options.",
      to: "/education-loans",
    },
  ];
  return (
    <>
      <section
        className="home-hero group/hero relative isolate overflow-hidden bg-brand-ink lg:min-h-[600px] lg:bg-secondary"
        aria-roledescription="carousel"
        aria-label="DLFLY Overseas highlights"
      >
        <img
          src={currentSlide.image}
          alt={currentSlide.alt}
          fetchPriority="high"
          width={1536}
          height={1024}
          className="home-hero-image block aspect-[3/2] w-full object-cover object-[65%_center] sm:aspect-[16/7] lg:absolute lg:inset-0 lg:-z-10 lg:aspect-auto lg:h-full"
        />
        <div className="mx-auto flex max-w-7xl items-center px-5 py-6 sm:px-6 sm:py-8 lg:min-h-[600px] lg:py-14">
          <div className="home-hero-copy brand-dark brand-hero-panel w-full max-w-[550px] rounded-2xl p-4 shadow-lg sm:p-8">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] sm:text-xs">
              <Sparkles className="size-3.5" /> {currentSlide.eyebrow}
            </p>
            <h1 className="font-display text-[32px] font-extrabold leading-[1.12] sm:text-5xl lg:text-[52px]">
              {currentSlide.title}
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              {currentSlide.text}
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
              <Button
                asChild
                variant="default"
                size="lg"
                className="h-11 rounded-full px-2 text-xs sm:px-5 sm:text-sm"
              >
                <Link to={currentSlide.to}>
                  {currentSlide.action} <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-11 rounded-full border-border bg-transparent px-2 text-xs text-foreground hover:bg-secondary sm:px-5 sm:text-sm"
              >
                <a href={telephoneLink}>
                  <Phone /> Call us
                </a>
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs leading-5 text-muted-foreground sm:text-sm">
              <BadgeCheck className="size-4 shrink-0" /> Study · Visa · Residency · Education
              finance
            </p>
          </div>
        </div>
      </section>

      <StudyDestinations />

      <section>
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-6 sm:py-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <SectionLabel>Ways we can support you</SectionLabel>
              <h2 className="max-w-2xl font-display text-3xl font-extrabold leading-tight sm:text-4xl">
                One team for the steps that matter.
              </h2>
            </div>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary"
            >
              Talk to our team <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map(({ icon: Icon, title, text, to }, index) => (
              <Link
                key={title}
                to={to}
                className={`brand-service-card group overflow-hidden rounded-2xl p-5 transition-shadow hover:shadow-lg ${["brand-dark", "brand-red", "brand-cool", "brand-gold"][index % 4]}`}
              >
                <div className="flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-full bg-secondary text-primary">
                    <Icon className="size-5" />
                  </span>
                  <span className="font-display text-sm font-bold text-muted-foreground">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-lg font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                  Explore{" "}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="brand-journey">
        <div className="mx-auto grid max-w-7xl gap-9 px-5 py-12 sm:px-6 sm:py-14 md:grid-cols-[0.85fr_1.15fr] md:items-center">
          <div>
            <SectionLabel>A more considered journey</SectionLabel>
            <h2 className="font-display text-3xl font-extrabold leading-tight">
              From “what if?” to a plan that feels possible.
            </h2>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Your goals are the starting point. We help connect the choices, paperwork and
              practical preparation that make an international study plan feel more within reach.
            </p>
            <Button asChild className="mt-6 rounded-full">
              <Link to="/about">
                Get to know us <ArrowUpRight />
              </Link>
            </Button>
            <img
              src={financeImage}
              alt="Family discussing overseas education plans together"
              loading="lazy"
              width={1536}
              height={1024}
              className="mt-6 aspect-[16/9] w-full rounded-2xl object-cover"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: GraduationCap,
                title: "Explore",
                text: "Clarify what you want to study and where.",
              },
              {
                icon: BookOpenCheck,
                title: "Prepare",
                text: "Build a focused plan for your application.",
              },
              {
                icon: ShieldCheck,
                title: "Organise",
                text: "Understand the documents and timelines.",
              },
              {
                icon: Sparkles,
                title: "Get ready",
                text: "Take practical steps toward your next chapter.",
              },
            ].map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="brand-journey-card rounded-2xl border border-border bg-card p-5 sm:p-7"
              >
                <Icon className="size-5 text-primary" />
                <h3 className="mt-4 font-display font-extrabold">{title}</h3>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Reveal className="site-section">
        <div className="mx-auto max-w-7xl px-5 py-9 sm:px-6 sm:py-12">
          <SectionLabel>Explore and prepare</SectionLabel>
          <h2 className="font-display text-3xl font-extrabold">More ways to get ready.</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {[
              {
                to: "/articles",
                title: "Practical articles",
                text: "Read planning guides for applications, documents and education finance.",
              },
              {
                to: "/gallery",
                title: "Our gallery",
                text: "Explore the visuals behind your next chapter with DLFLY Overseas.",
              },
              {
                to: "/videos",
                title: "Video library",
                text: "Watch helpful videos selected by our team, at your own pace.",
              },
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to as "/articles" | "/gallery" | "/videos"}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <img
                  src={
                    item.to === "/articles"
                      ? financeImage
                      : item.to === "/gallery"
                        ? studyImage
                        : visaImage
                  }
                  alt=""
                  width={600}
                  height={400}
                  loading="lazy"
                  className="aspect-[16/9] w-full object-cover"
                />
                <div className="p-5">
                  <h3 className="font-display text-xl font-extrabold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.text}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary">
                    Explore <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>
      <ContactEnquirySection />
      <ContactStrip />
    </>
  );
}
