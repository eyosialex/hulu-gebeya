"use client";
import { ReactLenis } from "lenis/react";
import {
  useTransform,
  motion,
  useScroll,
  type MotionValue,
} from "framer-motion";
import { useRef, type ReactNode } from "react";

interface FeatureItem {
  title: string;
  description: string;
  icon: ReactNode;
  accent: string; // hex/oklch color for the accent panel
}

interface CardProps extends FeatureItem {
  i: number;
  progress: MotionValue<number>;
  range: [number, number];
  targetScale: number;
}

const Card = ({
  i,
  title,
  description,
  icon,
  accent,
  progress,
  range,
  targetScale,
}: CardProps) => {
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div className="h-screen flex items-center justify-center sticky top-0 px-4">
      <motion.div
        style={{
          scale,
          top: `calc(-5vh + ${i * 28}px)`,
        }}
        className="relative -top-[25%] h-115 md:h-120 w-full max-w-5xl rounded-4xl origin-top
                   bg-gradient-card border border-border overflow-hidden shadow-elegant"
      >
        {/* glow */}
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-50"
          style={{ background: accent }}
        />

        <div className="relative h-full grid md:grid-cols-2 gap-8 p-8 md:p-12">
          {/* Left: content */}
          <div className="flex flex-col justify-between rounded-3xl border border-white/10 bg-black/20 p-5 md:p-6 backdrop-blur-md">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  0{i + 1} / Feature
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3
                className="font-display text-4xl md:text-5xl font-extrabold leading-tight text-white mb-4"
                style={{ textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}
              >
                {title}
              </h3>
              <p
                className="text-base md:text-lg leading-relaxed max-w-md text-white/95"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}
              >
                {description}
              </p>
            </div>

            {/* action removed per design: no 'Learn more' or arrow */}
          </div>

          {/* Right: visual */}
          <div
            className="relative rounded-2xl overflow-hidden hidden md:flex items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent}40, transparent)`,
            }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "linear-gradient(oklch(0.7 0.15 250 / 0.4) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.15 250 / 0.4) 1px, transparent 1px)",
                backgroundSize: "32px 32px",
              }}
            />
            <div
              className="relative w-40 h-40 rounded-3xl flex items-center justify-center shadow-glow"
              style={{
                background: `linear-gradient(135deg, ${accent}, oklch(0.4 0.15 250))`,
              }}
            >
              <div className="[&>svg]:w-20 [&>svg]:h-20 text-primary-foreground">
                {icon}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface StackingFeaturesProps {
  features: FeatureItem[];
}

export default function StackingFeatures({ features }: StackingFeaturesProps) {
  const container = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: container,
    offset: ["start start", "end end"],
  });

  return (
    <ReactLenis root>
      <main className="bg-transparent" ref={container}>
        {features.map((feature, i) => {
          const targetScale = 1 - (features.length - i) * 0.05;
          return (
            <Card
              key={i}
              i={i}
              {...feature}
              progress={scrollYProgress}
              range={[i * (1 / features.length), 1]}
              targetScale={targetScale}
            />
          );
        })}
      </main>
    </ReactLenis>
  );
}
