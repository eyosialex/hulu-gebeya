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
  const [isTapped, setIsTapped] = React.useState(false);
  const isFlipped = isHovered || flipped;
  // include tap state for touch devices
  const flippedState = isFlipped || isTapped;

  const maxWidth = typeof width === "number" ? `${width}px` : width;
  const aspectPadding =
    typeof width === "number" && typeof height === "number"
      ? `${(height / width) * 100}%`
      : undefined;

  return (
    <div
      className={cn(
        "group relative cursor-pointer select-none touch-manipulation [perspective:1200px]",
        className,
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsTapped((s) => !s)}
      style={{ maxWidth, width: "100%" }}
    >
      <div style={aspectPadding ? { position: "relative", paddingTop: aspectPadding } : { height }}>
        <div
          className="absolute inset-0 transition-transform duration-700 [transform-style:preserve-3d]"
          style={{ transform: flippedState ? "rotateY(180deg)" : "rotateY(0deg)" }}
        >
          {/* Front */}
          <div className="absolute inset-0 [backface-visibility:hidden] rounded-3xl overflow-hidden border border-border bg-gradient-card shadow-elegant">
            <div className="h-full w-full">{frontContent}</div>
          </div>
          {/* Back */}
          <div className="absolute inset-0 [transform:rotateY(180deg)] [backface-visibility:hidden] rounded-3xl overflow-hidden border border-primary/30 bg-gradient-card shadow-glow">
            <div className="h-full w-full">{backContent}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
