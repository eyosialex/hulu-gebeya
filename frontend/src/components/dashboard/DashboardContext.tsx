import { createContext, useContext, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";
import { useNavigate } from "@tanstack/react-router";

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

export type User = {
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
  email?: string;
  bio?: string;
};

export type Activity = {
  missionId: string;
  name: string;
  cat: string;
  xp: number;
  coins: number;
  when: string;
};

type Ctx = {
  activeCategory: CategoryId | null;
  openCategory: (c: CategoryId) => void;
  user: User;
  recentActivity: Activity[];
  isLoading: boolean;
  logout: () => void;
};

const DashboardCtx = createContext<Ctx | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      return apiRequest("/dashboard/me");
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logout = () => {
    localStorage.removeItem("token");
    queryClient.clear();
    navigate({ to: "/signin" });
  };

  const openCategory = (c: CategoryId) => {
    setActiveCategory(c);
  };

  if (error) {
    logout();
    return null;
  }

  if (isLoading || !data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-glow" />
      </div>
    );
  }

  return (
    <DashboardCtx.Provider 
      value={{ 
        activeCategory, 
        openCategory, 
        user: {
          ...data.user,
          initials: data.user.initials || data.user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2),
          rank: data.user.rank || (data.user.points > 1000 ? "Gold" : "Bronze")
        }, 
        recentActivity: data.recentActivity || [], 
        isLoading, 
        logout 
      }}
    >
      {children}
    </DashboardCtx.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardCtx);
  if (!ctx) throw new Error("useDashboard must be used inside DashboardProvider");
  return ctx;
}