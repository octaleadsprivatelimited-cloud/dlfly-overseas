import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { HomePage, SiteLayout } from "@/components/dlfly-site";

export const Route = createFileRoute("/")({
  component: Index,
  head: () =>
    pageHead(
      "DLFLY Overseas | Study Abroad & Visa Guidance",
      "Plan your future abroad with DLFLY Overseas. Get guidance for international study, visas, permanent residency and education loans.",
      "/",
      "/images/dlfly-study.jpg",
    ),
});

function Index() {
  return (
    <SiteLayout>
      <HomePage />
    </SiteLayout>
  );
}
