import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { ServicePage, SiteLayout } from "@/components/dlfly-site";

export const Route = createFileRoute("/dependent-visa")({
  head: () =>
    pageHead(
      "Dependent Visa Guidance | DLFLY Overseas",
      "Organise family relationship records, main applicant documents and dependent visa preparation with DLFLY Overseas.",
      "/dependent-visa",
      "/images/service-dependent-visa.jpg",
    ),
  component: DependentVisaPage,
});

function DependentVisaPage() {
  return (
    <SiteLayout>
      <ServicePage service="dependent" />
    </SiteLayout>
  );
}
