import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Mail, Phone, X } from "lucide-react";
import { SiteBrand } from "./site-brand";

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" className="size-7" fill="currentColor" aria-hidden="true">
      <path d="M16 3A13 13 0 0 0 4.8 22.6L3 29l6.6-1.7A13 13 0 1 0 16 3Zm0 2.5a10.5 10.5 0 1 1-5.7 19.3l-.5-.3-3.7 1 1-3.6-.3-.5A10.5 10.5 0 0 1 16 5.5Zm-4.8 5.1c-.3 0-.7.1-1 .4-.3.3-1.2 1.2-1.2 2.8s1.2 3.1 1.4 3.3c.2.2 2.4 3.7 5.9 5.1 2.9 1.2 3.5.9 4.1.8.6-.1 1.9-.8 2.2-1.6.3-.8.3-1.5.2-1.6-.1-.1-.3-.2-.7-.4l-2.3-1.1c-.3-.1-.6-.2-.8.2l-1.1 1.3c-.2.2-.4.3-.7.1-.3-.2-1.4-.5-2.6-1.6-.9-.8-1.6-1.8-1.8-2.1-.2-.3 0-.5.1-.7l.5-.6.3-.5c.1-.2 0-.4 0-.6l-1.1-2.6c-.2-.5-.5-.5-.7-.5h-.7Z" />
    </svg>
  );
}

export function FloatingContact() {
  const [open, setOpen] = useState(false);
  const [footerContactVisible, setFooterContactVisible] = useState(false);
  const [contactFormVisible, setContactFormVisible] = useState(false);
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const reduced = useReducedMotion();
  useEffect(() => {
    const footerContact = document.getElementById("footer-contact-actions");
    const contactForm = document.getElementById("contact-form");
    let active = true;
    setContactFormVisible(false);
    setFooterContactVisible(false);
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              if (!active) return;
              for (const entry of entries) {
                if (entry.target === footerContact)
                  setFooterContactVisible(entry.isIntersecting && entry.intersectionRatio >= 1);
                if (entry.target === contactForm) {
                  setContactFormVisible(entry.isIntersecting);
                  if (entry.isIntersecting) setOpen(false);
                }
              }
            },
            { threshold: [0, 1] },
          )
        : undefined;
    if (footerContact) observer?.observe(footerContact);
    if (contactForm) observer?.observe(contactForm);
    return () => {
      active = false;
      observer?.disconnect();
    };
  }, [pathname]);
  return (
    <div
      className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex-col items-end gap-3 sm:right-6 ${contactFormVisible || (footerContactVisible && !open) ? "hidden" : "flex"}`}
    >
      <AnimatePresence>
        {open && (
          <motion.aside
            key="contact"
            initial={reduced ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="w-[min(300px,calc(100vw-2rem))] rounded-xl border border-border bg-card p-5 shadow-xl"
            aria-label="Contact DLFLY Overseas"
          >
            <div className="flex items-center justify-between">
              <SiteBrand />
              <button
                className="grid size-10 place-items-center rounded-md hover:bg-muted"
                aria-label="Close contact options"
                onClick={() => setOpen(false)}
              >
                <X className="size-4" />
              </button>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Share your plans. We’ll help you find a practical next step.
            </p>
            <a
              href="tel:+916304636998"
              className="mt-4 flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              <Phone className="size-4" /> Call +91 6304636998
            </a>
            <a
              href="mailto:dlflyoverseas@gmail.com"
              className="mt-2 flex min-h-11 items-center gap-2 break-all text-sm text-primary"
            >
              <Mail className="size-4 shrink-0" /> dlflyoverseas@gmail.com
            </a>
          </motion.aside>
        )}
      </AnimatePresence>
      <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-3">
        <button
          aria-label={open ? "Hide DLFLY contact options" : "Open DLFLY contact options"}
          aria-expanded={open}
          onClick={() => setOpen(!open)}
          className="rounded-full bg-card p-2 shadow-lg ring-1 ring-border"
        >
          <SiteBrand compact />
        </button>
        <a
          href="https://wa.me/916304636998?text=Hello%20DLFLY%20Overseas%2C%20I%20would%20like%20to%20discuss%20my%20plans."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with DLFLY Overseas on WhatsApp"
          className="flex min-h-14 min-w-14 items-center justify-center gap-2 rounded-full bg-[#128c4a] px-4 text-white shadow-lg transition-colors hover:bg-[#087a3d] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <WhatsAppIcon />
          <span className="hidden text-sm font-bold sm:inline">Chat with us</span>
        </a>
      </div>
    </div>
  );
}
