import { useDashboard, type CategoryId } from "./DashboardContext";
import { cn } from "@/lib/utils";
import {
  Home,
  ScrollText,
  Trophy,
  ShoppingBag,
  Users,
  Settings,
  UtensilsCrossed,
  Gamepad2,
  Church,
  Bus,
  GraduationCap,
  HeartPulse,
  Palette,
  Wrench,
  Sparkles,
  LogOut,
  X,
} from "lucide-react";

const categories: { id: CategoryId; label: string; icon: any; color: string }[] = [
  { id: "food", label: "Food & Drinks", icon: UtensilsCrossed, color: "text-orange-300" },
  { id: "game", label: "Game Zones", icon: Gamepad2, color: "text-fuchsia-300" },
  { id: "culture", label: "Culture & Faith", icon: Church, color: "text-amber-200" },
  { id: "transport", label: "Transport Hubs", icon: Bus, color: "text-yellow-300" },
  { id: "study", label: "Study & Education", icon: GraduationCap, color: "text-sky-300" },
  { id: "health", label: "Health & Wellness", icon: HeartPulse, color: "text-emerald-300" },
  { id: "art", label: "Art & Creativity", icon: Palette, color: "text-pink-300" },
  { id: "services", label: "Local Services", icon: Wrench, color: "text-slate-300" },
  { id: "hidden", label: "Hidden Gems", icon: Sparkles, color: "text-primary-glow" },
];

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "missions", label: "Mission Log", icon: ScrollText },
  { id: "leaderboard", label: "Leaderboard", icon: Trophy },
  { id: "rewards", label: "Rewards Shop", icon: ShoppingBag },
  { id: "social", label: "Social Hub", icon: Users },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export function AppSidebar({
  variant = "desktop",
  onClose,
}: {
  variant?: "desktop" | "mobile";
  onClose?: () => void;
}) {
  const { view, setView, activeCategory, openCategory, user } = useDashboard();

  const containerClasses =
    variant === "desktop"
      ? "fixed inset-y-0 left-0 z-30 hidden w-[20%] min-w-[260px] max-w-[340px] flex-col border-r border-border/60 bg-black/80 backdrop-blur-xl lg:flex"
      : "flex h-full w-full flex-col border-r border-border/60 bg-black/95 backdrop-blur-xl";

  const handleNav = (cb: () => void) => {
    cb();
    onClose?.();
  };

  return (
    <aside className={containerClasses}>
      {/* Identity & Economy */}
      <div className="relative border-b border-border/60 p-5">
        {variant === "mobile" && (
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="absolute right-3 top-3 rounded-full border border-border/60 p-1.5 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 -m-0.5 rounded-full bg-gradient-primary blur-sm opacity-80" />
            <div className="relative h-12 w-12 rounded-full bg-gradient-primary p-[2px]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-black text-sm font-bold text-foreground">
                {user.initials}
              </div>
            </div>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
            <p className="text-xs text-primary-glow">{user.rank} • Level {user.level}</p>
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
            <span>XP {user.xp.toLocaleString()}</span>
            <span>{user.xpNext.toLocaleString()}</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-gradient-primary"
              style={{ width: `${(user.xp / user.xpNext) * 100}%` }}
            />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-border/60 bg-surface/60 p-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">🪙 Coins</p>
            <p className="text-sm font-bold text-foreground">{user.coins.toLocaleString()}</p>
          </div>
          <div className="rounded-lg border border-border/60 bg-surface/60 p-2 text-center">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">⭐ Points</p>
            <p className="text-sm font-bold text-foreground">{user.points.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="flex-1 overflow-y-auto px-2 py-3">
        <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Discovery Categories
        </p>
        <ul className="space-y-1">
          {categories.map((c) => {
            const Icon = c.icon;
            const active = view === "map" && activeCategory === c.id;
            return (
              <li key={c.id}>
                <button
                  onClick={() => handleNav(() => openCategory(c.id))}
                  className={cn(
                    "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all",
                    active
                      ? "bg-primary/15 text-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-surface/60 hover:text-foreground",
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", active ? "text-primary-glow" : c.color)} />
                  <span className="truncate">{c.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <p className="mt-5 px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          Navigation
        </p>
        <ul className="space-y-1">
          {navItems.map((n) => {
            const Icon = n.icon;
            const active = view === n.id;
            return (
              <li key={n.id}>
                <button
                  onClick={() => handleNav(() => setView(n.id))}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-all",
                    active
                      ? "bg-gradient-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-surface/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{n.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <button
          onClick={() => handleNav(() => { /* TODO wire auth signOut */ })}
          className="mt-6 flex w-full items-center gap-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-left text-sm text-destructive transition-all hover:bg-destructive/20"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>

      <div className="border-t border-border/60 px-4 py-2 text-[10px] text-muted-foreground">
        <span className="text-success">●</span> AI Engine Operational · GPS 12 Active
      </div>
    </aside>
  );
}

export { categories };
