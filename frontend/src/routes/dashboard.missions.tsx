import { createFileRoute } from "@tanstack/react-router";
import { MissionLog } from "@/components/dashboard/SimplePages";

export const Route = createFileRoute("/dashboard/missions")({
  component: MissionLog,
});