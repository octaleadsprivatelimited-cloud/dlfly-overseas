import { createFileRoute } from "@tanstack/react-router";
import { ArticlesPage } from "@/components/resources";
import { SiteLayout } from "@/components/dlfly-site";
import { loadArticles } from "@/lib/public-content";
import { pageHead } from "@/lib/seo";
import type { Article } from "@/lib/content";

export const Route = createFileRoute("/articles/")({
  loader: () => loadArticles(),
  head: () =>
    pageHead(
      "Articles & Planning Guides | DLFLY Overseas",
      "Read practical guides to study abroad applications, visa documents, residency orientation and education finance.",
      "/articles",
    ),
  component: ArticlesRoute,
});
function ArticlesRoute() {
  return (
    <SiteLayout>
      <ArticlesPage initial={Route.useLoaderData() as Article[]} />
    </SiteLayout>
  );
}
