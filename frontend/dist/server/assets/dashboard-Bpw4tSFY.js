import { T as jsxRuntimeExports, r as reactExports, Z as Outlet } from "./worker-entry-X8GKX44T.js";
import { u as useDashboard, D as DashboardProvider } from "./DashboardContext-DGK1GyF7.js";
import { A as AppSidebar } from "./AppSidebar-DwCs1LXN.js";
import { c as createLucideIcon } from "./router-CLELjKJC.js";
import "node:events";
import "node:async_hooks";
import "node:stream/web";
import "node:stream";
import "./church-Ce2-wemI.js";
import "./trophy-BFTLgV0Q.js";
const __iconNode = [
  ["path", { d: "M4 5h16", key: "1tepv9" }],
  ["path", { d: "M4 12h16", key: "1lakjw" }],
  ["path", { d: "M4 19h16", key: "1djgab" }]
];
const Menu = createLucideIcon("menu", __iconNode);
function MobileTopBar({ onMenu }) {
  const { user } = useDashboard();
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-border/60 bg-black/80 px-4 py-3 backdrop-blur lg:hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(
      "button",
      {
        onClick: onMenu,
        className: "rounded-lg border border-border/60 p-2 text-foreground",
        "aria-label": "Open menu",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "h-4 w-4" })
      }
    ),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-semibold text-foreground", children: "Smart Map" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 text-xs", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-amber-300", children: [
        "🪙 ",
        user.coins
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-primary-glow", children: [
        "L",
        user.level
      ] })
    ] })
  ] });
}
function DashboardShell() {
  const [mobileOpen, setMobileOpen] = reactExports.useState(false);
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen w-full bg-black text-foreground lg:grid lg:grid-cols-[minmax(260px,340px)_1fr]", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(AppSidebar, {}),
    mobileOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-50 bg-black/70 lg:hidden animate-fade-in", onClick: () => setMobileOpen(false), children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-y-0 left-0 w-[85%] max-w-sm animate-slide-in-right", style: {
      animation: "slide-in-right 0.25s ease-out"
    }, onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsx(AppSidebar, { variant: "mobile", onClose: () => setMobileOpen(false) }) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("main", { className: "relative z-0 min-w-0", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(MobileTopBar, { onMenu: () => setMobileOpen(true) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {})
    ] })
  ] });
}
const SplitComponent = () => /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardShell, {}) });
export {
  SplitComponent as component
};
