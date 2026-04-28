import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/components/dashboard/SimplePages";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsView,
});