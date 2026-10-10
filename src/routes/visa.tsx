import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { ServicePage, SiteLayout } from "@/components/dlfly-site";

export const Route = createFileRoute("/visa")({
  head: () =>
    pageHead(
      "Visa Application Guidance | DLFLY Overseas",
      "Get organised for your visa application with destination-specific document and preparation guidance from DLFLY Overseas.",
      "/visa",
      "/images/service-visa.jpg",
    ),
  component: VisaPage,
});

function VisaPage() {
  return (
    <SiteLayout>
      <ServicePage service="visa" />
    </SiteLayout>
  );
}
