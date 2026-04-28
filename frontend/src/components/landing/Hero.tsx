import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroVideo from "../../../hero/hero.mp4";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-24 pb-8">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-linear-to-b from-background/35 via-background/55 to-background/85" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.7 0.15 250) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.15 250) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            animation: "grid-move 20s linear infinite",
          }}
        />
        <div className="absolute top-1/4 left-1/4 h-56 w-56 md:h-96 md:w-96 rounded-full bg-primary/20 blur-[120px] animate-float" />
        <div
          className="absolute bottom-1/4 right-1/4 h-56 w-56 md:h-96 md:w-96 rounded-full bg-accent/20 blur-[120px] animate-float"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8"
        >
          <Sparkles className="w-4 h-4 text-accent" />
          <span className="text-sm font-medium">Your city, gamified</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-6xl md:text-8xl font-extrabold leading-[0.95] mb-6"
        >
          <span className="text-gradient">Explore.</span>{" "}
          <span className="text-foreground">Play.</span>{" "}
          <span className="text-gradient">Earn.</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="mx-auto mb-10 max-w-3xl rounded-[1.75rem] border border-white/10 bg-white/8 px-6 py-5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.9)] backdrop-blur-md"
        >
          <p className="text-lg md:text-xl font-semibold leading-relaxed text-white/95 drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
            Your city is now a game board. Discover hidden spots, complete
            real-world missions, and turn your daily walks into rewards.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button asChild size="lg" variant="hero">
            <Link to="/signin">
              Start Exploring <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outlineGlow">
            <Link to="/signin">Login / Register</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="mt-20 flex items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <MapPin className="w-4 h-4 text-primary animate-pulse" />
          <span>Live in 24 cities · 12,000+ active explorers</span>
        </motion.div>
      </div>
    </section>
  );
}
