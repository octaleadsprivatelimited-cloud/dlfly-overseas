import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { ServicePage, SiteLayout } from "@/components/dlfly-site";

export const Route = createFileRoute("/visit-visa")({
  head: () =>
    pageHead(
      "Visit Visa Guidance | DLFLY Overseas",
      "Prepare for holidays and family visits abroad with travel-plan, document and visitor visa application guidance from DLFLY Overseas.",
      "/visit-visa",
      "/images/service-visit-visa.jpg",
    ),
  component: VisitVisaPage,
});

function VisitVisaPage() {
  return (
    <SiteLayout>
      <ServicePage service="visit" />
    </SiteLayout>
  );
}
