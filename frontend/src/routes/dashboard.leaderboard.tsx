import { createFileRoute } from "@tanstack/react-router";
import { Leaderboard } from "@/components/dashboard/SimplePages";

export const Route = createFileRoute("/dashboard/leaderboard")({
  component: Leaderboard,
});