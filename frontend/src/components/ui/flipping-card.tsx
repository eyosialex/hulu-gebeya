import * as React from "react";
import { cn } from "@/lib/utils";

interface FlippingCardProps {
  className?: string;
  height?: number | string;
  width?: number | string;
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
  flipped?: boolean;
}

export function FlippingCard({
  className,
  frontContent,
  backContent,
  height = 360,
  width = 420,
  flipped = false,
}: FlippingCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const isFlipped = isHovered || flipped;

  return (
    <div
      className={cn(
        "group relative cursor-pointer select-none touch-manipulation perspective-distant",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[1.75rem] before:p-px before:bg-linear-to-r before:from-primary/45 before:via-accent/35 before:to-primary/20 before:opacity-70 before:transition before:duration-500",
        "after:pointer-events-none after:absolute after:inset-px after:rounded-[1.7rem] after:bg-transparent after:shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_0_40px_rgba(81,150,253,0.12)]",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ height, width }}
    >
      <div
        className="relative h-full w-full transform-3d transition-transform duration-700"
        style={{ transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        {/* Front */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden rounded-3xl border border-white/10 bg-gradient-card shadow-elegant backface-hidden",
            "transition-shadow duration-500",
            isFlipped ? "shadow-glow" : "shadow-elegant",
          )}
        >
          <div className="h-full w-full">{frontContent}</div>
        </div>
        {/* Back */}
        <div
          className={cn(
            "absolute inset-0 overflow-hidden rounded-3xl border border-primary/30 bg-gradient-card shadow-glow backface-hidden",
            "transform-[rotateY(180deg)]",
          )}
        >
          <div className="h-full w-full">{backContent}</div>
        </div>
      </div>
    </div>
  );
}
