import { createFileRoute } from "@tanstack/react-router";
import { MapView } from "@/components/dashboard/MapView";

export const Route = createFileRoute("/dashboard/map")({
  component: MapView,
});