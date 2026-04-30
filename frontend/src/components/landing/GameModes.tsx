import * as React from "react";
import { Car, Camera, Zap, CheckCircle2, ArrowRight } from "lucide-react";
import { FlippingCard } from "@/components/ui/flipping-card";

interface ModeData {
  id: string;
  tag: string;
  title: string;
  tagline: string;
  Icon: React.ComponentType<{ className?: string }>;
  accent: "primary" | "accent";
  bullets: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }[];
  cta: string;
}

const modes: ModeData[] = [
  {
    id: "vehicle",
    tag: "The Speedster",
    title: "Vehicle Mode",
    tagline:
      "Fast route planning for delivery-style missions with live re-routing.",
    Icon: Car,
    accent: "primary",
    bullets: [
      { icon: Zap, label: "Live ETA updates and lane-aware re-routing" },
      { icon: CheckCircle2, label: "Multi-stop missions with route awareness" },
      { icon: ArrowRight, label: "Turn-by-turn precision for faster arrivals" },
    ],
    cta: "Hit the road",
  },
  {
    id: "photo-quiz",
    tag: "The Detective",
    title: "Photo Quiz",
    tagline:
      "Snap-to-answer challenges with instant AI feedback and live proof.",
    Icon: Camera,
    accent: "accent",
    bullets: [
      { icon: Zap, label: "On-device verification with metadata checks" },
      {
        icon: CheckCircle2,
        label: "Instant XP rewards after live confirmation",
      },
      { icon: ArrowRight, label: "Anti-spoofing built in for trusted answers" },
    ],
    cta: "Start sleuthing",
  },
];

export function GameModes() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-3">
            Game Modes
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold">
            Missions Meet <span className="text-gradient">Reality</span>.
          </h2>
          <p className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/90 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-md">
            <span className="text-accent font-semibold">Hover</span>
            <span className="text-white/70">the cards to flip them</span>
            <ArrowRight className="h-4 w-4 text-accent" />
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-8">
          {modes.map((m) => (
            <FlippingCard
              key={m.id}
              width={460}
              height={400}
              frontContent={<ModeFront data={m} />}
              backContent={<ModeBack data={m} />}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ModeFront({ data }: { data: ModeData }) {
  const accentBg =
    data.accent === "primary"
      ? "bg-primary/20 text-primary"
      : "bg-accent/20 text-accent";
  const glowBg = data.accent === "primary" ? "bg-primary" : "bg-accent";
  return (
    <div className="relative h-full w-full p-8 flex flex-col justify-between overflow-hidden">
      <div
        className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-30 ${glowBg}`}
      />
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.7 0.15 250) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.15 250) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />

      <div className="relative">
        <div className="flex items-center justify-between mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {data.tag}
          </span>
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center ${accentBg}`}
          >
            <data.Icon className="w-7 h-7" />
          </div>
        </div>
        <h3 className="font-display text-4xl font-extrabold mb-3">
          {data.title}
        </h3>
        <p className="max-w-sm text-base leading-relaxed text-white/88">
          {data.tagline}
        </p>

        <p className="mt-4 max-w-sm text-sm leading-relaxed text-foreground/80">
          {data.accent === "primary"
            ? "Use it when you need a direct, efficient run through nearby stops with live route updates."
            : "Use it for live clue checks, where the camera, metadata, and score flow stay in sync."}
        </p>
      </div>

      <div className="relative flex items-center justify-between text-xs text-muted-foreground">
        <span>Tap or hover to reveal</span>
        <ArrowRight className="w-4 h-4 animate-pulse" />
      </div>
    </div>
  );
}

function ModeBack({ data }: { data: ModeData }) {
  const accentText = data.accent === "primary" ? "text-primary" : "text-accent";
  const accentBtn =
    data.accent === "primary"
      ? "bg-gradient-primary text-primary-foreground"
      : "bg-accent text-accent-foreground";

  return (
    <div className="relative h-full w-full p-8 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center ${accentText} bg-foreground/5`}
          >
            <data.Icon className="w-5 h-5" />
          </div>
          <h3 className="font-display text-2xl font-extrabold">{data.title}</h3>
        </div>

        <ul className="space-y-4">
          {data.bullets.map((b, i) => (
            <li key={i} className="flex items-center gap-3 text-sm">
              <span
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${accentText} bg-foreground/5 shrink-0`}
              >
                <b.icon className="w-4 h-4" />
              </span>
              <span className="text-foreground/90">{b.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <a
        href="/signin"
        className={`w-full h-12 rounded-xl font-semibold text-sm shadow-glow hover:opacity-95 transition-opacity inline-flex items-center justify-center gap-2 ${accentBtn}`}
        aria-label={`Sign in to use ${data.title}`}
      >
        <span className="sr-only">Open</span>
        <span>{data.cta}</span>
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}
