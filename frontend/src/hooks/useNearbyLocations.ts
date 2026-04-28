import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export type MapLocation = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  points: number;
  distance: number;
  difficulty: "Easy" | "Medium" | "High";
  isHot: boolean;
  statusText: string;
};

export function useNearbyLocations(lat: number | null, lng: number | null) {
  return useQuery<MapLocation[]>({
    queryKey: ["nearbyLocations", { lat, lng }],
    queryFn: async () => {
      if (lat === null || lng === null) return [];
      const data = await apiRequest(`/locations/nearby?lat=${lat}&lng=${lng}`);
      return data.map((loc: any) => ({
        id: loc.id,
        name: loc.name,
        category: (loc.category || "transport").toLowerCase(),
        lat: loc.latitude || loc.lat,
        lng: loc.longitude || loc.lng,
        points: loc.points || 100,
        distance: Number(loc.distance?.toFixed(2) || 0),
        difficulty: loc.difficulty || "Medium",
        isHot: !!loc.isHot,
        statusText: loc.status || "Unclaimed",
      }));
    },
    enabled: lat !== null && lng !== null,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}
