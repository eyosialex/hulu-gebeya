"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="min-h-screen bg-[#F8FCF8] overflow-x-hidden font-sans relative isolate">
      {/* Global CSS for subtle luxury wave animation and scroll continuity */}
      <style jsx global>{`
        @keyframes waveSway {
          0% {
            transform: translateY(0) rotateZ(-2deg);
          }
          50% {
            transform: translateY(-30px) rotateZ(2deg);
          }
          100% {
            transform: translateY(0) rotateZ(-2deg);
          }
        }
        @keyframes gridTravel {
          0% {
            background-position: 0px 0px;
          }
          100% {
            background-position: 60px 60px;
          }
        }
        .luxury-grid-container {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          overflow: hidden;
          background:
            radial-gradient(
              circle at 50% 0%,
              rgba(34, 197, 94, 0.05) 0%,
              transparent 70%
            ),
            linear-gradient(to bottom, #f8fcf8, #ffffff, #f8fcf8);
          perspective: 1200px;
        }
        .luxury-grid-wobble {
          position: absolute;
          inset: 0;
          transform-style: preserve-3d;
          animation: waveSway 12s ease-in-out infinite;
        }
        .luxury-grid-plane {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background-image:
            linear-gradient(
              to right,
              rgba(34, 197, 94, 0.08) 2px,
              transparent 2px
            ),
            linear-gradient(
              to bottom,
              rgba(34, 197, 94, 0.08) 2px,
              transparent 2px
            );
          background-size: 60px 60px;
          transform-origin: center center;
          animation: gridTravel 3s linear infinite;
          /* Narrow centered beam vertically infinite with slight top/bottom fade */
          mask-image:
            linear-gradient(
              to right,
              transparent 20%,
              black 50%,
              transparent 80%
            ),
            linear-gradient(
              to bottom,
              transparent 0%,
              black 15%,
              black 85%,
              transparent 100%
            );
          mask-composite: intersect;
          -webkit-mask-image:
            linear-gradient(
              to right,
              transparent 20%,
              black 50%,
              transparent 80%
            ),
            linear-gradient(
              to bottom,
              transparent 0%,
              black 15%,
              black 85%,
              transparent 100%
            );
          -webkit-mask-composite: source-in;
        }
      `}</style>

      {/* Unified Deep 3D Master Grid */}
      <div className="luxury-grid-container">
        <div className="luxury-grid-wobble">
          <div
            className="luxury-grid-plane"
            style={{
              transform: `rotateX(65deg) translateY(${scrollY * -0.15}px) translateZ(${scrollY * 0.02}px) scale(1.5)`,
            }}
          ></div>
        </div>
      </div>

      {/* Ambient floating Orbs that stay in the background across all sections */}
      <div
        className="fixed top-[-10%] right-[-10%] w-[80vw] h-200 bg-green-500/10 rounded-full blur-[150px] pointer-events-none z-0"
        style={{ transform: `translate3d(0, ${-scrollY * 0.08}px, 0)` }}
      ></div>
      <div
        className="fixed bottom-[-10%] left-[-10%] w-[80vw] h-200 bg-blue-500/10 rounded-full blur-[150px] pointer-events-none z-0"
        style={{ transform: `translate3d(0, ${-scrollY * 0.04}px, 0)` }}
      ></div>

      {/* 1. Hero Section (First Screen – High Impact) */}
      <section className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center text-center px-6 pt-20 pb-10 bg-white/40 backdrop-blur-sm">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>

        <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold text-[#006E2F] mb-6 tracking-tight drop-shadow-sm leading-tight">
          Explore. Play. Earn.
        </h1>
        <p className="text-xl md:text-2xl text-zinc-700 font-medium max-w-3xl mb-12">
          Discover real places around you, complete missions, and earn rewards
          mapped directly to your world.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 mb-20 z-10">
          <Link
            href="/map"
            className="px-10 py-5 bg-linear-to-r from-[#006E2F] to-[#22C55E] text-white rounded-full font-bold text-lg shadow-[0_16px_40px_rgba(0,110,47,0.3)] hover:scale-105 hover:shadow-[0_20px_50px_rgba(0,110,47,0.4)] transition-all"
          >
            Start Exploring
          </Link>
          <Link
            href="/login"
            className="px-10 py-5 bg-white/80 backdrop-blur-md text-[#006E2F] rounded-full font-bold text-lg border-2 border-green-200 hover:bg-green-50 transition-all shadow-sm"
          >
            Login / Register
          </Link>
        </div>

        {/* Small stats (Floating style to blend with hero) */}
        <div className="flex flex-wrap justify-center gap-12 md:gap-24">
          <div className="flex flex-col items-center animate-fade-in-up">
            <span className="text-4xl font-black text-[#15803D] drop-shadow-sm">
              10k+
            </span>
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">
              Places Discovered
            </span>
          </div>
          <div className="flex flex-col items-center animate-fade-in-up delay-100">
            <span className="text-4xl font-black text-[#0058BE] drop-shadow-sm">
              50k+
            </span>
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">
              Active Users
            </span>
          </div>
          <div className="flex flex-col items-center animate-fade-in-up delay-200">
            <span className="text-4xl font-black text-yellow-600 drop-shadow-sm">
              1M+
            </span>
            <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-2">
              Rewards Claimed
            </span>
          </div>
        </div>
      </section>

      {/* 2. How It Works (3-Step Explanation) */}
      {/* Removed bg-white and bottom padding to let it flow into the next section */}
      <section className="pt-32 pb-16 px-6 bg-white/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-20 tracking-tight">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-12 md:gap-16 relative">
            {/* Connecting Line (Subtle curved gradient line) */}
            <div className="hidden md:block absolute top-[25%] left-[20%] right-[20%] h-0.5 bg-linear-to-r from-transparent via-green-300 to-transparent -z-10 blur-[1px]"></div>

            {/* Step 1 */}
            <div className="flex flex-col items-center group relative">
              <div className="absolute inset-0 bg-green-500/5 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500"></div>
              <div className="w-28 h-28 bg-white/80 backdrop-blur-xl rounded-4xl flex items-center justify-center mb-8 shadow-xl shadow-green-900/5 border border-green-100 group-hover:-translate-y-3 transition-transform duration-300">
                <span className="text-5xl">📍</span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                1. Choose a Category
              </h3>
              <p className="text-zinc-600 font-medium leading-relaxed max-w-65">
                Select Food, Game Zones, Churches, or Hidden Gems to set your
                target destination.
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center group relative mt-4 md:mt-12">
              <div className="absolute inset-0 bg-blue-500/5 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500"></div>
              <div className="w-28 h-28 bg-white/80 backdrop-blur-xl rounded-4xl flex items-center justify-center mb-8 shadow-xl shadow-blue-900/5 border border-blue-100 group-hover:-translate-y-3 transition-transform duration-300">
                <span className="text-5xl">🎮</span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                2. Explore & Play
              </h3>
              <p className="text-zinc-600 font-medium leading-relaxed max-w-65">
                Navigate the map, complete interactive missions, and solve
                localized photo quizzes.
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center group relative mt-8 md:mt-24">
              <div className="absolute inset-0 bg-yellow-500/5 blur-2xl rounded-full scale-150 group-hover:scale-175 transition-transform duration-500"></div>
              <div className="w-28 h-28 bg-white/80 backdrop-blur-xl rounded-4xl flex items-center justify-center mb-8 shadow-xl shadow-yellow-900/5 border border-yellow-100 group-hover:-translate-y-3 transition-transform duration-300">
                <span className="text-5xl">🏆</span>
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                3. Earn Rewards
              </h3>
              <p className="text-zinc-600 font-medium leading-relaxed max-w-65">
                Gain XP, collect digital coins, and climb the real-world
                explorer leaderboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section (Core Value) */}
      <section className="py-24 px-6 relative z-10 bg-white/40 backdrop-blur-sm border-t border-white/30">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-6 tracking-tight">
              Powerful Features
            </h2>
            <p className="text-xl text-zinc-600 font-medium max-w-2xl mx-auto">
              Built for explorers and competitors alike, blending maps with
              magic.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:bg-white transition-colors duration-500">
              <div className="w-14 h-14 bg-linear-to-br from-green-100 to-green-200 text-green-700 text-2xl flex items-center justify-center rounded-2xl mb-8 shadow-inner">
                🗺️
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                Smart Map
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                Discover and filter nearby places intuitively with beautiful
                immersive 3D styling.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:bg-white transition-colors duration-500">
              <div className="w-14 h-14 bg-linear-to-br from-blue-100 to-blue-200 text-blue-700 text-2xl flex items-center justify-center rounded-2xl mb-8 shadow-inner">
                🎯
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                Gamified Experience
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                Engage in rich neighborhood missions, AR-like photo quizzes, and
                daily challenges.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:bg-white transition-colors duration-500">
              <div className="w-14 h-14 bg-linear-to-br from-yellow-100 to-yellow-200 text-yellow-700 text-2xl flex items-center justify-center rounded-2xl mb-8 shadow-inner">
                💰
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                Rewards System
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                Accumulate coins and real-world XP based on your movement and
                logic skills.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:bg-white transition-colors duration-500">
              <div className="w-14 h-14 bg-linear-to-br from-purple-100 to-purple-200 text-purple-700 text-2xl flex items-center justify-center rounded-2xl mb-8 shadow-inner">
                🤖
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                AI Verification
              </h3>
              <p className="text-zinc-600 leading-relaxed">
                Integrated ML models reliably detect fake GPS telemetry and
                classify your quiz photos automatically.
              </p>
            </div>
            <div className="bg-white/60 backdrop-blur-xl p-10 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white hover:bg-white transition-colors duration-500 lg:col-span-2 relative overflow-hidden">
              {/* Decorative element for large card */}
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-linear-to-tl from-indigo-100/50 to-transparent rounded-tl-[100px] -z-10"></div>
              <div className="w-14 h-14 bg-linear-to-br from-indigo-100 to-indigo-200 text-indigo-700 text-2xl flex items-center justify-center rounded-2xl mb-8 shadow-inner">
                📍
              </div>
              <h3 className="text-2xl font-bold text-zinc-900 mb-4">
                Live Navigation
              </h3>
              <p className="text-zinc-600 leading-relaxed max-w-xl">
                Access real-time navigation steps and beautiful route
                visualization smoothly layered directly over the global canvas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Category Preview Section */}
      <section className="py-24 px-6 relative z-10 bg-white/40 backdrop-blur-sm border-t border-white/30">
        {/* Soft background glow to transition categories naturally */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-green-50/50 to-transparent -z-10"></div>
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-16 tracking-tight">
            Endless Discoveries
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                id: 1,
                name: "Food & Drinks",
                icon: "🍔",
                desc: "Taste the local flavor",
                color: "from-orange-50 to-orange-100/50",
                border: "hover:border-orange-200",
              },
              {
                id: 2,
                name: "Game Zones",
                icon: "🎮",
                desc: "Play and conquer",
                color: "from-blue-50 to-blue-100/50",
                border: "hover:border-blue-200",
              },
              {
                id: 3,
                name: "Churches",
                icon: "⛪",
                desc: "Historical & spiritual",
                color: "from-rose-50 to-rose-100/50",
                border: "hover:border-rose-200",
              },
              {
                id: 4,
                name: "Mosques",
                icon: "🕌",
                desc: "Cultural hubs",
                color: "from-teal-50 to-teal-100/50",
                border: "hover:border-teal-200",
              },
              {
                id: 5,
                name: "Shops",
                icon: "🏪",
                desc: "Local commerce",
                color: "from-emerald-50 to-emerald-100/50",
                border: "hover:border-emerald-200",
              },
              {
                id: 6,
                name: "Services",
                icon: "🏥",
                desc: "Essential care",
                color: "from-cyan-50 to-cyan-100/50",
                border: "hover:border-cyan-200",
              },
              {
                id: 7,
                name: "Education",
                icon: "🎓",
                desc: "Learn and grow",
                color: "from-indigo-50 to-indigo-100/50",
                border: "hover:border-indigo-200",
              },
              {
                id: 8,
                name: "Hidden Gems",
                icon: "🔍",
                desc: "Secret locations",
                color: "from-violet-50 to-violet-100/50",
                border: "hover:border-violet-200",
              },
            ].map((cat) => (
              <div
                key={cat.id}
                className={`flex flex-col items-center bg-linear-to-br ${cat.color} p-8 rounded-4xl hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgb(0,0,0,0.1)] transition-all duration-300 border border-white/60 ${cat.border} cursor-pointer backdrop-blur-sm group`}
              >
                <span className="text-5xl mb-6 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </span>
                <h4 className="font-bold text-zinc-900 text-lg mb-2">
                  {cat.name}
                </h4>
                <p className="text-sm text-zinc-500 font-medium">{cat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Game Preview Section - Removed hard splitting colors, unified with gradient */}
      <section className="py-24 px-6 relative isolate z-10 mt-12 mb-12">
        <div className="absolute inset-0 bg-linear-to-br from-green-900/60 via-[#0F172A]/70 to-blue-900/60 backdrop-blur-md rounded-[3rem] mx-6 md:mx-12 lg:mx-auto lg:max-w-7xl overflow-hidden -z-20 shadow-2xl">
          {/* Internal glowing blobs for the dark section */}
          <div className="absolute top-0 right-0 w-125 h-125 bg-green-500/30 rounded-full blur-[120px] mix-blend-screen"></div>
          <div className="absolute bottom-0 left-0 w-125 h-125 bg-blue-500/30 rounded-full blur-[120px] mix-blend-screen"></div>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center py-16 px-8 md:px-16 text-white">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 font-bold uppercase tracking-widest text-xs mb-8 shadow-[0_0_20px_rgba(34,197,94,0.2)]">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Game Modes
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-8 leading-tight tracking-tight text-transparent bg-clip-text bg-linear-to-br from-white to-zinc-400">
              Missions
              <br />
              meet reality.
            </h2>
            <p className="text-zinc-400 text-xl font-medium mb-12 leading-relaxed max-w-lg">
              Interactive modes elevate exploration. Hunt down clues or complete
              complex vehicle routing objectives in your actual neighborhood.
            </p>
            <div className="space-y-10">
              <div className="flex gap-6 items-start group">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:bg-white/10 group-hover:border-green-500/50 transition-all shadow-lg group-hover:shadow-green-500/20">
                  🚔
                </div>
                <div>
                  <h4 className="font-bold text-2xl mb-2 text-zinc-100">
                    Vehicle Mode
                  </h4>
                  <p className="text-zinc-400 font-medium leading-relaxed">
                    Execute drop-off missions directly on the map with a
                    high-fidelity virtual agent navigating real roads.
                  </p>
                </div>
              </div>
              <div className="flex gap-6 items-start group">
                <div className="w-16 h-16 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-center text-3xl shrink-0 group-hover:bg-white/10 group-hover:border-blue-500/50 transition-all shadow-lg group-hover:shadow-blue-500/20">
                  📸
                </div>
                <div>
                  <h4 className="font-bold text-2xl mb-2 text-zinc-100">
                    Photo Quiz
                  </h4>
                  <p className="text-zinc-400 font-medium leading-relaxed">
                    Test your knowledge of the locale. Snap answers validated in
                    real-time by computer vision ML.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mock UI Visual */}
          <div className="relative h-150 w-full bg-slate-900/50 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-2xl p-8 flex flex-col justify-end group">
            {/* Fake Map Background */}
            <div className="absolute inset-0 bg-[url('/map-texture.png')] bg-cover opacity-20 rounded-[2.5rem] mix-blend-luminosity"></div>
            {/* Decorative Map Gradient Mask */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-linear-to-t from-slate-900 via-transparent to-transparent"></div>

            {/* Floating Pin */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-linear-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-2xl shadow-[0_0_40px_rgba(34,197,94,0.6)] animate-bounce border-4 border-slate-900 border-opacity-50 z-20">
              📍
            </div>

            {/* Fake UI Overlay Bottom Panel */}
            <div className="relative z-10 bg-white/10 backdrop-blur-xl p-6 rounded-4xl border border-white/20 mb-4 shadow-xl translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <div className="flex justify-between items-center mb-5">
                <h5 className="font-bold text-lg text-white">
                  Urgent Dropoff Location
                </h5>
                <span className="bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 px-4 py-1.5 rounded-full text-sm font-bold shadow-[0_0_15px_rgba(234,179,8,0.2)]">
                  250 XP
                </span>
              </div>
              <div className="w-full h-3 bg-black/40 rounded-full overflow-hidden border border-white/5">
                <div className="w-3/4 h-full bg-linear-to-r from-green-600 to-green-400 rounded-full relative">
                  <div className="absolute inset-0 bg-[url('/stripe-pattern.png')] opacity-30 mix-blend-overlay"></div>
                </div>
              </div>
              <p className="text-xs text-zinc-400 mt-3 font-semibold text-right">
                0.8 km remaining
              </p>
            </div>

            {/* Bottom Buttons */}
            <div className="relative z-10 grid grid-cols-2 gap-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
              <div className="bg-linear-to-br from-blue-600/20 to-blue-900/40 backdrop-blur-xl p-5 rounded-2xl border border-blue-500/30 text-center hover:bg-blue-600/40 transition-colors cursor-pointer shadow-lg shadow-blue-900/20">
                <span className="text-3xl block mb-3 drop-shadow-md">📸</span>
                <span className="text-xs font-bold text-blue-200 uppercase tracking-wider">
                  Input Answer
                </span>
              </div>
              <div className="bg-linear-to-br from-green-600/20 to-green-900/40 backdrop-blur-xl p-5 rounded-2xl border border-green-500/30 text-center hover:bg-green-600/40 transition-colors cursor-pointer shadow-lg shadow-green-900/20">
                <span className="text-3xl block mb-3 drop-shadow-md">🗺️</span>
                <span className="text-xs font-bold text-green-200 uppercase tracking-wider">
                  Live Route
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Rewards & Leaderboard Section */}
      <section className="py-24 px-6 relative z-10 bg-white/40 backdrop-blur-sm border-t border-white/30">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold text-[#006E2F] mb-6 tracking-tight drop-shadow-sm">
            Compete. Earn. Rank Up.
          </h2>
          <p className="text-xl text-zinc-600 font-medium max-w-2xl mx-auto mb-20 leading-relaxed">
            Turn your daily walking and exploring into a highly competitive
            sport.
          </p>

          <div className="flex flex-col md:flex-row gap-10 justify-center items-stretch max-w-5xl mx-auto">
            {/* Rewards Card */}
            <div className="flex-1 bg-white/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
              <div className="w-24 h-24 bg-linear-to-br from-yellow-100 to-amber-200 text-yellow-600 rounded-full flex items-center justify-center text-5xl mb-8 shadow-inner border border-white">
                🪙
              </div>
              <h3 className="text-3xl font-bold text-zinc-900 mb-4">
                Coins & Points
              </h3>
              <p className="text-zinc-600 font-medium mb-10 leading-relaxed max-w-xs mx-auto">
                Gather virtual tokens scattered around your city maps to redeem
                exclusive perks and digital assets.
              </p>
              <button className="mt-auto px-8 py-4 w-full bg-zinc-100 text-zinc-800 font-bold rounded-2xl hover:bg-zinc-200 transition-colors shadow-sm">
                Explore Rewards Catalog
              </button>
            </div>

            {/* Leaderboard Card */}
            <div className="flex-1 bg-white/80 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,110,47,0.1)] border-2 border-green-400 relative flex flex-col items-center hover:-translate-y-2 transition-transform duration-300">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-linear-to-r from-[#006E2F] to-[#22C55E] text-white px-8 py-2 rounded-full text-sm font-bold shadow-[0_8px_20px_rgba(34,197,94,0.4)] tracking-widest uppercase">
                Weekly Top
              </div>
              <div className="w-full grow flex flex-col gap-4 mb-10 mt-6">
                {[
                  {
                    rank: 1,
                    name: "Alex H.",
                    points: "12,450",
                    color:
                      "bg-yellow-100 text-yellow-700 border border-yellow-200",
                    badge: "👑",
                  },
                  {
                    rank: 2,
                    name: "Sarah M.",
                    points: "11,200",
                    color: "bg-zinc-100 text-zinc-600 border border-zinc-200",
                    badge: "🥈",
                  },
                  {
                    rank: 3,
                    name: "David K.",
                    points: "10,950",
                    color:
                      "bg-orange-50 text-orange-700 border border-orange-200",
                    badge: "🥉",
                  },
                ].map((user, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 rounded-2xl bg-white shadow-sm border border-zinc-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm ${user.color}`}
                      >
                        {user.rank}
                      </div>
                      <span className="font-bold text-zinc-900 text-lg flex items-center gap-2">
                        {user.name}{" "}
                        <span className="text-xl">{user.badge}</span>
                      </span>
                    </div>
                    <span className="font-bold text-green-700 text-lg">
                      {user.points}{" "}
                      <span className="text-xs text-green-900/40 text-left font-bold block -mt-1">
                        XP
                      </span>
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full px-8 py-4 bg-linear-to-r from-green-600 to-green-500 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-[0_8px_20px_rgba(34,197,94,0.3)]">
                View Full Ranks
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Referral / Social Proof Section */}
      <section className="py-24 px-6 relative z-10 bg-white/40 backdrop-blur-sm border-t border-white/30">
        <div className="max-w-4xl mx-auto text-center bg-white/70 backdrop-blur-xl rounded-[3rem] p-12 md:p-20 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white">
          <div className="inline-flex items-center justify-center p-5 bg-linear-to-br from-blue-100 to-indigo-100 text-blue-600 rounded-4xl text-5xl mb-10 shadow-inner">
            🤝
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-zinc-900 mb-6 tracking-tight">
            Invite friends, earn together.
          </h2>
          <p className="text-xl text-zinc-600 mb-12 font-medium">
            When you invite a friend, both of you instantly get 500 bonus coins.
          </p>
          <div className="flex flex-col sm:flex-row max-w-lg mx-auto bg-white rounded-3xl p-3 border-2 border-zinc-100 shadow-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
            <input
              type="text"
              readOnly
              value="SMART-MAP-2026"
              className="flex-1 bg-transparent px-6 py-4 font-mono font-bold text-zinc-800 text-lg outline-none text-center sm:text-left"
            />
            <button className="px-8 py-4 bg-[#0058BE] text-white rounded-2xl font-bold hover:bg-blue-700 shadow-[0_8px_20px_rgba(0,88,190,0.3)] hover:-translate-y-1 transition-all mt-4 sm:mt-0">
              Copy Code
            </button>
          </div>
        </div>
      </section>

      {/* 8. Call-To-Action Section (Final Push) - Removed harsh borders/lines, fluid gradients applied */}
      <section className="relative px-6 py-32 mt-12 overflow-hidden flex flex-col items-center justify-center z-10 transition-colors bg-white/40 backdrop-blur-sm border-t border-white/30">
        {/* Smooth transition into the footer while keeping the grid visible */}
        <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#E8F5E9]/30 to-[#E8F5E9]/10 -z-10"></div>

        <div className="max-w-4xl mx-auto text-center pt-16 pb-20 relative z-10">
          <div className="w-24 h-24 bg-white/60 rounded-full flex items-center justify-center text-4xl mx-auto mb-10 backdrop-blur-sm border border-green-200 shadow-sm">
            🌍
          </div>
          <h2 className="text-5xl md:text-7xl font-black mb-10 text-[#006E2F] tracking-tight drop-shadow-sm leading-tight">
            Start exploring your city
            <br />
            in a whole new way.
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/map"
              className="px-10 py-5 bg-linear-to-r from-[#006E2F] to-[#22C55E] text-white rounded-full font-bold text-lg shadow-[0_16px_40px_rgba(0,110,47,0.3)] hover:scale-105 hover:shadow-[0_20px_50px_rgba(0,110,47,0.4)] transition-all"
            >
              Start Exploring Now
            </Link>
            <Link
              href="/login"
              className="px-10 py-5 bg-white/80 border-2 border-green-200 text-[#006E2F] rounded-full font-bold text-lg hover:bg-green-50 transition-all backdrop-blur-md"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* 9. Footer */}
      <footer className="text-zinc-600 py-16 px-6 relative z-10 overflow-hidden bg-[#E8F5E9]/15 backdrop-blur-[2px]">
        {/* Footer internal glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,197,94,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,197,94,0.08)_1px,transparent_1px)] bg-size-[48px_48px] opacity-70 pointer-events-none z-0"></div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-200 h-100 bg-green-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 relative z-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl bg-green-100/50 p-2 rounded-xl border border-green-500/20">
                🗺️
              </span>
              <span className="text-2xl font-black text-zinc-900 tracking-tight">
                Smart Map
              </span>
            </div>
            <p className="text-sm text-zinc-500 font-medium">
              Explore. Play. Earn.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm font-bold text-zinc-600">
            <Link href="#" className="hover:text-[#006E2F] transition-colors">
              About
            </Link>
            <Link href="#" className="hover:text-[#006E2F] transition-colors">
              Contact
            </Link>
            <Link href="#" className="hover:text-[#006E2F] transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-[#006E2F] transition-colors">
              Terms of Service
            </Link>
          </div>

          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-green-100 hover:text-[#006E2F] transition-colors cursor-pointer text-zinc-500 font-bold border border-green-200 backdrop-blur-sm shadow-sm">
              X
            </div>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-pink-50 hover:text-pink-600 transition-colors cursor-pointer text-zinc-500 font-bold border border-green-200 backdrop-blur-sm shadow-sm">
              IG
            </div>
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center hover:bg-blue-50 hover:text-blue-600 transition-colors cursor-pointer text-zinc-500 font-bold border border-green-200 backdrop-blur-sm shadow-sm">
              FB
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-green-900/10 text-center text-sm font-medium text-zinc-500 relative z-10">
          © 2026 Smart Map Platform. All rights reserved.
        </div>
      </footer>
    </main>
  );
}
