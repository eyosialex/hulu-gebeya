import { createFileRoute } from "@tanstack/react-router";
import { RewardsShop } from "@/components/dashboard/SimplePages";

export const Route = createFileRoute("/dashboard/rewards")({
  component: RewardsShop,
});