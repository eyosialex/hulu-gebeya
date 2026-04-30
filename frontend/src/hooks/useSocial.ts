import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export type Friend = {
  userId: string;
  name: string;
  status: string;
  live: boolean;
  xp: number;
  categoryContext: string;
};

export type TeamQuest = {
  id: string;
  title: string;
  desc: string;
  rewardString: string;
  progressPercentage: number;
  slotsTaken: number;
  slotsTotal: number;
};

export function useSocial() {
  const { data: friends = [], isLoading: friendsLoading, error: friendsError, refetch: refetchFriends } = useQuery<Friend[]>({
    queryKey: ["friends"],
    queryFn: () => apiRequest("/social/friends"),
  });

  const { data: teamQuests = [], isLoading: questsLoading, error: questsError, refetch: refetchQuests } = useQuery<TeamQuest[]>({
    queryKey: ["quests"],
    queryFn: () => apiRequest("/social/quests"),
  });

  return { 
    friends, 
    teamQuests, 
    isLoading: friendsLoading || questsLoading, 
    error: friendsError || questsError, 
    refresh: () => {
      refetchFriends();
      refetchQuests();
    }
  };
}
