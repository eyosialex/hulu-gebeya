import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { ValueProps } from "@/components/landing/ValueProps";
import { Categories } from "@/components/landing/Categories";
import { GameModes } from "@/components/landing/GameModes";
import { Community } from "@/components/landing/Community";
import { Referral } from "@/components/landing/Referral";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Smart Map — Explore. Play. Earn." },
      {
        name: "description",
        content:
          "Your city is a game board. Discover hidden spots, complete real-world missions, and turn your daily walks into rewards.",
      },
      { property: "og:title", content: "Smart Map — Explore. Play. Earn." },
      {
        property: "og:description",
        content:
          "Gamified urban exploration. Discover, play, and earn real-world rewards.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <section id="features">
          <ValueProps />
        </section>
        <section id="categories">
          <Categories />
        </section>
        <GameModes />
        <section id="community">
          <Community />
        </section>
        <Referral />
      </main>
      <Footer />
    </div>
  );
}
