import { createFileRoute } from "@tanstack/react-router";
import { MissionLog } from "@/components/dashboard/pages/MissionLog";

export const Route = createFileRoute("/dashboard/missions")({
  component: MissionLog,
});