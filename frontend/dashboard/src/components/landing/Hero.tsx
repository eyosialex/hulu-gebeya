import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { MapPin, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-6 pt-24 pb-16">
      {/* Reserved space for video background */}
      <div className="absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(oklch(0.7 0.15 250) 1px, transparent 1px), linear-gradient(90deg, oklch(0.7 0.15 250) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            animation: "grid-move 20s linear infinite",
          }}
        />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/20 blur-[120px] animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-accent/20 blur-[120px] animate-float" style={{ animationDelay: "2s" }} />
      </div>

      <div className="relative max-w-5xl mx-auto text-center">
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

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          Your city is now a game board. Discover hidden spots, complete real-world missions,
          and turn your daily walks into rewards.
        </motion.p>

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
