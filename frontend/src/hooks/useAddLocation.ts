import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

type NewLocation = {
  name: string;
  category: string;
  description: string;
  latitude: number;
  longitude: number;
};

export function useAddLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("/locations", {
        method: "POST",
        body: data, // Now passing FormData directly
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["nearbyLocations"] });
    },
  });
}
