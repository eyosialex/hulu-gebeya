import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useDashboard } from "./DashboardContext";
import { useMissions } from "@/hooks/useMissions";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useShop } from "@/hooks/useShop";
import { useSocial } from "@/hooks/useSocial";
import {
  Trophy,
  Crown,
  Medal,
  ShoppingBag,
  Users,
  Zap,
  Camera,
  MapPin,
  Clock,
  Star,
  Flame,
  Sparkles,
  Target,
  Radar,
  Coffee,
  Bus,
  Church,
  Gem,
  TrendingUp,
  Share2,
  UserPlus,
  ShieldCheck,
  Smartphone,
  Lock,
  Eye,
  Satellite,
  Award,
  Gift,
  Ticket,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  BadgePercent,
  MessageSquareText,
  HelpCircle,
  Image as ImageIcon,
  HeartPulse,
  Palette,
  Wrench,
  Navigation2,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

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

function useReveal(selector = "[data-reveal]") {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!root.current) return;
    const ctx = gsap.context(() => {
      gsap.from(selector, {
        y: 24,
        opacity: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.06,
      });
    }, root);
    return () => ctx.revert();
  }, [selector]);
  return root;
}

export function MissionLog() {
  const { missions, isLoading } = useMissions();
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
      count: missions.filter((m) => m.cat === "food" || m.cat === "Food & Drinks").length,
    },
    {
      id: "transport",
      label: "Transport",
      icon: Bus,
      description: "Transit and mobility spots",
      accent: "text-sky-300",
      count: missions.filter((m) => m.cat === "transport" || m.cat === "Transport").length,
    },
    {
      id: "culture",
      label: "Culture",
      icon: Church,
      description: "Heritage and faith locations",
      accent: "text-amber-200",
      count: missions.filter((m) => m.cat === "culture" || m.cat === "Culture & Faith").length,
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
    <div>
      <Wrap title="Mission Log" subtitle="Verified captures Â· AI confidence visible">
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-6">
          <MiniStat icon={CheckCircle2} label="Verified" value="142" tint="text-success" />
          <MiniStat icon={Flame} label="This Week" value="9" tint="text-orange-300" />
          <MiniStat icon={Star} label="High-Value" value="27" tint="text-amber-300" />
          <MiniStat icon={ShieldCheck} label="Avg AI Trust" value="98.4%" tint="text-primary-glow" />
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
              {stats.visible} missions Â· {stats.coins.toLocaleString()} coins Â· {stats.avgAi.toFixed(1)}% AI trust
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

        <div className="mb-5 flex flex-wrap gap-2">
          {missionFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all ${
                activeFilter === filter.id
                  ? "border-primary/50 bg-primary/15 text-primary-glow shadow-glow"
                  : "border-border/60 text-muted-foreground hover:border-primary/40 hover:text-foreground"
              }`}
            >
              <filter.icon className="h-3.5 w-3.5" />
              {filter.label}
            </button>
          ))}
        </div>

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

                  <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground">
                    <MapPin className="h-3 w-3 text-primary-glow" /> {m.gps}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-xs">
                    <span className="text-primary-glow">+{m.xp} XP</span>
                    <span className="text-amber-300">+{m.coins} ðŸª™</span>
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
      </Wrap>
    </div>
  );
}

export function Leaderboard() {
  const { user } = useDashboard();
  const { leaderboard, isLoading } = useLeaderboard();
  const root = useReveal();

  const top = leaderboard.slice(0, 3);
  const list = leaderboard.slice(3);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={root}>
      <Wrap title="Leaderboard" subtitle="Climb the ranks across your city">
        <div data-reveal className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            {["Global", "Regional", "Friends"].map((t, i) => (
              <button
                key={t}
                className={`rounded-full px-4 py-1.5 text-xs transition-all ${
                  i === 1
                    ? "bg-gradient-primary text-primary-foreground shadow-glow"
                    : "border border-border/60 text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Season ends in <span className="text-primary-glow">12d 4h</span>
          </p>
        </div>

        <div data-reveal className="mb-6 grid grid-cols-3 gap-3">
          {top.map((p) => {
            const Icon = p.rank === 1 ? Crown : p.rank === 2 ? Trophy : Medal;
            const order = p.rank === 1 ? "order-2 -mt-3" : p.rank === 2 ? "order-1" : "order-3";
            const tone =
              p.rank === 1
                ? "border-primary/60 shadow-glow bg-gradient-to-b from-primary/20 to-transparent"
                : "border-border/60";
            return (
              <div
                key={p.rank}
                className={`${order} rounded-2xl border ${tone} bg-gradient-card p-4 text-center transition-all hover:-translate-y-1`}
              >
                <Icon className="mx-auto h-7 w-7 text-primary-glow" />
                <p className="mt-2 text-sm font-semibold text-foreground">{p.name}</p>
                <p className="text-[10px] text-amber-300">{p.badge}</p>
                <p className="mt-2 text-xs text-muted-foreground">{p.points.toLocaleString()} XP</p>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                  <span>{p.missions} ðŸ“œ</span>
                  <span className="text-orange-300">ðŸ”¥ {p.streak}</span>
                </div>
                <p className="mt-2 text-[10px] font-mono text-primary-glow">#{p.rank}</p>
              </div>
            );
          })}
        </div>

        <div data-reveal className="overflow-hidden rounded-2xl border border-border/60 bg-gradient-card">
          <div className="grid grid-cols-12 border-b border-border/40 bg-surface/40 px-5 py-2 text-[10px] uppercase tracking-widest text-muted-foreground">
            <span className="col-span-1">Rank</span>
            <span className="col-span-5">Explorer</span>
            <span className="col-span-2 text-right">Missions</span>
            <span className="col-span-2 text-right">Streak</span>
            <span className="col-span-2 text-right">XP</span>
          </div>
          {list.map((p) => (
            <Row key={p.rank} {...p} />
          ))}
          <div className="border-t border-primary/40 bg-primary/10">
            <Row
              rank={47}
              name={`${user.name} (you)`}
              points={user.points}
              missions={user.totalMissions}
              streak={user.streak}
              highlight
            />
          </div>
        </div>
      </Wrap>
    </div>
  );
}

function Row({
  rank,
  name,
  points,
  missions,
  streak,
  highlight,
}: {
  rank: number;
  name: string;
  points: number;
  missions: number;
  streak: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`grid grid-cols-12 items-center px-5 py-3 text-sm transition-colors ${
        highlight ? "text-foreground" : "text-muted-foreground hover:bg-surface/40"
      }`}
    >
      <span className="col-span-1 font-mono">#{rank}</span>
      <span className="col-span-5 truncate">{name}</span>
      <span className="col-span-2 text-right text-xs">{missions}</span>
      <span className="col-span-2 text-right text-xs text-orange-300">ðŸ”¥ {streak}</span>
      <span className={`col-span-2 text-right ${highlight ? "text-primary-glow" : ""}`}>
        {points.toLocaleString()}
      </span>
    </div>
  );
}

export function RewardsShop() {
  const { user } = useDashboard();
  const { shopItems, isLoading } = useShop();

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Wrap title="Rewards Shop" subtitle="Spend coins on perks and partner deals">
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-primary/40 bg-gradient-card p-5 shadow-glow lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
                <p className="mt-1 text-4xl font-bold text-foreground">ðŸª™ {user.coins.toLocaleString()}</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Earn more by completing high-value missions and daily streaks.
                </p>
              </div>
              <button className="rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
                + Top Up
              </button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg border border-border/60 bg-surface/40 p-2">
                <p className="text-[10px] uppercase text-muted-foreground">Earned 7d</p>
                <p className="text-sm font-bold text-success">+820</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-surface/40 p-2">
                <p className="text-[10px] uppercase text-muted-foreground">Spent 7d</p>
                <p className="text-sm font-bold text-destructive">-450</p>
              </div>
              <div className="rounded-lg border border-border/60 bg-surface/40 p-2">
                <p className="text-[10px] uppercase text-muted-foreground">Active Boosters</p>
                <p className="text-sm font-bold text-primary-glow">2</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-gradient-card p-5">
            <p className="text-xs text-muted-foreground">Active Inventory</p>
            <ul className="mt-3 space-y-2 text-xs">
              <li className="flex items-center justify-between rounded-lg border border-border/40 bg-surface/40 p-2">
                <span className="flex items-center gap-2 text-foreground">
                  <Zap className="h-3.5 w-3.5 text-amber-300" /> 2x XP
                </span>
                <span className="text-muted-foreground">18h left</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-border/40 bg-surface/40 p-2">
                <span className="flex items-center gap-2 text-foreground">
                  <Radar className="h-3.5 w-3.5 text-primary-glow" /> Radar
                </span>
                <span className="text-muted-foreground">3 uses</span>
              </li>
              <li className="flex items-center justify-between rounded-lg border border-border/40 bg-surface/40 p-2">
                <span className="flex items-center gap-2 text-foreground">
                  <Ticket className="h-3.5 w-3.5 text-rose-300" /> Cafe coupon
                </span>
                <span className="text-muted-foreground">12d</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shopItems.map((it) => {
            const Icon = CategoryIcons[it.type] || Zap;
            return (
              <article
                key={it.id}
                className="flex flex-col rounded-2xl border border-border/60 bg-gradient-card p-4 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
              >
                <div className={`flex h-24 items-center justify-center rounded-xl bg-linear-to-br ${it.tint || 'from-surface/60 to-surface/30'} text-foreground`}>
                  <Icon className="h-9 w-9 text-primary-glow drop-shadow" />
                </div>
                <div className="mt-3 flex items-start justify-between">
                  <p className="text-sm font-semibold text-foreground">{it.name}</p>
                  <span className="rounded-md border border-border/60 bg-surface/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {it.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{it.description}</p>
                <p className="mt-2 text-[10px] text-primary-glow">{it.detail}</p>
                <button className="mt-3 w-full rounded-full bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
                  Buy Â· ðŸª™ {it.price}
                </button>
              </article>
            );
          })}
        </div>
      </Wrap>
    </div>
  );
}

export function SocialHub() {
  const { friends, teamQuests, isLoading } = useSocial();

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <Wrap title="Social Hub" subtitle="Friends, teams, and referrals">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="rounded-3xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Active Friends</p>
                <p className="text-xs text-muted-foreground">Live status from your crew</p>
              </div>
              <button className="flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
                <UserPlus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <AnimatePresence>
                {friends.map((f, i) => {
                  const Icon = CategoryIcons[f.categoryContext] || Users;
                  return (
                    <motion.li
                      key={f.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex list-none flex-col gap-3 rounded-xl border border-border/40 bg-surface/40 p-4 transition-all hover:border-primary/40 hover:bg-surface/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-sm font-bold text-foreground">
                              {f.name.slice(0, 1)}
                            </div>
                            {f.live && (
                              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-black bg-success shadow-glow-success animate-pulse" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                               <p className="text-sm font-semibold text-foreground">{f.name}</p>
                               <Icon className="h-3 w-3 text-primary-glow" />
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase">{f.status}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                           <button className="rounded-full bg-surface/60 p-1.5 text-muted-foreground hover:bg-primary/20 hover:text-primary-glow transition-colors">ðŸ‘ </button>
                           <button className="rounded-full bg-surface/60 p-1.5 text-muted-foreground hover:bg-primary/20 hover:text-primary-glow transition-colors">ðŸš€</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px]">
                        <span className="text-muted-foreground text-xs">Level {Math.floor(f.xp / 1000) + 1}</span>
                        <span className="font-mono text-primary-glow text-xs">{f.xp.toLocaleString()} XP</span>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-primary/40 bg-gradient-card p-5 shadow-glow">
              <Share2 className="h-5 w-5 text-primary-glow" />
              <p className="mt-3 text-sm font-semibold text-foreground">Your Referral Code</p>
              <p className="mt-2 font-mono text-2xl tracking-widest text-primary-glow">SMART-MAP-2026</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Earn <span className="text-primary-glow">+500 ðŸª™</span> when a friend completes their first mission.
              </p>
              <button className="mt-4 w-full rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Share to Socials
              </button>
            </div>
          </div>
        </div>
      </Wrap>
    </div>
  );
}

export function SettingsView() {
  const { user } = useDashboard();
  const [gpsHighAccuracy, setGpsHighAccuracy] = useState(true);

  return (
    <div>
      <Wrap title="Settings" subtitle="Account intelligence and control">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-1">
          <div className="rounded-3xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
            <div className="flex items-center gap-4">
               <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-300/30 bg-linear-to-br from-blue-500 via-indigo-500 to-cyan-500 text-2xl font-bold text-white shadow-lg shadow-blue-950/40">
                  {user.initials}
               </div>
               <div>
                  <h3 className="text-xl font-semibold text-foreground">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
               </div>
            </div>
            <div className="mt-6 space-y-4">
               <Toggle label="GPS High Accuracy" on={gpsHighAccuracy} onToggle={() => setGpsHighAccuracy(!gpsHighAccuracy)} hint="Precision mapping mode" />
               <div className="rounded-xl border border-border/40 bg-surface/40 p-4">
                  <p className="text-xs font-semibold text-foreground uppercase tracking-widest">Recent Activity</p>
                  <ActivityList />
               </div>
            </div>
          </div>
        </div>
      </Wrap>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
  tint,
}: {
  icon: any;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${tint}`} />
      </div>
      <p className="mt-2 text-xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function Wrap({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 p-6 lg:p-8">
      <header>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">{title}</p>
        <h1 className="mt-1 text-3xl font-bold text-foreground">{subtitle}</h1>
      </header>
      {children}
    </div>
  );
}

function Toggle({
  label,
  on,
  hint,
  onToggle,
}: {
  label: string;
  on?: boolean;
  hint?: string;
  onToggle?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex w-full items-center justify-between rounded-lg border border-border/40 bg-surface/40 px-3 py-2 text-left transition hover:border-primary/40 hover:bg-surface/60"
    >
      <div>
        <p className="text-xs text-foreground">{label}</p>
        {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
      </div>
      <span className={`relative h-5 w-9 rounded-full ${on ? "bg-primary" : "bg-surface"} transition`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-foreground transition ${on ? "left-4.5" : "left-0.5"}`} />
      </span>
    </button>
  );
}

import { useQuizzes, useSubmitQuizAnswer, type Quiz } from "@/hooks/useQuizzes";
export function QuizView() {
  const { data: quizzes = [], isLoading } = useQuizzes();
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(10);
  const submitMutation = useSubmitQuizAnswer();

  if (isLoading) return <div className="h-8 w-8 animate-spin" />;

  return (
    <Wrap title="Photo Quiz" subtitle="Identify locations">
       <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {quizzes.map((q) => (
             <button key={q.id} onClick={() => setActiveQuiz(q)} className="rounded-2xl border border-border/40 bg-gradient-card p-4">
                <p className="text-sm font-bold text-foreground">{q.question}</p>
             </button>
          ))}
       </div>
    </Wrap>
  );
}

import { useActivityLogs } from "@/hooks/useActivityLogs";
import { useSavedRoutes } from "@/hooks/useRoute";

export function SavedRoutes() {
  const { data: routes = [], isLoading } = useSavedRoutes();

  if (isLoading) return <p>Loading routes...</p>;

  return (
    <Wrap title="Saved Routes" subtitle="Your history">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {routes.map((route) => (
          <div key={route.id} className="rounded-2xl border border-border/60 bg-gradient-card p-5">
             <h3 className="text-sm font-bold text-foreground">{route.name}</h3>
             <p className="text-xs text-muted-foreground">{new Date(route.createdAt).toLocaleDateString()}</p>
             <button className="mt-4 w-full rounded-full bg-gradient-primary py-2 text-xs font-bold text-white">Replay</button>
          </div>
        ))}
      </div>
    </Wrap>
  );
}

function ActivityList() {
  const { data: logs = [], isLoading } = useActivityLogs();
  if (isLoading) return <p>...</p>;
  return (
    <div className="space-y-2">
      {logs.map((log) => (
        <div key={log.id} className="text-xs text-muted-foreground">
          {log.action} - {new Date(log.createdAt).toLocaleTimeString()}
        </div>
      ))}
    </div>
  );
}
