import { createFileRoute } from "@tanstack/react-router";
import { Leaderboard } from "@/components/dashboard/pages/Leaderboard";

export const Route = createFileRoute("/dashboard/leaderboard")({
  component: Leaderboard,
});