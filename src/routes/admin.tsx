import { createFileRoute } from "@tanstack/react-router";
import { AdminPanel } from "@/components/admin-panel";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Website Administration | DLFLY Overseas" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPanel,
});
