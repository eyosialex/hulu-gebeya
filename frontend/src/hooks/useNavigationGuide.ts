import { useQuery } from "@tanstack/react-query";

export type NavigationGuide = {
  instruction: string;
  distance: string;
  bearing: number;
  nextStep: string;
  robotPersona: string;
};

export function useNavigationGuide(
  origin: { lat: number; lng: number } | null,
  destination: { lat: number; lng: number } | null
) {
  return useQuery({
    queryKey: ["navigationGuide", origin?.lat, origin?.lng, destination?.lat, destination?.lng],
    queryFn: async () => {
      if (!origin || !destination) return null;
      
      const url = `http://localhost:5001/navigation/guide?lat=${origin.lat}&lng=${origin.lng}&dest_lat=${destination.lat}&dest_lng=${destination.lng}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch navigation guide");
      }
      return response.json() as Promise<NavigationGuide>;
    },
    enabled: !!origin && !!destination,
    refetchInterval: 5000, // Update every 5 seconds for live guidance
  });
}
