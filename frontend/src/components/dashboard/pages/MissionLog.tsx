import { useMemo, useState } from "react";
import { useMissions } from "@/hooks/useMissions";
import {
  Target,
  Coffee,
  Bus,
  Church,
  Flame,
  Star,
  ShieldCheck,
  CheckCircle2,
  BadgePercent,
  ArrowUpRight,
  Clock,
  MapPin,
  Sparkles,
  HeartPulse,
  Palette,
  Wrench,
  Trophy,
} from "lucide-react";
import { PageWrap } from "../PageWrap";
import { MiniStat } from "../MiniStat";

const CategoryIcons: Record<string, any> = {
  food: Coffee,
  game: Sparkles,
  culture: Church,
  transport: Bus,
  study: Gem,
  health: HeartPulse,
  art: Palette,
  services: Wrench,
  hidden: Sparkles,
  "Food & Drinks": Coffee,
  "Transport": Bus,
  "Culture & Faith": Church,
  "Art & Creativity": Sparkles,
  "Study & Education": Gem,
  "Hidden Gems": Sparkles,
  "High-Value": Trophy,
};

// Fallback for missing Gem icon in lucide-react if needed, or import correctly
import { Gem } from "lucide-react";

export function MissionLog() {
  const { missions, stats: apiStats, isLoading } = useMissions();
  const [activeFilter, setActiveFilter] = useState("all");

  const missionFilters = useMemo(() => [
    {
      id: "all",
      label: "All",
      icon: Target,
      description: "Every verified mission",
      accent: "text-primary-glow",
      count: missions.length,
    },
    {
      id: "food",
      label: "Food",
      icon: Coffee,
      description: "Food & Drinks missions",
      accent: "text-orange-300",
      count: missions.filter((m) => m.cat.toLowerCase().includes("food")).length,
    },
    {
      id: "transport",
      label: "Transport",
      icon: Bus,
      description: "Transit and mobility spots",
      accent: "text-sky-300",
      count: missions.filter((m) => m.cat.toLowerCase().includes("transport")).length,
    },
    {
      id: "culture",
      label: "Culture",
      icon: Church,
      description: "Heritage and faith locations",
      accent: "text-amber-200",
      count: missions.filter((m) => m.cat.toLowerCase().includes("culture")).length,
    },
  ], [missions]);

  const filteredMissions = useMemo(() => {
    if (activeFilter === "all") return missions;
    return missions.filter((m) => {
      const cat = m.cat.toLowerCase();
      if (activeFilter === "food") return cat.includes("food");
      if (activeFilter === "transport") return cat.includes("transport");
      if (activeFilter === "culture") return cat.includes("culture");
      return true;
    });
  }, [activeFilter, missions]);

  const stats = useMemo(() => {
    const visible = filteredMissions.length;
    const xp = filteredMissions.reduce((sum, mission) => sum + mission.xp, 0);
    const coins = filteredMissions.reduce((sum, mission) => sum + mission.coins, 0);
    const avgAi = visible === 0 ? 0 : filteredMissions.reduce((sum, mission) => sum + mission.ai, 0) / visible;

    return { visible, xp, coins, avgAi };
  }, [filteredMissions]);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <PageWrap title="Mission Log" subtitle="Verified captures · AI confidence visible">
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
        <MiniStat icon={CheckCircle2} label="Verified" value={String(apiStats?.totalVerified || 0)} tint="text-success" />
        <MiniStat icon={Clock} label="Pending" value={String(apiStats?.totalPending || 0)} tint="text-orange-300" />
        <MiniStat icon={Star} label="Weekly Goal" value={String(apiStats?.weeklyGoal || 10)} tint="text-amber-300" />
        <MiniStat icon={ShieldCheck} label="Avg AI Trust" value={(apiStats?.avgTrust || 0) + "%"} tint="text-primary-glow" />
        <MiniStat icon={Target} label="Visible Cards" value={String(stats.visible)} tint="text-sky-300" />
        <MiniStat icon={BadgePercent} label="Mission XP" value={stats.xp.toLocaleString()} tint="text-emerald-300" />
      </div>

      <section className="mb-6 rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-elegant">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Mission Categories</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">Tap a card to filter the log</h3>
          </div>
          <p className="text-xs text-muted-foreground">
            {stats.visible} missions · {stats.coins.toLocaleString()} coins · {stats.avgAi.toFixed(1)}% AI trust
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {missionFilters.map((filter) => {
            const Icon = filter.icon;
            const active = activeFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`group rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-primary/60 bg-primary/15 shadow-glow"
                    : "border-border/60 bg-surface/40 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-surface/60"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className={`h-4 w-4 ${active ? "text-primary-glow" : filter.accent}`} />
                      <span className="text-sm font-semibold text-foreground">{filter.label}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{filter.description}</p>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${active ? "bg-primary text-primary-foreground" : "bg-black/40 text-muted-foreground"}`}>
                    {String(filter.count).padStart(2, "0")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {filteredMissions.map((m) => {
          const Icon = CategoryIcons[m.cat] || Target;
          return (
            <article
              key={m.id}
              className="group overflow-hidden rounded-2xl border border-border/60 bg-gradient-card shadow-elegant transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
            >
              <div className={`relative aspect-video bg-linear-to-br ${m.photo}`}>
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] uppercase tracking-widest text-foreground backdrop-blur">
                  <Icon className="h-3 w-3 text-primary-glow" /> {m.cat}
                </div>
                <div className="absolute right-3 top-3 rounded-full bg-success/20 px-2 py-1 text-[10px] font-mono text-success backdrop-blur">
                  AI {m.ai}%
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                  <p className="text-base font-bold text-foreground drop-shadow">#{m.id}</p>
                  <div className="rounded-full bg-black/60 px-2 py-1 text-[10px] text-muted-foreground backdrop-blur">
                    <Clock className="mr-1 inline h-2.5 w-2.5" />
                    {m.when}
                  </div>
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-sm font-semibold text-foreground">{m.name}</h3>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{m.tip}</p>

                <div className="mt-3 flex flex-wrap gap-1">
                  {m.tags.map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-border/60 bg-surface/40 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-4 text-[10px] font-mono text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-destructive animate-pulse" /> 
                    <span className="font-bold text-foreground/80">{m.gps}</span>
                  </div>
                  <a 
                    href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-[9px] font-black uppercase tracking-tighter text-destructive transition-all hover:bg-destructive/20 hover:scale-105 active:scale-95 shadow-xs"
                  >
                    View Map
                  </a>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-xs">
                  <span className="text-primary-glow">+{m.xp} XP</span>
                  <span className="text-amber-300">+{m.coins} 🪙</span>
                  <button className="text-muted-foreground hover:text-primary-glow">
                    <ArrowUpRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {filteredMissions.length === 0 && (
        <div className="rounded-2xl border border-border/60 bg-surface/40 p-6 text-center text-sm text-muted-foreground">
          No missions match this category yet.
        </div>
      )}
    </PageWrap>
  );
}
