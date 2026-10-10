import { createFileRoute } from "@tanstack/react-router";
import { GalleryPage } from "@/components/resources";
import { SiteLayout } from "@/components/dlfly-site";
import { loadGallery } from "@/lib/public-content";
import { pageHead } from "@/lib/seo";
import type { GalleryImage } from "@/lib/content";

export const Route = createFileRoute("/gallery")({
  loader: () => loadGallery(),
  head: () =>
    pageHead(
      "Gallery | DLFLY Overseas",
      "Explore the DLFLY Overseas image gallery and the preparation behind your international education journey.",
      "/gallery",
    ),
  component: GalleryRoute,
});
function GalleryRoute() {
  return (
    <SiteLayout>
      <GalleryPage initial={Route.useLoaderData() as GalleryImage[]} />
    </SiteLayout>
  );
}
