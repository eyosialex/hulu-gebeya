import { useState } from "react";
import { X, MapPin, Loader2, Sparkles, Camera } from "lucide-react";
import { categories } from "./AppSidebar";
import { useAddLocation } from "@/hooks/useAddLocation";
import { motion, AnimatePresence } from "framer-motion";

export function AddLocationForm({ 
  lat, 
  lng, 
  onClose 
}: { 
  lat: number; 
  lng: number; 
  onClose: () => void 
}) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState(categories[0].id);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const addMutation = useAddLocation();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", name);
    fd.append("category", category);
    fd.append("description", description);
    fd.append("latitude", String(lat));
    fd.append("longitude", String(lng));
    if (image) {
      fd.append("image", image);
    }

    addMutation.mutate(fd, {
      onSuccess: () => onClose()
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
      animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
      className="fixed inset-0 z-4000 flex items-center justify-center bg-black/60 p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative w-full max-w-md overflow-y-auto max-h-[90vh] rounded-[2.5rem] border border-primary/30 bg-black/90 shadow-glow no-scrollbar"
      >
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-primary" />
        
        <div className="p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/20">
                <MapPin className="h-5 w-5 text-primary-glow" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Add New Place</h2>
                <p className="text-[10px] uppercase tracking-widest text-primary-glow">Community Contribution</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full border border-border/60 p-2 text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Location Name</label>
              <input 
                autoFocus
                required
                type="text"
                placeholder="e.g. Central Park Cafe"
                className="w-full rounded-2xl border border-border/40 bg-surface/40 p-4 text-sm text-foreground outline-none focus:border-primary/50 focus:bg-surface/60 transition-all"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Location Photo (Optional)</label>
              <input 
                type="file" 
                accept="image/*" 
                id="location-image" 
                className="hidden" 
                onChange={handleImageChange}
              />
              <div 
                onClick={() => document.getElementById("location-image")?.click()}
                className={`flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-all ${
                  preview ? "border-primary/60 bg-black/40" : "border-border/40 bg-surface/40 hover:border-primary/40"
                }`}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <Camera className="h-8 w-8 text-primary-glow" />
                    <p className="text-[11px]">Tap to add location photo</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Category</label>
              <div className="grid grid-cols-3 gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`flex flex-col items-center gap-1 rounded-xl border py-2 transition-all ${
                      category === c.id 
                        ? "border-primary bg-primary/10 text-foreground" 
                        : "border-border/40 bg-surface/40 text-muted-foreground hover:bg-surface/60"
                    }`}
                  >
                    <c.icon className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-medium">{c.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Description</label>
              <textarea 
                required
                placeholder="What makes this place special?"
                className="min-h-[80px] w-full rounded-2xl border border-border/40 bg-surface/40 p-4 text-sm text-foreground outline-none focus:border-primary/50 focus:bg-surface/60 transition-all resize-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
               <div className="flex items-center gap-2 text-[10px] text-primary-glow">
                 <Sparkles className="h-3 w-3" />
                 <span className="font-bold">Reward for Approval: 250 XP</span>
               </div>
               <p className="mt-1 text-[9px] text-muted-foreground leading-relaxed">
                 Coordinate Sync: {lat.toFixed(4)}, {lng.toFixed(4)}.
               </p>
            </div>

            <button 
              type="submit"
              disabled={addMutation.isPending}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-primary py-4 text-sm font-bold text-primary-foreground shadow-glow transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {addMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publish Location"}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
