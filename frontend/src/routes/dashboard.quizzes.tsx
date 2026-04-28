import { createFileRoute } from "@tanstack/react-router";
import { QuizView } from "@/components/dashboard/pages/QuizView";

export const Route = createFileRoute("/dashboard/quizzes")({
  component: QuizView,
});
