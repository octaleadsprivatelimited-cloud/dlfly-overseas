import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { AboutPage, SiteLayout } from "@/components/dlfly-site";

export const Route = createFileRoute("/about")({
  head: () =>
    pageHead(
      "About DLFLY Overseas | Education Guidance",
      "Meet DLFLY Overseas and learn about our thoughtful approach to study abroad, visa and education planning.",
      "/about",
      "/images/dlfly-study.jpg",
    ),
  component: AboutRoutePage,
});

function AboutRoutePage() {
  return (
    <SiteLayout>
      <AboutPage />
    </SiteLayout>
  );
}
