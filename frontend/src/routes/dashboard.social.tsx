import { createFileRoute } from "@tanstack/react-router";
import { SocialHub } from "@/components/dashboard/SimplePages";

export const Route = createFileRoute("/dashboard/social")({
  component: SocialHub,
});