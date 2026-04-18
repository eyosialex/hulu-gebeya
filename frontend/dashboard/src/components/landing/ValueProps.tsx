import { MapPinned, Trophy, ShieldCheck } from "lucide-react";
import StackingFeatures from "@/components/ui/stacking-card";

const features = [
  {
    title: "Gamified Discovery",
    description:
      "Forget boring maps. Follow Smart Routes to locations you've never noticed before — every corner of your city becomes a quest waiting to be unlocked.",
    icon: <MapPinned />,
    accent: "#5196fd",
  },
  {
    title: "Earn While You Move",
    description:
      "Every step counts. Accumulate Coins and XP for real-world perks — from coffee discounts to event tickets at your favorite local spots.",
    icon: <Trophy />,
    accent: "#8f89ff",
  },
  {
    title: "Fair Play, Guaranteed",
    description:
      "On-device AI photo verification and anti-GPS spoofing keep the competition honest. Your wins are earned, not faked.",
    icon: <ShieldCheck />,
    accent: "#13c2c2",
  },
];

export function ValueProps() {
  return (
    <section className="relative">
      <div className="text-center pt-32 pb-16 px-6">
        <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-3">
          Why Smart Map
        </p>
        <h2 className="font-display text-4xl md:text-6xl font-extrabold">
          Turn Your Surroundings <br /> into an <span className="text-gradient">Adventure</span>.
        </h2>
      </div>
      <StackingFeatures features={features} />
    </section>
  );
}
