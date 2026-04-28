import { createFileRoute } from "@tanstack/react-router";
import { SettingsView } from "@/components/dashboard/pages/SettingsView";

export const Route = createFileRoute("/dashboard/settings")({
  component: SettingsView,
});