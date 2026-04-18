import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Share2, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Referral() {
  const [copied, setCopied] = useState(false);
  const code = "SMART-MAP-2026";

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative py-32 px-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[2rem] overflow-hidden bg-gradient-card border border-border p-10 md:p-14 text-center"
        >
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/30 rounded-full blur-[120px]" />
          <div className="absolute -bottom-32 right-0 w-96 h-96 bg-accent/20 rounded-full blur-[120px]" />

          <div className="relative">
            <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-6">
              <Gift className="w-4 h-4 text-accent" />
              <span className="text-xs font-semibold uppercase tracking-widest">Referral Bonus</span>
            </div>

            <h2 className="font-display text-4xl md:text-6xl font-extrabold mb-4">
              Better <span className="text-gradient">Together</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10">
              Exploration is a team sport. Invite a friend and you both bag a bonus.
            </p>

            <div className="inline-flex flex-col items-center gap-2 mb-8">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">You both earn</span>
              <div className="font-display text-6xl md:text-7xl font-extrabold text-gradient animate-pulse-glow rounded-2xl px-6 py-2">
                +500 Coins
              </div>
            </div>

            <div className="max-w-md mx-auto">
              <div className="flex items-center gap-2 p-2 rounded-2xl glass">
                <div className="flex-1 px-4 py-3 font-mono text-lg tracking-wider text-foreground select-all">
                  {code}
                </div>
                <Button onClick={handleCopy} variant="hero" size="sm" className="gap-2">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied!" : "Copy Code"}
                </Button>
              </div>
              <button className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <Share2 className="w-4 h-4" />
                Share to socials
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
