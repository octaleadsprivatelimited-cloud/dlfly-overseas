import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { ServicePage, SiteLayout } from "@/components/dlfly-site";

export const Route = createFileRoute("/study-abroad")({
  head: () =>
    pageHead(
      "Study Abroad Guidance | DLFLY Overseas",
      "Explore courses and universities abroad with practical application and pre-departure guidance from DLFLY Overseas.",
      "/study-abroad",
      "/images/service-study.jpg",
    ),
  component: StudyAbroadPage,
});

function StudyAbroadPage() {
  return (
    <SiteLayout>
      <ServicePage service="study" />
    </SiteLayout>
  );
}
