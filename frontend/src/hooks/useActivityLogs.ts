import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export type ActivityLog = {
  id: string;
  action: string;
  details: string;
  points: number;
  coins: number;
  createdAt: string;
};

export function useActivityLogs() {
  return useQuery<ActivityLog[]>({
    queryKey: ["activityLogs"],
    queryFn: async () => {
      const resp = await apiRequest("/gamification/activity");
      return resp;
    },
  });
}
