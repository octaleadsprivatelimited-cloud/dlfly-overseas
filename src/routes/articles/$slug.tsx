import { createFileRoute, notFound } from "@tanstack/react-router";
import { ArticlePage } from "@/components/resources";
import { SiteLayout } from "@/components/dlfly-site";
import { loadArticle } from "@/lib/public-content";
import { pageHead } from "@/lib/seo";

export const Route = createFileRoute("/articles/$slug")({
  loader: async ({ params }) => {
    const article = await loadArticle({ data: { slug: params.slug } });
    if (!article) throw notFound();
    return article;
  },
  head: ({ loaderData }) =>
    loaderData
      ? pageHead(
          loaderData.title + " | DLFLY Overseas",
          loaderData.excerpt,
          "/articles/" + loaderData.slug,
          loaderData.coverUrl,
        )
      : {},
  component: ArticleRoute,
});
function ArticleRoute() {
  return (
    <SiteLayout>
      <ArticlePage article={Route.useLoaderData()} />
    </SiteLayout>
  );
}
