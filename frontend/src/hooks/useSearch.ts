import { useMutation } from "@tanstack/react-query";

const ML_ENGINE_URL = "http://localhost:5001";

export type RagResult = {
  name: string;
  category?: string;
  distance?: number;
  trust_score?: number;
  source?: string;
  osm_url?: string;
  verification_status?: string;
};

export type RagResponse = {
  query: string;
  answer: string;
  confidence: number;
  intent?: {
    category?: string | null;
    filters?: string[];
    location_hint?: string | null;
  };
  best_place?: RagResult | null;
  total_results: number;
  sources: {
    database: RagResult[];
    osm: RagResult[];
    overpass: RagResult[];
  };
};

type SearchParams = {
  query: string;
  userLat: number;
  userLng: number;
};

export function useSearch() {
  return useMutation({
    mutationFn: async ({ query, userLat, userLng }: SearchParams): Promise<RagResponse> => {
      const response = await fetch(`${ML_ENGINE_URL}/rag`, {
        method: "POST",
        headers: {
          "accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          location: { lat: userLat || 8.9806, lng: userLng || 38.7578 },
          fast_mode: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || "ML Engine error. Ensure it's running on port 5001.");
      }

      return response.json();
    },
  });
}
