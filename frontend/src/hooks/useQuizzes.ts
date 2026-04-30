import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export type GeneratedQuiz = {
  quiz_id: string;
  location_id: string;
  photo_url: string | null;
  question: string;
  mode: "choice" | "binary";
  options?: string[];
  correct_answer: string;
  difficulty: number;
  reward: { coins: number; points: number };
  target_coords?: { lat: number; lng: number };
  type: "photo" | "text_only";
};

// Calls the AI-powered quiz generator with GPS coords for 3km radius search
export function useGeneratedQuiz(lat: number | null, lng: number | null) {
  return useQuery<GeneratedQuiz>({
    queryKey: ["generatedQuiz", lat, lng],
    queryFn: async () => {
      const userLat = lat ?? 8.9806;  // fallback to Addis Ababa center
      const userLng = lng ?? 38.7578;
      return apiRequest(`/missions/quiz/generate?lat=${userLat}&lng=${userLng}`);
    },
    enabled: true, // always run, fallback coords handle missing GPS
    retry: 1,
    staleTime: 0, // always fetch fresh quiz
  });
}

// Submit a quiz answer to the ML engine for scoring
export function useSubmitGeneratedAnswer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      locationId,
      isCorrect,
    }: {
      locationId: string;
      isCorrect: boolean;
    }) => {
      return apiRequest("/missions/quiz/submit", {
        method: "POST",
        body: JSON.stringify({ location_id: locationId, is_correct: isCorrect }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["generatedQuiz"] });
      queryClient.invalidateQueries({ queryKey: ["missions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
