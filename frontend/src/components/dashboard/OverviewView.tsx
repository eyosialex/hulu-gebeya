import { useDashboard } from "./DashboardContext";
import { Heatmap } from "./Heatmap";
import { Flame, Target, ShieldCheck, TrendingUp, Camera } from "lucide-react";


export function OverviewView() {
  const { user, recentActivity } = useDashboard();

  const formatWhen = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Overview</p>
          <h1 className="mt-1 text-3xl font-bold text-foreground">
            Welcome back, <span className="text-gradient">{user.name.split(" ")[0]}</span>
          </h1>
        </div>
        <div className="rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs text-primary-glow">
          🎯 Current City: {user.city}
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Target} label="Total Missions" value={user.totalMissions} accent="text-primary-glow" />
        <StatCard icon={Flame} label="Daily Streak" value={`${user.streak} Days`} accent="text-orange-300" />
        <StatCard icon={ShieldCheck} label="Trust Score" value={`${user.trustScore}%`} accent="text-success" />
        <StatCard icon={TrendingUp} label="Lifetime Points" value={user.points.toLocaleString()} accent="text-accent" />
      </div>

      <section className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Explorer Heatmap</h2>
            <p className="text-xs text-muted-foreground">365 days of exploration</p>
          </div>
          <span className="text-xs text-muted-foreground">Active exploration track</span>
        </div>
        <Heatmap />
      </section>

      <section className="rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
        <h2 className="mb-4 text-lg font-semibold text-foreground">Recent Activity</h2>
        {recentActivity.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground text-sm">No activity recorded yet. Start exploring!</p>
        ) : (
          <ul className="space-y-3">
            {recentActivity.map((r) => (
              <li
                key={r.missionId}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-surface/40 p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary-glow">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.cat} · {formatWhen(r.when)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-primary-glow">+{r.xp} XP</p>
                  <p className="text-xs text-amber-300">+{r.coins} 🪙</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}


function StatCard({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: any;
  label: string;
  value: string | number;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-elegant">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-widest text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${accent}`} />
      </div>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
    </div>
  );
}