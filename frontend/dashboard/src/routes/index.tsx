import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DashboardProvider, useDashboard } from "@/components/dashboard/DashboardContext";
import { AppSidebar } from "@/components/dashboard/AppSidebar";
import { OverviewView } from "@/components/dashboard/OverviewView";
import { MapView } from "@/components/dashboard/MapView";
import {
  MissionLog,
  Leaderboard,
  RewardsShop,
  SocialHub,
  SettingsView,
} from "@/components/dashboard/SimplePages";
import { MobileTopBar } from "@/components/dashboard/MobileTopBar";

export const Route = createFileRoute("/")({
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
  const { view } = useDashboard();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-black text-foreground">
      <AppSidebar />

      {/* Mobile drawer */}
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

      <main className="lg:ml-[20%] lg:pl-0">
        <MobileTopBar onMenu={() => setMobileOpen(true)} />
        <div className="min-h-[calc(100vh-56px)] lg:min-h-screen">
          {view === "dashboard" && <OverviewView />}
          {view === "map" && <MapView />}
          {view === "missions" && <MissionLog />}
          {view === "leaderboard" && <Leaderboard />}
          {view === "rewards" && <RewardsShop />}
          {view === "social" && <SocialHub />}
          {view === "settings" && <SettingsView />}
        </div>
      </main>
    </div>
  );
}
