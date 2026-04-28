import { useState } from "react";
import { useQuizzes, useSubmitQuizAnswer, type Quiz } from "@/hooks/useQuizzes";
import { PageWrap } from "../PageWrap";

export function QuizView() {
  const { data: quizzes = [], isLoading } = useQuizzes();
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <PageWrap title="Photo Quiz" subtitle="Identify locations">
       <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {quizzes.map((q) => (
             <button key={q.id} onClick={() => setActiveQuiz(q)} className="rounded-2xl border border-border/40 bg-gradient-card p-4 text-left hover:border-primary/50 transition-colors">
                <p className="text-sm font-bold text-foreground">{q.question}</p>
                <p className="text-xs text-muted-foreground mt-2">Worth: {q.points} XP</p>
             </button>
          ))}
          {quizzes.length === 0 && <p className="text-muted-foreground text-sm col-span-2">No quizzes available at the moment.</p>}
       </div>
    </PageWrap>
  );
}
