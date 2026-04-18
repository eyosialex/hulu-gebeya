import { Outlet, createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { DashboardProvider } from "@/components/dashboard/DashboardContext";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { MobileTopBar } from "@/components/dashboard/MobileTopBar";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Smart Map — Dashboard" },
      {
        name: "description",
        content:
          "Your gamified urban exploration command center. Pick a category, complete missions, and earn rewards.",
      },
      { property: "og:title", content: "Smart Map — Dashboard" },
      {
        property: "og:description",
        content: "Pick a discovery category, capture verified missions, and climb the leaderboard.",
      },
    ],
  }),
  component: () => (
    <DashboardProvider>
      <DashboardShell />
    </DashboardProvider>
  ),
});

function DashboardShell() {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="min-h-screen w-full bg-black text-foreground lg:grid lg:grid-cols-[minmax(260px,340px)_1fr]">
      <AppSidebar />

      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 lg:hidden animate-fade-in"
          onClick={() => setMobileOpen(false)}
        >
          <div
            className="absolute inset-y-0 left-0 w-[85%] max-w-sm animate-slide-in-right"
            style={{ animation: "slide-in-right 0.25s ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <AppSidebar variant="mobile" onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <main className="relative z-0 min-w-0">
        <MobileTopBar onMenu={() => setMobileOpen(true)} />
        <Outlet />
      </main>
    </div>
  );
}