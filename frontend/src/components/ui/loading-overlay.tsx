"use client";

import * as React from "react";

type Props = { onFinish?: () => void; demoDuration?: number };

export default function LoadingOverlay({ onFinish, demoDuration = 2200 }: Props) {
  const [visible, setVisible] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const [paused, setPaused] = React.useState(false);
  const timerRef = React.useRef<number | null>(null);

  // add 2 seconds to existing demo duration
  const effectiveDuration = (demoDuration ?? 2200) + 2000;

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;

    // Only show overlay on homepage
    const isClientHome = window.location.pathname === "/";
    if (!isClientHome) return;

    setVisible(true);

    // lock scroll: capture current scroll and fix body position
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const prevOverflow = document.body.style.overflow;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevLeft = document.body.style.left;
    const prevWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = "0";
    document.body.style.width = "100%";

    // prevent touch scroll on mobile
    const touchHandler = (e: TouchEvent) => {
      e.preventDefault();
    };
    document.addEventListener("touchmove", touchHandler, { passive: false });

    // auto-hide after effectiveDuration
    timerRef.current = window.setTimeout(() => {
      // restore body and scroll
      document.removeEventListener("touchmove", touchHandler);
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.left = prevLeft;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);

      setVisible(false);
      onFinish?.();
    }, effectiveDuration);

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      document.removeEventListener("touchmove", touchHandler);
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.left = prevLeft;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [mounted, effectiveDuration, onFinish]);

  if (!mounted || !visible) return null;

  return (
    <div
      aria-hidden="false"
      role="status"
      className="fixed inset-0 z-9999 flex items-center justify-center bg-background/90 backdrop-blur-md"
    >
      <div className="max-w-xl mx-auto px-4 sm:px-6 text-center">
        <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-white tracking-tight">
          Smart Map
        </h1>

        <div className="flex flex-col items-center justify-center gap-6 mx-auto">
          <style>{`
            @keyframes pulseRing { 0% { transform: scale(.9); opacity: .6 } 70% { transform: scale(1.2); opacity: 0 } 100% { transform: scale(1.2); opacity: 0 } }
            @keyframes orbit { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            @keyframes orbitReverse { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
            @keyframes progress { from { width: 0%; } to { width: 100%; } }
            .orbit-path {
              transform-box: fill-box;
              transform-origin: center;
            }
          `}</style>

          {/* Decorative pulsing backdrop */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <span className="absolute inset-0 rounded-full bg-linear-to-r from-primary/30 via-accent/20 to-primary/10 blur-3xl opacity-60" />
              <span className="absolute inset-0 rounded-full opacity-40 animate-[pulseRing_1600ms_ease-out_infinite]" />
            </div>
          </div>

          <button
            onClick={() => {
              if (timerRef.current) {
                window.clearTimeout(timerRef.current);
                timerRef.current = null;
              }
              setVisible(false);
              document.body.style.overflow = "";
              onFinish?.();
            }}
            aria-label="Dismiss loading"
            className="relative z-30 flex items-center justify-center rounded-full p-2 focus:outline-none"
          >
            <div
              className="relative flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 md:w-52 md:h-52"
              onClick={(e) => {
                e.stopPropagation();
                setPaused((current) => !current);
              }}
            >
              <div className="absolute inset-0 rounded-full border border-white/6" />
              <div className="absolute inset-[18%] rounded-full border border-white/12" />

              <div
                className="orbit-path absolute inset-0"
                style={{ animation: paused ? "none" : "orbit 1.8s linear infinite" }}
              >
                <span className="absolute left-1/2 top-[6%] h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.85)]" />
              </div>

              <div
                className="orbit-path absolute inset-[18%]"
                style={{ animation: paused ? "none" : "orbitReverse 2.4s linear infinite" }}
              >
                <span className="absolute right-[-2%] top-1/2 h-4 w-12 -translate-y-1/2 rounded-full bg-linear-to-r from-fuchsia-400 via-primary to-accent shadow-[0_0_22px_rgba(168,139,250,0.7)]" />
              </div>

              <div className="absolute inset-[34%] rounded-full bg-background/80 backdrop-blur-sm ring-1 ring-white/10" />

              {/* <span className="absolute bottom-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-white/55">
                {paused ? "Tap to resume" : "Tap to pause"}
              </span> */}
            </div>
          </button>

          <div className="w-full max-w-sm px-4 sm:px-6">
            <div className="h-2 overflow-hidden rounded-full bg-white/10 shadow-[0_0_0_1px_rgba(255,255,255,0.05)]">
              <div
                className="h-full rounded-full bg-linear-to-r from-fuchsia-400 via-primary to-accent shadow-[0_0_20px_rgba(232,121,249,0.45)]"
                style={{
                  width: "0%",
                  animation: `progress ${effectiveDuration}ms linear forwards`,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
