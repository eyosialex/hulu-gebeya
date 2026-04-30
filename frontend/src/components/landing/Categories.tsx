import * as React from "react";
import { CardStack, type CardStackItem } from "../ui/card-stack";

const categories: CardStackItem[] = [
  {
    id: 1,
    title: "Food & Drinks",
    description: "Taste the local flavor and discover places worth revisiting.",
    imageSrc:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    tag: "Dining",
    ctaLabel: "Explore",
  },
  {
    id: 2,
    title: "Game Zones",
    description: "Play and conquer nearby spots with a mission-first mindset.",
    imageSrc:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=80",
    tag: "Play",
    ctaLabel: "Start",
  },
  {
    id: 3,
    title: "Churches",
    description:
      "Historical landmarks and quiet stops with strong local character.",
    imageSrc:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    tag: "Culture",
    ctaLabel: "Visit",
  },
  {
    id: 4,
    title: "Mosques",
    description:
      "Community spaces rooted in culture, heritage, and connection.",
    imageSrc:
      "https://images.unsplash.com/photo-1542816417-0983c9c9ad53?auto=format&fit=crop&w=1200&q=80",
    tag: "Heritage",
    ctaLabel: "Discover",
  },
  {
    id: 5,
    title: "Shops",
    description: "Local stores and markets that turn daily errands into finds.",
    imageSrc:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    tag: "Retail",
    ctaLabel: "Browse",
  },
];

export function Categories() {
  const [autoAdvance, setAutoAdvance] = React.useState(true);
  const resumeTimeoutRef = React.useRef<number | null>(null);

  const pauseAutoAdvance = React.useCallback(() => {
    if (resumeTimeoutRef.current !== null) {
      window.clearTimeout(resumeTimeoutRef.current);
    }

    setAutoAdvance(false);
    resumeTimeoutRef.current = window.setTimeout(() => {
      setAutoAdvance(true);
      resumeTimeoutRef.current = null;
    }, 3000);
  }, []);

  React.useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current !== null) {
        window.clearTimeout(resumeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <section
      className="relative w-full overflow-x-clip overflow-y-hidden py-24"
      onClickCapture={pauseAutoAdvance}
    >
      <div className="mx-auto mb-10 max-w-5xl px-4 text-center sm:px-6 lg:px-8">
        <h2 className="font-display text-4xl font-extrabold md:text-6xl">
          Choose a <span className="text-gradient">Path</span>,
          <br />
          Let the City Guide You.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Pick the kind of experience you want to explore, then follow a tour
          built around your interests. Whether you are hunting for food,
          culture, or everyday discoveries, Smart Map turns each category into a
          focused adventure.
        </p>
      </div>
      <CardStack
        className="w-full"
        items={categories}
        initialIndex={0}
        maxVisible={5}
        cardWidth={520}
        cardHeight={320}
        overlap={0.45}
        spreadDeg={36}
        depthPx={120}
        tiltXDeg={10}
        autoAdvance={autoAdvance}
        intervalMs={3000}
        pauseOnHover={false}
        showDots
      />
    </section>
  );
}
