import React from "react";

const CATEGORIES = [
  { name: "Food & Drinks", icon: "🍔" },
  { name: "Game Zones", icon: "🎮" },
  { name: "Churches", icon: "⛪" },
  { name: "Mosques", icon: "🕌" },
  { name: "Shops", icon: "🛍️" },
  { name: "Services", icon: "🛠️" },
  { name: "Education", icon: "📚" },
  { name: "Hidden Gems", icon: "💎" },
  { name: "Events", icon: "🎪" },
];

export default function CategorySelectionPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-20 px-4">
      <div className="max-w-4xl w-full text-center">
        <h1 className="text-4xl font-black text-green-800 mb-4 tracking-tight">
          Choose Your Adventure
        </h1>
        <p className="text-lg text-slate-600 mb-12">
          Select what you want to explore on the map first.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {CATEGORIES.map((cat, i) => (
            <button
              key={i}
              className="flex flex-col items-center justify-center p-8 bg-white border-2 border-transparent hover:border-green-500 hover:shadow-xl rounded-2xl transition-all group"
            >
              <span className="text-4xl mb-4 group-hover:scale-110 transition-transform">
                {cat.icon}
              </span>
              <span className="font-bold text-slate-700 group-hover:text-green-700">
                {cat.name}
              </span>
            </button>
          ))}
        </div>

        <button className="mt-16 px-10 py-4 bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-lg shadow-lg">
          Enter Map
        </button>
      </div>
    </div>
  );
}
