import { useDashboard } from "../DashboardContext";
import { useShop } from "@/hooks/useShop";
import { Zap, Radar, Ticket, Sparkles, Coffee, Bus, Church, Gem, Trophy, HeartPulse, Palette, Wrench } from "lucide-react";
import { PageWrap } from "../PageWrap";

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
};

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
      <PageWrap title="Rewards Shop" subtitle="Spend coins on perks and partner deals">
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
                  Buy · 🪙 {it.price}
                </button>
              </article>
            );
          })}
        </div>
      </PageWrap>
    </div>
  );
}
