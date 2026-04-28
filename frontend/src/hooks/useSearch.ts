import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

type SearchParams = {
  query: string;
  userLat: number;
  userLng: number;
};

type SearchResponse = {
  answer: string;
};

export function useSearch() {
  return useMutation({
    mutationFn: async ({ query, userLat, userLng }: SearchParams): Promise<SearchResponse> => {
      try {
        // Attempt real API call first
        return await apiRequest("/search", {
          method: "POST",
          body: JSON.stringify({ query, userLat, userLng }),
        });
      } catch (error) {
        // Deterministic Fallback Mock Logic (as per rules)
        console.warn("Search API failed, using deterministic mock logic.");
        
        const q = query.toLowerCase();
        let answer = "";

        if (q.includes("cafe") || q.includes("coffee")) {
          answer = "I've located 3 artisanal coffee spots nearby. 'The Brew Hub' is just 200m away with a high verification score.";
        } else if (q.includes("art") || q.includes("mural")) {
          answer = "There's a famous street art mural themed 'Urban Growth' behind the central station. Capture it for +150 XP!";
        } else if (q.includes("food") || q.includes("eat")) {
          answer = "You're in a great spot for street food! Heading 3 blocks North will take you to the night market area.";
        } else {
          answer = "Based on your location, I recommend checking out the 'Hidden Garden' 500m West. It's a low-traffic zone perfect for a quiet mission.";
        }

        return { answer };
      }
    },
  });
}
