import { createFileRoute } from "@tanstack/react-router";
import { VideosPage } from "@/components/resources";
import { SiteLayout } from "@/components/dlfly-site";
import { loadVideos } from "@/lib/public-content";
import { pageHead } from "@/lib/seo";
import type { Video } from "@/lib/content";

export const Route = createFileRoute("/videos")({
  loader: () => loadVideos(),
  head: () =>
    pageHead(
      "Video Library | DLFLY Overseas",
      "Watch videos selected by DLFLY Overseas to support your study planning, visa preparation and next steps.",
      "/videos",
    ),
  component: VideosRoute,
});
function VideosRoute() {
  return (
    <SiteLayout>
      <VideosPage initial={Route.useLoaderData() as Video[]} />
    </SiteLayout>
  );
}
