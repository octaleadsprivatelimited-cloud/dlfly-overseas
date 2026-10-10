import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { ServicePage, SiteLayout } from "@/components/dlfly-site";

export const Route = createFileRoute("/permanent-residency")({
  head: () =>
    pageHead(
      "Permanent Residency Guidance | DLFLY Overseas",
      "Explore general permanent residency pathways and plan your preparation with DLFLY Overseas.",
      "/permanent-residency",
      "/images/service-residency.jpg",
    ),
  component: PermanentResidencyPage,
});

function PermanentResidencyPage() {
  return (
    <SiteLayout>
      <ServicePage service="residency" />
    </SiteLayout>
  );
}
