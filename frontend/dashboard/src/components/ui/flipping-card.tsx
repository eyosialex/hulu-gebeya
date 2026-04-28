import * as React from "react";
import { cn } from "@/lib/utils";

interface FlippingCardProps {
  className?: string;
  height?: number;
  width?: number;
  frontContent?: React.ReactNode;
  backContent?: React.ReactNode;
}

export function FlippingCard({
  className,
  frontContent,
  backContent,
  height = 360,
  width = 420,
}: FlippingCardProps) {
  return (
    <div
      className={cn("group [perspective:1200px]", className)}
      style={{ height, width }}
    >
      <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
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
  );
}
