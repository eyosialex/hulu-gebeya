import { useState } from "react";
import { useGeneratedQuiz, useSubmitGeneratedAnswer } from "@/hooks/useQuizzes";
import { useGeolocation } from "@/hooks/useGeolocation";
import { PageWrap } from "../PageWrap";
import {
  CheckCircle2, XCircle, RefreshCw, MapPin, Trophy, Coins,
  Sparkles, Loader2, ShieldCheck, AlertTriangle, Camera
} from "lucide-react";

export function QuizView() {
  const { lat, lng } = useGeolocation();
  const { data: quiz, isLoading, error, refetch, isFetching } = useGeneratedQuiz(lat, lng);
  const submitMutation = useSubmitGeneratedAnswer();

  const [selected, setSelected] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [reward, setReward] = useState<{ coins: number; points: number } | null>(null);

  const handleAnswer = (answer: string) => {
    if (answered || !quiz) return;
    setSelected(answer);
    setAnswered(true);

    const isCorrect = answer === quiz.correct_answer;
    submitMutation.mutate(
      { locationId: quiz.location_id, isCorrect },
      {
        onSuccess: (res: any) => {
          if (res?.reward) setReward(res.reward);
        },
      }
    );
  };

  const handleNext = () => {
    setSelected(null);
    setAnswered(false);
    setReward(null);
    refetch();
  };

  const isCorrect = answered && selected === quiz?.correct_answer;

  return (
    <PageWrap title="Photo Quiz" subtitle="Help verify nearby locations · Earn XP & Coins">
      {/* GPS status banner */}
      <div className={`mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-xs ${lat ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
        <MapPin className="h-3.5 w-3.5" />
        {lat
          ? `GPS Active · Scanning ${lat.toFixed(4)}, ${lng?.toFixed(4)} — 3km radius`
          : "GPS not found · Using Addis Ababa center as fallback"}
      </div>

      <div className="mx-auto max-w-lg">
        {/* Loading */}
        {(isLoading || isFetching) && (
          <div className="flex flex-col items-center justify-center gap-4 py-24">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-glow" />
            <p className="text-sm text-muted-foreground">Finding nearby locations to verify…</p>
          </div>
        )}

        {/* Error / No locations nearby */}
        {!isLoading && !isFetching && (error || quiz?.error) && (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-warning/30 bg-warning/10 p-8 text-center">
            <AlertTriangle className="h-10 w-10 text-warning" />
            <p className="font-semibold text-foreground">No locations nearby to verify</p>
            <p className="text-xs text-muted-foreground">
              Add a new place on the map within 3km, or ask a friend to add locations near you!
            </p>
            <button onClick={handleNext} className="mt-2 flex items-center gap-2 rounded-full bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-glow">
              <RefreshCw className="h-4 w-4" /> Try Again
            </button>
          </div>
        )}

        {/* Quiz Card */}
        {!isLoading && !isFetching && quiz && !quiz.error && (
          <div className="rounded-2xl border border-border/60 bg-gradient-card shadow-elegant overflow-hidden">
            {/* Photo (if exists) */}
            {quiz.photo_url ? (
              <div className="relative aspect-video w-full overflow-hidden bg-black/60">
                <img src={quiz.photo_url} alt="Location" className="h-full w-full object-cover" />
                <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/70 px-2.5 py-1 text-[10px] backdrop-blur">
                  <Camera className="h-3 w-3 text-primary-glow" />
                  <span className="text-foreground">Photo Verification</span>
                </div>
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary/10 to-surface/40">
                <div className="flex flex-col items-center gap-2">
                  <ShieldCheck className="h-8 w-8 text-primary-glow" />
                  <p className="text-[10px] uppercase tracking-widest text-primary-glow">Knowledge Check</p>
                </div>
              </div>
            )}

            <div className="p-5">
              <div className="flex items-start justify-between gap-4">
                {/* Question */}
                <div>
                  <p className="text-base font-semibold text-foreground">{quiz.question}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-widest text-primary-glow">
                    +{quiz.reward.coins} Coins · +{quiz.reward.points} XP on correct answer
                  </p>
                </div>
                
                {/* Navigation Link */}
                {quiz.target_coords && (
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${quiz.target_coords.lat},${quiz.target_coords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
                    title="Get Directions"
                  >
                    <MapPin className="h-3.5 w-3.5" />
                    Navigate
                  </a>
                )}
              </div>

              {/* Multiple Choice Options */}
              {quiz.mode === "choice" && quiz.options && (
                <div className="mt-4 grid gap-2">
                  {quiz.options.map((opt) => {
                    const isSelected = selected === opt;
                    const correct = opt === quiz.correct_answer;
                    let cls = "rounded-xl border p-3.5 text-left text-sm font-medium transition-all";
                    if (!answered) {
                      cls += " border-border/40 bg-surface/40 hover:border-primary/50 hover:bg-surface/60 cursor-pointer";
                    } else if (correct) {
                      cls += " border-success bg-success/15 text-success";
                    } else if (isSelected) {
                      cls += " border-destructive bg-destructive/15 text-destructive";
                    } else {
                      cls += " border-border/20 bg-surface/20 text-muted-foreground opacity-60";
                    }
                    return (
                      <button key={opt} className={cls} onClick={() => handleAnswer(opt)} disabled={answered}>
                        <div className="flex items-center justify-between">
                          <span>{opt}</span>
                          {answered && correct && <CheckCircle2 className="h-4 w-4 text-success" />}
                          {answered && isSelected && !correct && <XCircle className="h-4 w-4 text-destructive" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* True / False Options */}
              {quiz.mode === "binary" && (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {["True", "False"].map((opt) => {
                    const isSelected = selected === opt;
                    const correct = opt === quiz.correct_answer;
                    let cls = "rounded-xl border py-4 text-sm font-bold transition-all";
                    if (!answered) {
                      cls += " border-border/40 bg-surface/40 hover:border-primary/50 cursor-pointer";
                    } else if (correct) {
                      cls += " border-success bg-success/15 text-success";
                    } else if (isSelected) {
                      cls += " border-destructive bg-destructive/15 text-destructive";
                    } else {
                      cls += " border-border/20 opacity-50 text-muted-foreground";
                    }
                    return (
                      <button key={opt} className={cls} onClick={() => handleAnswer(opt)} disabled={answered}>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Result & Reward */}
              {answered && (
                <div className={`mt-4 rounded-xl p-3 text-center text-sm font-semibold ${isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                  {isCorrect ? (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" /> Correct! Location Verified ✅
                      </div>
                      {reward && (
                        <div className="flex items-center gap-3 text-xs text-foreground mt-1">
                          <span className="text-amber-300">+{reward.coins} 🪙</span>
                          <span className="text-primary-glow">+{reward.points} XP</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <XCircle className="h-5 w-5" /> Not quite — The correct answer was: <span className="font-bold ml-1">{quiz.correct_answer}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Next Button */}
              {answered && (
                <button
                  onClick={handleNext}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-3.5 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:scale-[1.02]"
                >
                  <RefreshCw className="h-4 w-4" /> Next Question
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </PageWrap>
  );
}
