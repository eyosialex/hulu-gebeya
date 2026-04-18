import { r as reactExports, T as jsxRuntimeExports } from "./worker-entry-X8GKX44T.js";
const DashboardCtx = reactExports.createContext(null);
function DashboardProvider({ children }) {
  const [activeCategory, setActiveCategory] = reactExports.useState(null);
  const openCategory = (c) => {
    setActiveCategory(c);
  };
  const user = {
    name: "Alex Morgan",
    initials: "AM",
    rank: "Gold",
    level: 18,
    xp: 8420,
    xpNext: 1e4,
    coins: 2450,
    points: 18760,
    streak: 14,
    trustScore: 98.4,
    totalMissions: 142,
    city: "Lagos"
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(DashboardCtx.Provider, { value: { activeCategory, openCategory, user }, children });
}
function useDashboard() {
  const ctx = reactExports.useContext(DashboardCtx);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}
export {
  DashboardProvider as D,
  useDashboard as u
};
