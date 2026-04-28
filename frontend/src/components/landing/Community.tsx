import { motion } from "framer-motion";
import {
  Crown,
  Trophy,
  Medal,
  ArrowRight,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

const leaders = [
  {
    rank: 1,
    name: "Alex H.",
    xp: "12,450",
    meta: "Streak: 12 Days",
    icon: Crown,
    tone: "from-amber-400 to-yellow-600",
    text: "text-amber-300",
  },
  {
    rank: 2,
    name: "Sarah M.",
    xp: "11,200",
    meta: "Missions: 45",
    icon: Trophy,
    tone: "from-slate-300 to-slate-500",
    text: "text-slate-200",
  },
  {
    rank: 3,
    name: "David K.",
    xp: "10,950",
    meta: "Region: Downtown",
    icon: Medal,
    tone: "from-orange-500 to-amber-700",
    text: "text-orange-300",
  },
];

const liveActivity = [
  {
    name: "Maya R.",
    text: "Found the best local spots and earned rewards every weekend!",
    badge: "Verified Explorer",
    achievement: "Hidden Gem Finder",
  },
  {
    name: "Jordan T.",
    text: "The photo quiz mode turned my commute into a daily adventure.",
    badge: "Verified Explorer",
    achievement: "Speedster",
  },
  {
    name: "Priya L.",
    text: "I discovered three new cafés in my own neighborhood. Wild.",
    badge: "Verified Explorer",
    achievement: "Foodie",
  },
];

export function Community() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-3">
            Community Hub
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold">
            Where Explorers <span className="text-gradient">Connect</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Leaderboard */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold">
                Top Explorers This Week
              </h3>
            </div>
            <div className="space-y-4">
              {leaders.map((l, i) => (
                <motion.div
                  key={l.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative rounded-2xl bg-gradient-card border border-border p-5 flex items-center gap-4 overflow-hidden group hover:border-primary/40 transition-all"
                >
                  <div
                    className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${l.tone}`}
                  />
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${l.tone} flex items-center justify-center shrink-0 shadow-glow`}
                  >
                    <l.icon className="w-7 h-7 text-background" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${l.text}`}>
                        #{l.rank}
                      </span>
                      <span className="font-display font-bold text-lg truncate">
                        {l.name}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {l.meta}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-xl font-extrabold text-gradient">
                      {l.xp}
                    </div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      XP
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <button className="mt-6 inline-flex items-center gap-2 text-sm text-primary hover:text-primary-glow transition-colors group">
              View Full Global Ranks
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Live activity */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-display text-2xl font-bold">
                Live From the Map
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                Live
              </div>
            </div>
            <div className="space-y-4">
              {liveActivity.map((a, i) => (
                <motion.div
                  key={a.name}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="rounded-2xl glass p-5 hover:border-accent/40 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-full bg-gradient-primary flex items-center justify-center font-display font-bold text-primary-foreground shrink-0">
                      {a.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                        "{a.text}"
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-sm">
                          — {a.name}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30">
                          <BadgeCheck className="w-3 h-3" /> {a.badge}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-accent/15 text-accent border border-accent/30">
                          <Sparkles className="w-3 h-3" /> {a.achievement}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
