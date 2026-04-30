import { useSocial } from "@/hooks/useSocial";
import { Users, UserPlus, Share2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { PageWrap } from "../PageWrap";

export function SocialHub() {
  const { friends, isLoading } = useSocial();

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <PageWrap title="Social Hub" subtitle="Friends, teams, and referrals">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.85fr]">
          <div className="rounded-3xl border border-border/60 bg-gradient-card p-5 shadow-elegant">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Active Friends</p>
                <p className="text-xs text-muted-foreground">Live status from your crew</p>
              </div>
              <button className="flex items-center gap-1 rounded-full border border-border/60 px-3 py-1 text-xs text-muted-foreground hover:text-foreground">
                <UserPlus className="h-3 w-3" /> Add
              </button>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <AnimatePresence>
                {friends.map((f, i) => {
                  return (
                    <motion.li
                      key={f.userId}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex list-none flex-col gap-3 rounded-xl border border-border/40 bg-surface/40 p-4 transition-all hover:border-primary/40 hover:bg-surface/60"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface text-sm font-bold text-foreground">
                              {f.name.slice(0, 1)}
                            </div>
                            {f.live && (
                              <div className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-black bg-success shadow-glow-success animate-pulse" />
                            )}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                               <p className="text-sm font-semibold text-foreground">{f.name}</p>
                            </div>
                            <p className="text-[10px] text-muted-foreground uppercase">{f.status}</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                           <button className="rounded-full bg-surface/60 p-1.5 text-muted-foreground hover:bg-primary/20 hover:text-primary-glow transition-colors">👍</button>
                           <button className="rounded-full bg-surface/60 p-1.5 text-muted-foreground hover:bg-primary/20 hover:text-primary-glow transition-colors">🚀</button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[10px]">
                        <span className="text-muted-foreground text-xs">Level {Math.floor(f.xp / 1000) + 1}</span>
                        <span className="font-mono text-primary-glow text-xs">{f.xp.toLocaleString()} XP</span>
                      </div>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-3xl border border-primary/40 bg-gradient-card p-5 shadow-glow">
              <Share2 className="h-5 w-5 text-primary-glow" />
              <p className="mt-3 text-sm font-semibold text-foreground">Your Referral Code</p>
              <p className="mt-2 font-mono text-2xl tracking-widest text-primary-glow">SMART-MAP-2026</p>
              <p className="mt-3 text-xs text-muted-foreground">
                Earn <span className="text-primary-glow">+500 🪙</span> when a friend completes their first mission.
              </p>
              <button className="mt-4 w-full rounded-full bg-gradient-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
                Share to Socials
              </button>
            </div>
          </div>
        </div>
      </PageWrap>
    </div>
  );
}
