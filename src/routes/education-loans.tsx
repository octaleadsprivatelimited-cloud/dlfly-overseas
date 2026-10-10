import { pageHead } from "@/lib/seo";
import { createFileRoute } from "@tanstack/react-router";
import { ServicePage, SiteLayout } from "@/components/dlfly-site";

export const Route = createFileRoute("/education-loans")({
  head: () =>
    pageHead(
      "Education Loans for Overseas Study | DLFLY Overseas",
      "Plan overseas study costs and explore education loan options with practical document guidance from DLFLY Overseas.",
      "/education-loans",
      "/images/service-loans.jpg",
    ),
  component: EducationLoansPage,
});

function EducationLoansPage() {
  return (
    <SiteLayout>
      <ServicePage service="loans" />
    </SiteLayout>
  );
}
