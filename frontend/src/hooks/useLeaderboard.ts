import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export type LeaderboardEntry = {
  rank: number;
  userId: string;
  name: string;
  points: number;
  missions: number;
  streak: number;
  badge: string;
};

export function useLeaderboard() {
  const { data, isLoading, error, refetch } = useQuery<LeaderboardEntry[]>({
    queryKey: ["leaderboard"],
    queryFn: () => apiRequest("/leaderboard/"),
  });

  return { 
    leaderboard: data || [], 
    isLoading, 
    error, 
    refresh: refetch 
  };
}
