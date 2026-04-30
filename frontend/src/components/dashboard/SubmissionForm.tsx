import { useState } from "react";
import { Camera, X, Sparkles, AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/api";

export function SubmissionForm({
  locationId,
  target,
  category,
  userLat,
  userLng,
  isSimulator,
  onClose,
}: {
  locationId: string;
  target: string;
  category: string;
  userLat?: number;
  userLng?: number;
  isSimulator?: boolean;
  onClose: () => void;
}) {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<"form" | "verifying" | "reward">("form");
  const queryClient = useQueryClient();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const mutation = useMutation({
    mutationFn: (fd: FormData) => 
      apiRequest(`/locations/${locationId}/ai-verify`, { 
        method: "POST",
        body: fd
      }),
    onSuccess: () => {
      setStep("reward");
      queryClient.invalidateQueries({ queryKey: ["nearbyLocations"] });
      queryClient.invalidateQueries({ queryKey: ["missions"] });
    }
  });

  const submit = () => {
    if (!image && !isSimulator) {
      alert("Please capture a photo first!");
      return;
    }
    const fd = new FormData();
    fd.append("userLat", String(userLat || 0));
    fd.append("userLng", String(userLng || 0));
    fd.append("isSimulator", String(!!isSimulator));
    if (image) fd.append("verificationImage", image);

    setStep("verifying");
    mutation.mutate(fd);
  };

  return (
    <div className="fixed inset-0 z-2000 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl border border-primary/40 bg-gradient-card p-6 shadow-glow">
        <button
          onClick={onClose}
          disabled={mutation.isPending}
          className="absolute right-3 top-3 rounded-full p-2 text-muted-foreground hover:bg-surface hover:text-foreground disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {step === "form" && (
          <>
            <p className="text-[10px] uppercase tracking-widest text-primary-glow">Guided Submission</p>
            <h3 className="mt-1 text-xl font-bold text-foreground">{target}</h3>
            <p className="text-xs text-muted-foreground">{category}</p>

            <div className="mt-5 space-y-4">
              {mutation.isError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p>{(mutation.error as any)?.message || "Verification failed. Please try again."}</p>
                </div>
              )}

              <div>
                <label className="text-xs text-muted-foreground">Live Photo (AI verified)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  capture="environment" 
                  id="camera-input" 
                  className="hidden" 
                  onChange={handleImageChange}
                />
                <div 
                  onClick={() => document.getElementById("camera-input")?.click()}
                  className={`mt-1 flex h-48 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-all ${
                    preview ? "border-primary/60 bg-black/40" : "border-border bg-surface/40 hover:border-primary/40"
                  }`}
                >
                  {preview ? (
                    <img src={preview} alt="Capture" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                      <Camera className="h-8 w-8 text-primary-glow" />
                      <p>Tap to capture surroundings</p>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Explorer Tip</label>
                <textarea
                  rows={3}
                  placeholder="What makes this place special?"
                  className="mt-1 w-full resize-none rounded-lg border border-border bg-surface/60 px-3 py-2 text-sm text-foreground outline-none focus:border-primary/40"
                />
              </div>
            </div>

            <button
              onClick={submit}
              disabled={mutation.isPending}
              className="mt-6 w-full rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {mutation.isPending ? "Verifying..." : "Submit for AI Verification"}
            </button>
          </>
        )}

        {step === "verifying" && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-12 w-12 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-glow" />
            <p className="mt-6 text-sm font-medium text-foreground">Analyzing environment & GPS match…</p>
            <p className="mt-2 text-xs text-muted-foreground">SmartMap AI is verifying your capture</p>
          </div>
        )}

        {step === "reward" && (
          <div className="flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-300">
            <div className="relative">
              <Sparkles className="h-14 w-14 animate-float text-primary-glow" />
            </div>
            <h3 className="mt-3 text-2xl font-bold text-gradient">Mission Verified!</h3>
            {isSimulator && (
              <div className="mt-1 rounded-full bg-primary/20 px-3 py-0.5 text-[10px] font-bold tracking-widest text-primary-glow uppercase">
                Simulated Result
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              {isSimulator ? "Sandbox mode: Progress and rewards not saved" : "Location successfully claimed"}
            </p>
            
            <div className="mt-5 grid w-full grid-cols-3 gap-3">
              <Reward label="XP" value="+100" />
              <Reward label="Coins" value="+50" />
              <Reward label="Streak" value="+1d" />
            </div>
            
            <button
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-gradient-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-glow transition-all active:scale-[0.98]"
            >
              Continue Exploration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Reward({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/60 p-3 shadow-elegant">
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}