import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { ContactPage, SiteLayout } from "@/components/dlfly-site";

export const Route = createFileRoute("/contact")({
  head: () =>
    pageHead(
      "Contact DLFLY Overseas | Speak with an Advisor",
      "Contact DLFLY Overseas to discuss your study abroad, visa, residency or education finance plans.",
      "/contact",
      "/images/dlfly-study.jpg",
    ),
  component: ContactRoutePage,
});

function ContactRoutePage() {
  return (
    <SiteLayout>
      <ContactPage />
    </SiteLayout>
  );
}
