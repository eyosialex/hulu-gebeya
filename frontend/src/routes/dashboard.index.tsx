import { createFileRoute } from "@tanstack/react-router";
import { OverviewView } from "@/components/dashboard/OverviewView";

export const Route = createFileRoute("/dashboard/")({
  component: OverviewView,
});