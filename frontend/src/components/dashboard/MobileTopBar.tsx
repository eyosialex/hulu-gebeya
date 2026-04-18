import { useDashboard } from "./DashboardContext";
import { Menu } from "lucide-react";

export function MobileTopBar({ onMenu }: { onMenu: () => void }) {
  const { user } = useDashboard();

  return (
    <div className="flex items-center justify-between border-b border-border/60 bg-black/80 px-4 py-3 backdrop-blur lg:hidden">
      <button
        onClick={onMenu}
        className="rounded-lg border border-border/60 p-2 text-foreground"
        aria-label="Open menu"
      >
        <Menu className="h-4 w-4" />
      </button>
      <p className="text-sm font-semibold text-foreground">Smart Map</p>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-amber-300">🪙 {user.coins}</span>
        <span className="text-primary-glow">L{user.level}</span>
      </div>
    </div>
  );
}