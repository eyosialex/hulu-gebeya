import { r as reactExports, T as jsxRuntimeExports } from "./worker-entry-X8GKX44T.js";
import { u as useDashboard } from "./DashboardContext-DGK1GyF7.js";
import { T as Target, F as Flame } from "./target-ZwXfwS_l.js";
import { S as ShieldCheck } from "./shield-check-Drr6gIYR.js";
import { c as createLucideIcon } from "./router-CLELjKJC.js";
import { C as Camera } from "./camera-COOhQyQn.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
const __iconNode = [
  ["path", { d: "M16 7h6v6", key: "box55l" }],
  ["path", { d: "m22 7-8.5 8.5-5-5L2 17", key: "1t1m79" }]
];
const TrendingUp = createLucideIcon("trending-up", __iconNode);
function Heatmap() {
  const cells = reactExports.useMemo(() => {
    return Array.from({ length: 365 }, (_, i) => {
      const seed = (i * 9301 + 49297) % 233280;
      const r = seed / 233280;
      const v = r < 0.55 ? 0 : r < 0.75 ? 1 : r < 0.9 ? 2 : 3;
      return v;
    });
  }, []);
  const colors = ["bg-surface/60", "bg-primary/30", "bg-primary/60", "bg-primary-glow"];
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "overflow-x-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "div",
      {
        className: "grid grid-flow-col grid-rows-7 gap-0.75",
        style: { gridTemplateColumns: `repeat(${Math.ceil(365 / 7)}, minmax(0, 1fr))` },
        children: cells.map((v, i) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `h-2.5 w-2.5 rounded-[3px] ${colors[v]} transition-colors`,
            title: `Day ${i + 1}`
          },
          i
        ))
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mt-3 flex items-center gap-2 text-[10px] text-muted-foreground", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "Less" }),
      colors.map((c, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `h-2.5 w-2.5 rounded-[3px] ${c}` }, i)),
      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "More" })
    ] })
  ] });
}
const recent = [
  { name: "City Central Taxi Terminal", cat: "🚕 Transport", xp: 150, coins: 50, when: "2h ago" },
  { name: "Hidden Coffee Lane", cat: "🍔 Food", xp: 220, coins: 80, when: "Yesterday" },
  { name: "St. Mary Cathedral", cat: "⛪ Culture", xp: 180, coins: 60, when: "2d ago" }
];
function OverviewView() {
  const { user } = useDashboard();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6 p-6 lg:p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("header", { className: "flex flex-wrap items-end justify-between gap-3", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs uppercase tracking-widest text-muted-foreground", children: "Overview" }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "mt-1 text-3xl font-bold text-foreground", children: [
          "Welcome back, ",
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-gradient", children: user.name.split(" ")[0] })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-xs text-primary-glow", children: [
        "🎯 You are 450 XP away from #2 Rank in ",
        user.city
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4 lg:grid-cols-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Target, label: "Total Missions", value: user.totalMissions, accent: "text-primary-glow" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: Flame, label: "Daily Streak", value: `${user.streak} Days`, accent: "text-orange-300" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: ShieldCheck, label: "Trust Score", value: `${user.trustScore}%`, accent: "text-success" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(StatCard, { icon: TrendingUp, label: "Lifetime Points", value: user.points.toLocaleString(), accent: "text-accent" })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-4 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-lg font-semibold text-foreground", children: "Explorer Heatmap" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-muted-foreground", children: "365 days of exploration" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-muted-foreground", children: "218 active days" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Heatmap, {})
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "rounded-2xl border border-border/60 bg-gradient-card p-5 shadow-elegant", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "mb-4 text-lg font-semibold text-foreground", children: "Recent Activity" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("ul", { className: "space-y-3", children: recent.map((r) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "li",
        {
          className: "flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-surface/40 p-3",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary-glow", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Camera, { className: "h-4 w-4" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-medium text-foreground", children: r.name }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-muted-foreground", children: [
                  r.cat,
                  " · ",
                  r.when
                ] })
              ] })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-primary-glow", children: [
                "+",
                r.xp,
                " XP"
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-amber-300", children: [
                "+",
                r.coins,
                " 🪙"
              ] })
            ] })
          ]
        },
        r.name
      )) })
    ] })
  ] });
}
function StatCard({
  icon: Icon,
  label,
  value,
  accent
}) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "rounded-2xl border border-border/60 bg-gradient-card p-4 shadow-elegant", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] uppercase tracking-widest text-muted-foreground", children: label }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Icon, { className: `h-4 w-4 ${accent}` })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-2xl font-bold text-foreground", children: value })
  ] });
}
const SplitComponent = OverviewView;
export {
  SplitComponent as component
};
