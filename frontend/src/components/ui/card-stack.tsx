"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { SquareArrowOutUpRight, ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

function wrapIndex(n: number, len: number) {
  if (len <= 0) return 0;
  return ((n % len) + len) % len;
}

function signedOffset(i: number, active: number, len: number, loop: boolean) {
  const raw = i - active;
  if (!loop || len <= 1) return raw;

  const alt = raw > 0 ? raw - len : raw + len;
  return Math.abs(alt) < Math.abs(raw) ? alt : raw;
}

export type CardStackItem = {
  id: string | number;
  title: string;
  description?: string;
  imageSrc?: string;
  href?: string;
  ctaLabel?: string;
  tag?: string;
};

export type CardStackProps<T extends CardStackItem> = {
  items: T[];
  initialIndex?: number;
  maxVisible?: number;
  cardWidth?: number;
  cardHeight?: number;
  overlap?: number;
  spreadDeg?: number;
  perspectivePx?: number;
  depthPx?: number;
  tiltXDeg?: number;
  activeLiftPx?: number;
  activeScale?: number;
  inactiveScale?: number;
  springStiffness?: number;
  springDamping?: number;
  loop?: boolean;
  autoAdvance?: boolean;
  intervalMs?: number;
  pauseOnHover?: boolean;
  showDots?: boolean;
  className?: string;
  onChangeIndex?: (index: number, item: T) => void;
  renderCard?: (item: T, state: { active: boolean }) => React.ReactNode;
};

function useViewportWidth() {
  const [viewportWidth, setViewportWidth] = React.useState(() => {
    if (typeof window === "undefined") return 1280;
    return window.innerWidth;
  });

  React.useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return viewportWidth;
}

export function CardStack<T extends CardStackItem>({
  items,
  initialIndex = 0,
  maxVisible = 5,
  cardWidth = 520,
  cardHeight = 320,
  overlap = 0.48,
  spreadDeg = 40,
  perspectivePx = 1100,
  depthPx = 140,
  tiltXDeg = 12,
  activeLiftPx = 22,
  activeScale = 1.03,
  inactiveScale = 0.94,
  springStiffness = 280,
  springDamping = 28,
  loop = true,
  autoAdvance = false,
  intervalMs = 2800,
  pauseOnHover = true,
  showDots = true,
  className,
  onChangeIndex,
  renderCard,
}: CardStackProps<T>) {
  const reduceMotion = useReducedMotion();
  const viewportWidth = useViewportWidth();
  const len = items.length;

  const responsiveCardWidth = Math.min(
    cardWidth,
    Math.max(280, viewportWidth - 32),
  );
  const responsiveCardHeight = Math.min(
    cardHeight,
    viewportWidth < 640 ? 240 : cardHeight,
  );

  const [active, setActive] = React.useState(() =>
    wrapIndex(initialIndex, len),
  );
  const [hovering, setHovering] = React.useState(false);

  React.useEffect(() => {
    setActive((current) => wrapIndex(current, len));
  }, [len]);

  React.useEffect(() => {
    if (!len) return;
    onChangeIndex?.(active, items[active]!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  // On small viewports, reduce number of visible cards and spacing to avoid horizontal overflow
  const dynamicMaxVisible = viewportWidth < 640 ? Math.min(maxVisible, 3) : maxVisible;
  const dynamicMaxOffset = Math.max(0, Math.floor(dynamicMaxVisible / 2));
  const spacingMultiplier = viewportWidth < 640 ? 0.72 : 1;
  const dynamicCardSpacing = Math.max(
    10,
    Math.round(responsiveCardWidth * (1 - overlap) * spacingMultiplier),
  );
  const stepDeg = dynamicMaxOffset > 0 ? spreadDeg / dynamicMaxOffset : 0;

  const canGoPrev = loop || active > 0;
  const canGoNext = loop || active < len - 1;

  const prev = React.useCallback(() => {
    if (!len || !canGoPrev) return;
    setActive((current) => wrapIndex(current - 1, len));
  }, [canGoPrev, len]);

  const next = React.useCallback(() => {
    if (!len || !canGoNext) return;
    setActive((current) => wrapIndex(current + 1, len));
  }, [canGoNext, len]);

  React.useEffect(() => {
    if (!autoAdvance) return;
    if (reduceMotion) return;
    if (!len) return;
    if (pauseOnHover && hovering) return;

    const id = window.setInterval(
      () => {
        if (loop || active < len - 1) next();
      },
      Math.max(700, intervalMs),
    );

    return () => window.clearInterval(id);
  }, [
    autoAdvance,
    intervalMs,
    hovering,
    pauseOnHover,
    reduceMotion,
    len,
    loop,
    active,
    next,
  ]);

  if (!len) return null;

  const activeItem = items[active]!;

  return (
    <div
      className={cn("w-full overflow-hidden", className)}
      style={{ overscrollBehaviorX: "none", touchAction: "pan-y" }}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <div
        className="relative mx-auto w-full"
        style={{
          height: Math.max(320, responsiveCardHeight + 92),
          maxWidth: "100vw",
        }}
      >
        <div
          className="absolute inset-0 flex items-end justify-center overflow-hidden bg-transparent"
          style={{
            perspective: `${perspectivePx}px`,
            maxWidth: "100vw",
          }}
        >
          <AnimatePresence initial={false}>
            {items.map((item, index) => {
              const offset = signedOffset(index, active, len, loop);
              const abs = Math.abs(offset);
              const visible = abs <= dynamicMaxOffset;

              if (!visible) return null;

              const rotateZ = offset * stepDeg;
              const x = offset * dynamicCardSpacing;
              const y = abs * 10;
              const z = -abs * depthPx;

              const isActive = offset === 0;
              const scale = isActive ? activeScale : inactiveScale;
              const lift = isActive ? -activeLiftPx : 0;
              const rotateX = isActive ? 0 : tiltXDeg;
              const zIndex = 100 - abs;

              return (
                <motion.button
                  key={item.id}
                  type="button"
                  className={cn(
                    "absolute bottom-0 overflow-hidden rounded-4xl border border-border/70 shadow-elegant",
                    "will-change-transform select-none bg-gradient-card text-left",
                    isActive ? "cursor-default" : "cursor-pointer",
                  )}
                  style={{
                    width: responsiveCardWidth,
                    height: responsiveCardHeight,
                    zIndex,
                    transformStyle: "preserve-3d",
                  }}
                  initial={
                    reduceMotion
                      ? false
                      : { opacity: 0, y: y + 40, x, rotateZ, rotateX, scale }
                  }
                  animate={{
                    opacity: 1,
                    x,
                    y: y + lift,
                    rotateZ,
                    rotateX,
                    scale,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: springStiffness,
                    damping: springDamping,
                  }}
                  onClick={() => setActive(index)}
                >
                  <div
                    className="h-full w-full"
                    style={{
                      transform: `translateZ(${z}px)`,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {renderCard ? (
                      renderCard(item, { active: isActive })
                    ) : (
                      <DefaultFanCard item={item} />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {showDots ? (
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={prev}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Previous card"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 px-2">
            {items.map((item, index) => {
              const isActive = index === active;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(index)}
                  className={cn(
                    "h-2.5 rounded-full transition-all",
                    isActive
                      ? "w-8 bg-primary"
                      : "w-2.5 bg-primary/30 hover:bg-primary/50",
                  )}
                  aria-label={`Go to ${item.title}`}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={next}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Next card"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {activeItem.href ? (
            <a
              href={activeItem.href}
              target="_blank"
              rel="noreferrer"
              className="text-muted-foreground transition hover:text-foreground"
              aria-label="Open link"
            >
              <SquareArrowOutUpRight className="h-4 w-4" />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function DefaultFanCard({ item }: { item: CardStackItem }) {
  return (
    <div className="relative isolate h-full w-full overflow-hidden bg-background/10">
      {item.imageSrc ? (
        <img
          src={item.imageSrc}
          alt={item.title}
          className="relative z-0 h-full w-full object-cover"
          draggable={false}
          loading="eager"
        />
      ) : (
        <div className="relative z-0 flex h-full w-full items-center justify-center bg-secondary text-sm text-muted-foreground">
          No image
        </div>
      )}

      <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-b from-black/90 via-black/45 to-black/85" />
      <div className="absolute inset-0 z-20 flex h-full flex-col justify-between p-5 md:p-6">
        <div className="space-y-3">
          {item.tag ? (
            <div className="inline-flex w-fit rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
              {item.tag}
            </div>
          ) : null}
          <div
            className="text-3xl font-extrabold leading-tight text-white md:text-4xl"
            style={{ textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}
          >
            {item.title}
          </div>
        </div>

        <div className="space-y-4 rounded-3xl bg-black/25 p-4 backdrop-blur-[2px]">
          {item.description ? (
            <div
              className="max-w-[90%] text-sm leading-relaxed text-white md:text-base"
              style={{ textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}
            >
              {item.description}
            </div>
          ) : null}
          {item.ctaLabel ? (
            <div className="inline-flex w-fit rounded-full bg-primary px-4 py-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground">
              {item.ctaLabel}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
