import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useDashboard } from "../DashboardContext";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { Crown, Trophy, Medal } from "lucide-react";
import { PageWrap } from "../PageWrap";

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
      <PageWrap title="Leaderboard" subtitle="Climb the ranks across your city">
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
            <LeaderboardRow key={p.rank} {...p} />
          ))}
          <div className="border-t border-primary/40 bg-primary/10">
            <LeaderboardRow
              rank={47}
              name={`${user.name} (you)`}
              points={user.points}
              missions={user.totalMissions}
              streak={user.streak}
              highlight
            />
          </div>
        </div>
      </PageWrap>
    </div>
  );
}

function LeaderboardRow({
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
      <span className="col-span-2 text-right text-xs text-orange-300">🔥 {streak}</span>
      <span className={`col-span-2 text-right ${highlight ? "text-primary-glow" : ""}`}>
        {points.toLocaleString()}
      </span>
    </div>
  );
}
