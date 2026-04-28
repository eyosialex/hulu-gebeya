import { MapPinned, Trophy, ShieldCheck } from "lucide-react";
import { Route } from "lucide-react";
import StackingFeatures from "@/components/ui/stacking-card";

const features = [
  {
    title: "What Smart Map Is",
    description:
      "Smart Map is a category-based city adventure. It turns nearby places into a guided experience where every stop can become a mission, reward, or discovery.",
    icon: <MapPinned />,
    accent: "#5196fd",
  },
  {
    title: "Pick Your Experience",
    description:
      "Choose a category like Foodie Mode or History Hunt to filter the map. That way, new users instantly see only the places and tours that match what they care about.",
    icon: <Trophy />,
    accent: "#8f89ff",
  },
  {
    title: "Follow the Mission",
    description:
      "Select a pin, walk to the location, and wait for the Capture action to unlock when your GPS matches the place. The route only counts when you arrive live.",
    icon: <ShieldCheck />,
    accent: "#13c2c2",
  },
  {
    title: "Verify and Earn",
    description:
      "Take a photo, add a one-sentence description, and let AI confirm your visit using the image, time, and GPS metadata. XP and Coins are added instantly, with bigger rewards for full tours.",
    icon: <Route />,
    accent: "#19d3b5",
  },
];

export function ValueProps() {
  return (
    <section className="relative">
      <div className="text-center pt-16 pb-16 px-6">
        <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-3">
          What Smart Map Does
        </p>
        <h2 className="font-display text-4xl md:text-6xl font-extrabold">
          A guided city game <br /> built around{" "}
          <span className="text-gradient">your interests</span>.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Smart Map helps new users understand the product fast: pick a
          category, follow the live route, prove each stop, and earn rewards as
          you explore.
        </p>
      </div>
      <StackingFeatures features={features} />
    </section>
  );
}
