import { createFileRoute } from "@tanstack/react-router";
import { SocialHub } from "@/components/dashboard/pages/SocialHub";

export const Route = createFileRoute("/dashboard/social")({
  component: SocialHub,
});