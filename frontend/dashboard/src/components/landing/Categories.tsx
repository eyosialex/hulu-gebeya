import { motion } from "framer-motion";

const categories = [
  { emoji: "🍔", title: "Food & Drinks", tagline: "Taste the local flavor.", color: "from-orange-500/30 to-red-500/20" },
  { emoji: "🎮", title: "Game Zones", tagline: "Play and conquer nearby spots.", color: "from-violet-500/30 to-fuchsia-500/20" },
  { emoji: "⛪", title: "Churches", tagline: "Historical and spiritual landmarks.", color: "from-amber-500/30 to-yellow-500/20" },
  { emoji: "🕌", title: "Mosques", tagline: "Cultural community hubs.", color: "from-emerald-500/30 to-teal-500/20" },
  { emoji: "🏪", title: "Shops", tagline: "Local stores and markets.", color: "from-blue-500/30 to-cyan-500/20" },
  { emoji: "🔍", title: "Hidden Gems", tagline: "Secret finds off the beaten path.", color: "from-pink-500/30 to-rose-500/20" },
];

export function Categories() {
  return (
    <section className="relative py-32 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-accent font-semibold uppercase tracking-widest text-sm mb-3">
            Choose Your Adventure
          </p>
          <h2 className="font-display text-4xl md:text-6xl font-extrabold">
            Pick Your <span className="text-gradient">Path</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {categories.map((c, i) => (
            <motion.div
              key={c.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              className="group relative aspect-square md:aspect-[5/4] rounded-3xl glass overflow-hidden cursor-pointer"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${c.color} opacity-60 group-hover:opacity-100 transition-opacity`} />
              <div className="relative h-full flex flex-col items-center justify-center text-center p-6">
                <div className="text-6xl mb-4 group-hover:scale-125 transition-transform duration-300">
                  {c.emoji}
                </div>
                <h3 className="font-display text-xl font-bold mb-1">{c.title}</h3>
                <p className="text-sm text-muted-foreground">{c.tagline}</p>
              </div>
              <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl group-hover:ring-primary/40 transition-all" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
