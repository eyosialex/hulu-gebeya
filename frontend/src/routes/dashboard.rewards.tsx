import { createFileRoute } from "@tanstack/react-router";
import { RewardsShop } from "@/components/dashboard/pages/RewardsShop";

export const Route = createFileRoute("/dashboard/rewards")({
  component: RewardsShop,
});