import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export type Mission = {
  id: string;
  name: string;
  cat: string;
  when: string;
  xp: number;
  coins: number;
  ai: number;
  gps: string;
  lat: number;
  lng: number;
  tip: string;
  tags: string[];
  photo: string;
};

export function useMissions() {
  const { data, isLoading, error, refetch } = useQuery<{ missions: Mission[], stats: any }>({
    queryKey: ["missions"],
    queryFn: () => apiRequest("/missions/log"),
  });

  return { 
    missions: data?.missions || [], 
    stats: data?.stats,
    isLoading, 
    error, 
    refresh: refetch 
  };
}
