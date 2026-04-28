import { createContext, useContext, useState, type ReactNode } from "react";

export type CategoryId =
  | "food"
  | "game"
  | "culture"
  | "transport"
  | "study"
  | "health"
  | "art"
  | "services"
  | "hidden";

export type ViewId =
  | "dashboard"
  | "map"
  | "missions"
  | "leaderboard"
  | "rewards"
  | "social"
  | "settings";

type User = {
  name: string;
  initials: string;
  rank: "Bronze" | "Silver" | "Gold" | "Diamond";
  level: number;
  xp: number;
  xpNext: number;
  coins: number;
  points: number;
  streak: number;
  trustScore: number;
  totalMissions: number;
  city: string;
};

type Ctx = {
  view: ViewId;
  setView: (v: ViewId) => void;
  activeCategory: CategoryId | null;
  openCategory: (c: CategoryId) => void;
  user: User;
};

const DashboardCtx = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [view, setView] = useState<ViewId>("dashboard");
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);

  const openCategory = (c: CategoryId) => {
    setActiveCategory(c);
    setView("map");
  };

  const user: User = {
    name: "Alex Morgan",
    initials: "AM",
    rank: "Gold",
    level: 18,
    xp: 8420,
    xpNext: 10000,
    coins: 2450,
    points: 18760,
    streak: 14,
    trustScore: 98.4,
    totalMissions: 142,
    city: "Lagos",
  };

  return (
    <DashboardCtx.Provider value={{ view, setView, activeCategory, openCategory, user }}>
      {children}
    </DashboardCtx.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}
