import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useDashboard } from "./DashboardContext";
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
} from "lucide-react";

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

const missions = [
  {
    id: 142,
    name: "Hidden Coffee Lane",
    cat: "Food & Drinks",
    icon: Coffee,
    when: "2h ago",
    xp: 220,
    coins: 80,
    ai: 99.2,
    gps: "6.5244° N, 3.3792° E",
    tip: "Order the iced cardamom — they roast beans in-house every Friday.",
    tags: ["Hidden Gem", "Verified", "High-Value"],
    photo: "from-orange-500/40 via-amber-700/30 to-rose-900/40",
  },
  {
    id: 141,
    name: "City Central Taxi Terminal",
    cat: "Transport",
    icon: Bus,
    when: "Yesterday",
    xp: 150,
    coins: 50,
    ai: 97.8,
    gps: "6.5283° N, 3.3831° E",
    tip: "Queue is shortest 6:40am. Drivers accept card after 7pm.",
    tags: ["Live Status", "Peak Hours"],
    photo: "from-yellow-500/40 via-amber-800/30 to-stone-900/40",
  },
  {
    id: 140,
    name: "St. Mary Cathedral",
    cat: "Culture & Faith",
    icon: Church,
    when: "2d ago",
    xp: 180,
    coins: 60,
    ai: 98.5,
    gps: "6.5201° N, 3.3755° E",
    tip: "Stained glass best photographed at 4pm western light.",
    tags: ["Heritage", "Scenic"],
    photo: "from-amber-300/30 via-yellow-700/20 to-stone-900/50",
  },
  {
    id: 139,
    name: "Mural Wall — District 7",
    cat: "Art & Creativity",
    icon: Sparkles,
    when: "3d ago",
    xp: 260,
    coins: 95,
    ai: 99.6,
    gps: "6.5260° N, 3.3880° E",
    tip: "New piece every two weeks — track @district7crew for drops.",
    tags: ["Hidden Gem", "Trending"],
    photo: "from-fuchsia-500/40 via-purple-700/30 to-indigo-900/40",
  },
  {
    id: 138,
    name: "Old Library Quiet Zone",
    cat: "Study & Education",
    icon: Gem,
    when: "5d ago",
    xp: 140,
    coins: 45,
    ai: 96.4,
    gps: "6.5298° N, 3.3712° E",
    tip: "Top floor has free wifi + leather armchairs. Closes at 9pm.",
    tags: ["Quiet", "Free Wifi"],
    photo: "from-sky-500/30 via-indigo-700/30 to-slate-900/40",
  },
  {
    id: 137,
    name: "Riverside Night Market",
    cat: "Food & Drinks",
    icon: Coffee,
    when: "1w ago",
    xp: 320,
    coins: 110,
    ai: 99.9,
    gps: "6.5188° N, 3.3920° E",
    tip: "Stall #14 grills suya till 2am. Bring cash, very small notes.",
    tags: ["High-Value", "Night Only"],
    photo: "from-emerald-500/30 via-teal-700/30 to-emerald-950/40",
  },
  {
    id: 136,
    name: "Marina Walkway Bistro",
    cat: "Food & Drinks",
    icon: Coffee,
    when: "1w ago",
    xp: 170,
    coins: 55,
    ai: 97.1,
    gps: "6.5312° N, 3.3866° E",
    tip: "Best table faces the water. Their jollof brunch sells out by 1pm.",
    tags: ["Weekend Spot", "Popular"],
    photo: "from-orange-500/40 via-yellow-700/20 to-stone-900/40",
  },
  {
    id: 135,
    name: "Lagoon Ferry Gate",
    cat: "Transport",
    icon: Bus,
    when: "1w ago",
    xp: 190,
    coins: 65,
    ai: 98.1,
    gps: "6.5155° N, 3.4014° E",
    tip: "Arrive early for the upper deck. Shade is limited after 11am.",
    tags: ["Commuter Hub", "High-Value"],
    photo: "from-sky-500/30 via-cyan-700/20 to-slate-900/40",
  },
  {
    id: 134,
    name: "Old Market Archive",
    cat: "Culture & Faith",
    icon: Church,
    when: "2w ago",
    xp: 205,
    coins: 75,
    ai: 98.9,
    gps: "6.5334° N, 3.3708° E",
    tip: "The archive clerk shares old city photos if you ask politely.",
    tags: ["Heritage", "Story Rich"],
    photo: "from-amber-500/30 via-rose-900/40 to-stone-900/50",
  },
  {
    id: 133,
    name: "Skyline Rooftop Court",
    cat: "High-Value",
    icon: Trophy,
    when: "2w ago",
    xp: 340,
    coins: 140,
    ai: 99.4,
    gps: "6.5278° N, 3.3928° E",
    tip: "Access is limited. Sunset shots here consistently score higher than average.",
    tags: ["High-Value", "Sunset", "Limited Access"],
    photo: "from-fuchsia-500/40 via-purple-700/30 to-indigo-900/40",
  },
  {
    id: 132,
    name: "Quarterly Street Jam",
    cat: "This Week",
    icon: Sparkles,
    when: "This week",
    xp: 310,
    coins: 100,
    ai: 99.0,
    gps: "6.5222° N, 3.3818° E",
    tip: "Pop-up performers rotate every Friday. Arrive before 7pm for the best crowd.",
    tags: ["Trending", "This Week"],
    photo: "from-emerald-500/30 via-primary/30 to-cyan-700/20",
  },
  {
    id: 131,
    name: "Laneway Sketch Garden",
    cat: "Hidden Gems",
    icon: Sparkles,
    when: "This week",
    xp: 285,
    coins: 90,
    ai: 99.5,
    gps: "6.5251° N, 3.3874° E",
    tip: "The mural changes weekly. Look for the chalk arrows behind the kiosk.",
    tags: ["Hidden Gem", "Fresh Drop"],
    photo: "from-fuchsia-500/40 via-rose-500/30 to-slate-900/40",
  },
];

const missionFilters = [
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
    count: missions.filter((m) => m.cat === "Food & Drinks").length,
  },
  {
    id: "transport",
    label: "Transport",
    icon: Bus,
    description: "Transit and mobility spots",
    accent: "text-sky-300",
    count: missions.filter((m) => m.cat === "Transport").length,
  },
  {
    id: "culture",
    label: "Culture",
    icon: Church,
    description: "Heritage and faith locations",
    accent: "text-amber-200",
    count: missions.filter((m) => m.cat === "Culture & Faith").length,
  },
  {
    id: "hidden",
    label: "Hidden Gems",
    icon: Sparkles,
    description: "Low-visibility discoveries",
    accent: "text-fuchsia-300",
    count: missions.filter((m) => m.tags.includes("Hidden Gem") || m.cat === "Hidden Gems").length,
  },
  {
    id: "high-value",
    label: "High-Value",
    icon: BadgePercent,
    description: "Top scoring captures",
    accent: "text-emerald-300",
    count: missions.filter((m) => m.tags.includes("High-Value") || m.cat === "High-Value").length,
  },
  {
    id: "week",
    label: "This Week",
    icon: MessageSquareText,
    description: "Fresh missions from this week",
    accent: "text-sky-300",
    count: missions.filter((m) => m.when === "This week" || m.when === "This week" || m.when === "This week").length,
  },
];

const filterMatch: Record<string, (mission: (typeof missions)[number]) => boolean> = {
  all: () => true,
  food: (mission) => mission.cat === "Food & Drinks",
  transport: (mission) => mission.cat === "Transport",
  culture: (mission) => mission.cat === "Culture & Faith",
  hidden: (mission) => mission.tags.includes("Hidden Gem") || mission.cat === "Hidden Gems",
  "high-value": (mission) => mission.tags.includes("High-Value") || mission.cat === "High-Value",
  week: (mission) => mission.when === "This week" || mission.when === "1w ago" || mission.when === "2h ago",
};

export function MissionLog() {
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredMissions = useMemo(
    () => missions.filter(filterMatch[activeFilter] ?? filterMatch.all),
    [activeFilter],
  );

  const stats = useMemo(() => {
    const visible = filteredMissions.length;
    const xp = filteredMissions.reduce((sum, mission) => sum + mission.xp, 0);
    const coins = filteredMissions.reduce((sum, mission) => sum + mission.coins, 0);
    const avgAi = visible === 0 ? 0 : filteredMissions.reduce((sum, mission) => sum + mission.ai, 0) / visible;

    return { visible, xp, coins, avgAi };
  }, [filteredMissions]);

  return (
    <div>
      <Wrap title="Mission Log" subtitle="Verified captures · AI confidence visible">
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
            const Icon = m.icon;
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
      </Wrap>
    </div>
  );
}

export function Leaderboard() {
  const { user } = useDashboard();
  const root = useReveal();

  const top = [
    { rank: 1, name: "NovaRunner", xp: 24890, missions: 312, streak: 41, badge: "Diamond" },
    { rank: 2, name: "PixelHawk", xp: 19120, missions: 254, streak: 28, badge: "Diamond" },
    { rank: 3, name: "CityFox", xp: 18760, missions: 240, streak: 22, badge: "Gold" },
  ];
  const list = [
    { rank: 4, name: "MapMage", xp: 17900, missions: 230, streak: 19 },
    { rank: 5, name: "QuestSeeker", xp: 16200, missions: 210, streak: 17 },
    { rank: 6, name: "TrailBlaze", xp: 15770, missions: 198, streak: 14 },
    { rank: 7, name: "NeonWalker", xp: 14990, missions: 189, streak: 11 },
    { rank: 8, name: "EchoPath", xp: 13880, missions: 175, streak: 9 },
  ];

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
                <p className="mt-2 text-xs text-muted-foreground">{p.xp.toLocaleString()} XP</p>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-muted-foreground">
                  <span>{p.missions} 📜</span>
                  <span className="text-orange-300">🔥 {p.streak}</span>
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
              xp={user.points}
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
  xp,
  missions,
  streak,
  highlight,
}: {
  rank: number;
  name: string;
  xp: number;
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
      <span className="col-span-2 text-right text-xs text-orange-300">🔥 {streak}</span>
      <span className={`col-span-2 text-right ${highlight ? "text-primary-glow" : ""}`}>
        {xp.toLocaleString()}
      </span>
    </div>
  );
}

const shopItems = [
  {
    name: "2x XP Booster",
    price: 300,
    type: "Booster",
    icon: Zap,
    desc: "Double XP on every verified mission for 24h.",
    detail: "Stacks with streak bonus · Activates instantly",
    tint: "from-amber-500/30 to-orange-700/20",
  },
  {
    name: "Search Radar",
    price: 450,
    type: "Booster",
    icon: Radar,
    desc: "Reveals nearby Hidden Gem pins within 2km radius.",
    detail: "5 uses · Lasts 30 minutes each",
    tint: "from-primary/30 to-cyan-700/20",
  },
  {
    name: "Streak Shield",
    price: 250,
    type: "Booster",
    icon: ShieldCheck,
    desc: "Protects your daily streak for one missed day.",
    detail: "Auto-applies when you skip · 1 charge",
    tint: "from-emerald-500/30 to-teal-700/20",
  },
  {
    name: "10% off Cafe Lumière",
    price: 150,
    type: "Coupon",
    icon: Ticket,
    desc: "Sip + scroll at the city's quietest brew bar.",
    detail: "Valid 30 days · QR at checkout",
    tint: "from-rose-500/30 to-pink-700/20",
  },
  {
    name: "Transit Voucher",
    price: 600,
    type: "Coupon",
    icon: Bus,
    desc: "Free 5-trip pass on city transport network.",
    detail: "Activate within 14 days · Single user",
    tint: "from-yellow-500/30 to-amber-700/20",
  },
  {
    name: "Diamond Avatar Frame",
    price: 1200,
    type: "Cosmetic",
    icon: Crown,
    desc: "Animated rank frame visible on leaderboards.",
    detail: "Permanent · Unlocks at Gold rank+",
    tint: "from-fuchsia-500/30 to-purple-700/20",
  },
  {
    name: "Mystery Loot Box",
    price: 500,
    type: "Pack",
    icon: Gift,
    desc: "Random booster + 1-3 partner coupons.",
    detail: "Guaranteed value 700+ 🪙",
    tint: "from-indigo-500/30 to-blue-700/20",
  },
  {
    name: "Mission Token",
    price: 200,
    type: "Pack",
    icon: Award,
    desc: "Skip GPS proximity check on next capture.",
    detail: "1 use · Photo + AI verify still required",
    tint: "from-slate-500/30 to-zinc-700/20",
  },
  {
    name: "Night Ride Pass",
    price: 380,
    type: "Travel",
    icon: Bus,
    desc: "Free late-night transit credits for 3 city hops.",
    detail: "Expires in 7 days · Peak hours included",
    tint: "from-sky-500/30 to-cyan-700/20",
  },
  {
    name: "Museum Access",
    price: 260,
    type: "Pass",
    icon: Church,
    desc: "Unlock heritage partner venues and guided entries.",
    detail: "Valid at 12 locations · Weekends only",
    tint: "from-amber-300/30 to-yellow-700/20",
  },
  {
    name: "Photo Boost",
    price: 420,
    type: "Boost",
    icon: Camera,
    desc: "Boost mission photo score for one high-value capture.",
    detail: "Single use · Improves AI confidence",
    tint: "from-fuchsia-500/30 to-purple-700/20",
  },
  {
    name: "Creator Badge",
    price: 700,
    type: "Cosmetic",
    icon: Star,
    desc: "Show a rare profile badge on the leaderboard.",
    detail: "Permanent · Gold rank+ only",
    tint: "from-emerald-500/30 to-teal-700/20",
  },
];

export function RewardsShop() {
  const { user } = useDashboard();

  return (
    <div>
      <Wrap title="Rewards Shop" subtitle="Spend coins on perks and partner deals">
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-primary/40 bg-gradient-card p-5 shadow-glow lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Wallet Balance</p>
                <p className="mt-1 text-4xl font-bold text-foreground">🪙 {user.coins.toLocaleString()}</p>
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
            const Icon = it.icon;
            return (
              <article
                key={it.name}
                className="flex flex-col rounded-2xl border border-border/60 bg-gradient-card p-4 transition-all hover:-translate-y-1 hover:border-primary/50 hover:shadow-glow"
              >
                <div className={`flex h-24 items-center justify-center rounded-xl bg-linear-to-br ${it.tint} text-foreground`}>
                  <Icon className="h-9 w-9 text-primary-glow drop-shadow" />
                </div>
                <div className="mt-3 flex items-start justify-between">
                  <p className="text-sm font-semibold text-foreground">{it.name}</p>
                  <span className="rounded-md border border-border/60 bg-surface/40 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {it.type}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{it.desc}</p>
                <p className="mt-2 text-[10px] text-primary-glow">{it.detail}</p>
                <button className="mt-3 w-full rounded-full bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-glow">
                  Buy · 🪙 {it.price}
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
  const friends = [
    { name: "Lina", status: "Hunting Hidden Gems · 1.2km away", live: true, xp: 12480, icon: Sparkles },
    { name: "Tobi", status: "In transit to Marina Café", live: true, xp: 9840, icon: Bus },
    { name: "Zara", status: "Idle · last seen 2h ago", live: false, xp: 15220, icon: Coffee },
    { name: "Kai", status: "Captured 3 missions today", live: true, xp: 18900, icon: Camera },
  ];
  const teamQuests = [
    {
      title: "Marina Sunset Trail",
      desc: "3 explorers must check in at 3 spots within 1 hour.",
      reward: "+800 XP each · +200 🪙 bonus",
      progress: 66,
      slots: "2 / 3",
    },
    {
      title: "Heritage Loop",
      desc: "Photograph 5 historic buildings as a duo.",
      reward: "+600 XP each · Diamond frame chance",
      progress: 20,
      slots: "1 / 2",
    },
  ];

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
              {friends.map((f) => {
                const Icon = f.icon;
                return (
                  <div
                    key={f.name}
                    className="rounded-2xl border border-border/40 bg-surface/40 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-primary text-xs font-bold text-primary-foreground">
                          {f.name[0]}
                        </div>
                        <span
                          className={`absolute -right-0.5 -bottom-0.5 h-3 w-3 rounded-full border-2 border-black ${
                            f.live ? "bg-success animate-pulse" : "bg-muted"
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">{f.name}</p>
                        <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
                          <Icon className="h-3 w-3 text-primary-glow" />
                          {f.status}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3 text-xs">
                      <span className="text-muted-foreground">Crew score</span>
                      <span className="font-mono text-primary-glow">{f.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-primary/40 bg-gradient-card p-5 shadow-glow">
              <Share2 className="h-5 w-5 text-primary-glow" />
              <p className="mt-3 text-sm font-semibold text-foreground">Your Referral Code</p>
              <p className="mt-2 font-mono text-2xl tracking-widest text-primary-glow">SMART-MAP-2026</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Earn <span className="text-primary-glow">+500 🪙</span> when a friend completes their first mission.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-border/60 bg-surface/40 p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Invited</p>
                  <p className="text-sm font-bold text-foreground">12</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-surface/40 p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Active</p>
                  <p className="text-sm font-bold text-success">7</p>
                </div>
                <div className="rounded-lg border border-border/60 bg-surface/40 p-2">
                  <p className="text-[10px] uppercase text-muted-foreground">Earned</p>
                  <p className="text-sm font-bold text-amber-300">3.5k</p>
                </div>
              </div>
              <button className="mt-4 w-full rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Share to Socials
              </button>
            </div>

            <div className="rounded-3xl border border-border/60 bg-gradient-card p-5">
              <p className="text-xs uppercase tracking-widest text-muted-foreground">Live Network</p>
              <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-border/40 bg-surface/40 p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Circles</p>
                  <p className="text-lg font-bold text-foreground">04</p>
                </div>
                <div className="rounded-xl border border-border/40 bg-surface/40 p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Live</p>
                  <p className="text-lg font-bold text-success">03</p>
                </div>
                <div className="rounded-xl border border-border/40 bg-surface/40 p-3">
                  <p className="text-[10px] uppercase text-muted-foreground">Invites</p>
                  <p className="text-lg font-bold text-primary-glow">12</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="mb-3 text-sm font-semibold text-foreground">Open Team Quests</h3>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {teamQuests.map((q) => (
              <article
                key={q.title}
                className="rounded-3xl border border-border/60 bg-gradient-card p-5 transition-all hover:-translate-y-1 hover:border-primary/50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{q.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{q.desc}</p>
                  </div>
                  <span className="rounded-full border border-primary/30 bg-primary/15 px-2 py-1 text-[10px] text-primary-glow">{q.slots}</span>
                </div>
                <p className="mt-4 text-[11px] text-amber-300">{q.reward}</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${q.progress}%` }} />
                </div>
                <button className="mt-4 w-full rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-xs font-semibold text-primary-glow hover:bg-primary/20">
                  Join Quest
                </button>
              </article>
            ))}
          </div>
        </div>
      </Wrap>
    </div>
  );
}

export function SettingsView() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [displayName, setDisplayName] = useState("Alex Morgan");
  const [bio, setBio] = useState("Urban explorer, coffee hunter");
  const [city, setCity] = useState("Lagos · West Region");
  const [gpsHighAccuracy, setGpsHighAccuracy] = useState(true);
  const [aiCalibrationAssist, setAiCalibrationAssist] = useState(true);
  const [incognitoMode, setIncognitoMode] = useState(false);
  const [locationGhosting, setLocationGhosting] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);

  return (
    <div>
      <Wrap title="Settings" subtitle="Account intelligence and control">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-3xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-blue-300/30 bg-linear-to-br from-blue-500 via-indigo-500 to-cyan-500 text-2xl font-bold text-white shadow-lg shadow-blue-950/40">
                  AM
                </div>
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">Profile</p>
                  <h3 className="mt-1 text-xl font-semibold text-foreground">Identity and location</h3>
                  <p className="mt-1 text-sm text-muted-foreground">Personalize your public identity without losing the quick-edit flow.</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditingProfile((value) => !value)}
                className="rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
              >
                {isEditingProfile ? "Save profile" : "Edit profile"}
              </button>
            </div>

            <div className="mt-5 grid gap-4">
              <div className="rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-elegant">
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Profile summary</p>
                <div className="mt-3 grid grid-cols-1 gap-3 text-sm">
                  <div className="rounded-xl border border-border/40 bg-surface/40 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Display Name</p>
                    {isEditingProfile ? (
                      <input
                        value={displayName}
                        onChange={(event) => setDisplayName(event.target.value)}
                        className="mt-2 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground outline-none focus:border-primary/40"
                      />
                    ) : (
                      <p className="mt-2 font-medium text-foreground">{displayName}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-border/40 bg-surface/40 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">City</p>
                    {isEditingProfile ? (
                      <input
                        value={city}
                        onChange={(event) => setCity(event.target.value)}
                        className="mt-2 w-full rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground outline-none focus:border-primary/40"
                      />
                    ) : (
                      <p className="mt-2 font-medium text-foreground">{city}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-border/40 bg-surface/40 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Bio</p>
                    {isEditingProfile ? (
                      <textarea
                        rows={4}
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        className="mt-2 w-full resize-none rounded-lg border border-border bg-surface px-2 py-2 text-sm text-foreground outline-none focus:border-primary/40"
                      />
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-foreground">{bio}</p>
                    )}
                  </div>
                  <div className="rounded-xl border border-border/40 bg-surface/40 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Badge</p>
                    <p className="mt-2 text-sm font-medium text-foreground">City explorer</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">Shown across social and discovery panels</p>
                  </div>
                  <div className="rounded-xl border border-border/40 bg-surface/40 p-3">
                    <p className="text-[10px] uppercase text-muted-foreground">Profile score</p>
                    <p className="mt-2 text-sm font-medium text-foreground">92% complete</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">Add one more detail to unlock higher visibility</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-elegant">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Identity rules</p>
                  <p className="mt-2 text-sm text-foreground">Editable once / 30 days</p>
                  <p className="mt-1 text-xs text-muted-foreground">Your display name is locked after saving, but bio and city can still be refreshed later.</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-elegant">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Public presence</p>
                  <p className="mt-2 text-sm text-foreground">Live map visibility</p>
                  <p className="mt-1 text-xs text-muted-foreground">Control how much location detail appears in the feed and social panels.</p>
                </div>
                <div className="rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-elegant">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Activity</p>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="rounded-xl border border-border/40 bg-surface/40 p-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Missions</p>
                      <p className="mt-1 text-sm font-semibold text-foreground">142</p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-surface/40 p-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Live</p>
                      <p className="mt-1 text-sm font-semibold text-success">On</p>
                    </div>
                    <div className="rounded-xl border border-border/40 bg-surface/40 p-2">
                      <p className="text-[10px] uppercase text-muted-foreground">Rank</p>
                      <p className="mt-1 text-sm font-semibold text-primary-glow">A+</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-3xl border border-border/60 bg-gradient-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Satellite className="h-4 w-4 text-primary-glow" />
                <p className="text-sm font-semibold text-foreground">Device Intelligence</p>
              </div>
              <div className="space-y-3">
                <Toggle label="GPS — High Accuracy" on={gpsHighAccuracy} onToggle={() => setGpsHighAccuracy((value) => !value)} hint="Drains battery faster" />
                <Toggle label="AI Calibration assist" on={aiCalibrationAssist} onToggle={() => setAiCalibrationAssist((value) => !value)} hint="Camera test in low light" />
                <Toggle label="Incognito Mode" on={incognitoMode} onToggle={() => setIncognitoMode((value) => !value)} hint="Hide from friends' live feed" />
                <Toggle label="Location Ghosting" on={locationGhosting} onToggle={() => setLocationGhosting((value) => !value)} hint="Snap to street, not exact pin" />
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-gradient-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary-glow" />
                <p className="text-sm font-semibold text-foreground">Account Security</p>
              </div>
              <div className="space-y-3">
                <Field label="Email" value="alex@smartmap.app" />
                <Toggle label="Two-Factor Authentication" on={twoFactorAuth} onToggle={() => setTwoFactorAuth((value) => !value)} />
                <Toggle label="Login alerts" on={loginAlerts} onToggle={() => setLoginAlerts((value) => !value)} />
                <Field label="Password" value="••••••••" hint="Last changed 12 days ago" />
              </div>
            </div>

            <div className="rounded-3xl border border-border/60 bg-gradient-card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary-glow" />
                <p className="text-sm font-semibold text-foreground">System Status</p>
              </div>
              <p className="text-sm text-muted-foreground">System details are shown in the map header and live quest panel.</p>
            </div>
          </div>
        </div>
      </Wrap>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
  ...rest
}: {
  title: string;
  icon: any;
  children: React.ReactNode;
} & Record<string, any>) {
  return (
    <div {...rest} className="rounded-2xl border border-border/60 bg-gradient-card p-5">
      <div className="mb-3 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary-glow" />
        <p className="text-sm font-semibold text-foreground">{title}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border/40 bg-surface/40 px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm text-foreground">{value}</p>
      {hint && <p className="text-[10px] text-muted-foreground">{hint}</p>}
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

function StatusRow({
  label,
  status,
  tone,
}: {
  label: string;
  status: string;
  tone: "success" | "muted";
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 bg-surface/40 px-3 py-2 text-xs">
      <span className="text-foreground">{label}</span>
      <span className={tone === "success" ? "text-success" : "text-muted-foreground"}>
        {tone === "success" && <span className="mr-1">●</span>}
        {status}
      </span>
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