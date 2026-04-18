import { useState } from "react";
import { Camera, X, Sparkles } from "lucide-react";

export function SubmissionForm({
  target,
  category,
  onClose,
}: {
  target: string;
  category: string;
  onClose: () => void;
}) {
  const [step, setStep] = useState<"form" | "verifying" | "reward">("form");

  const submit = () => {
    setStep("verifying");
    setTimeout(() => setStep("reward"), 1600);
  };

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-primary/40 bg-gradient-card p-6 shadow-glow">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground hover:bg-surface hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "form" && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-primary-glow">Guided Submission</p>
            <h3 className="mt-1 text-xl font-bold text-foreground">{target}</h3>
            <p className="text-xs text-muted-foreground">{category}</p>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-xs text-muted-foreground">Live Photo (AI verified)</label>
                <div className="mt-1 flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-border bg-surface/40 text-muted-foreground">
                  <div className="flex flex-col items-center gap-1 text-xs">
                    <Camera className="h-6 w-6 text-primary-glow" />
                    Tap to open camera
                  </div>
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Spot Name</label>
                <input
                  defaultValue={target}
                  className="mt-1 w-full rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-foreground"
                />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Explorer Tip</label>
                <textarea
                  rows={3}
                  placeholder="What makes this place special?"
                  className="mt-1 w-full resize-none rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-foreground"
                />
              </div>
            </div>

            <button
              onClick={submit}
              className="mt-6 w-full rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Submit for AI Verification
            </button>
          </>
        )}

        {step === "verifying" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <p className="mt-4 text-sm text-foreground">Verifying liveness & GPS match…</p>
          </div>
        )}

        {step === "reward" && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="relative">
              <Sparkles className="h-14 w-14 animate-float text-primary-glow" />
            </div>
            <h3 className="mt-3 text-2xl font-bold text-gradient">Mission Verified!</h3>
            <div className="mt-5 grid w-full grid-cols-3 gap-3">
              <Reward label="XP" value="+100" />
              <Reward label="Coins" value="+50" />
              <Reward label="Streak" value="+1d" />
            </div>
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow"
            >
              Find the next one
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Reward({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/60 p-3">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}
