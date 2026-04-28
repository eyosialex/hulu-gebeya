import React from "react";

// Main Application Layout based on the provided Dashboard CSS
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-t from-[#F3FCEF] to-white isolate overflow-hidden flex">
      {/* TopAppBar Shell */}
      <header className="absolute top-0 left-0 w-full h-16 bg-white/70 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-md z-50 flex justify-between items-center px-6">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-extrabold tracking-tight text-green-700">
            Explore
          </h1>

          {/* Search Bar */}
          <div className="flex items-center gap-3 w-96 h-9 bg-[#DCE5D9] rounded-full px-4 text-sm text-[#6D7B6C]">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
              <path d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
            </svg>
            <input
              type="text"
              placeholder="Search locations..."
              className="bg-transparent outline-none w-full placeholder-[#6D7B6C]"
            />
          </div>
        </div>

        {/* Top Navbar Actions (Profile, Points, Coins) */}
        <nav className="flex items-center gap-6">
          <div className="flex items-center gap-8 text-sm font-bold text-zinc-500">
            <button className="hover:text-zinc-900 transition">Map</button>
            <button className="hover:text-zinc-900 transition">Game</button>
            <button className="hover:text-zinc-900 transition">Rewards</button>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2">
              <svg className="w-4 h-5 fill-[#6D7B6C]" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
            </button>
            <div className="w-10 h-10 rounded-full border-2 border-green-500 shadow-md bg-gray-200 overflow-hidden">
              {/* User Avatar */}
              <img
                src="/avatar-placeholder.jpg"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </nav>
      </header>

      {/* SideNavBar Shell */}
      <aside className="absolute left-0 top-0 w-64 h-full bg-gray-50/80 backdrop-blur-xl rounded-r-2xl pt-20 pb-8 px-4 z-40 flex flex-col shadow-2xl">
        {/* User Card */}
        <div className="flex items-center gap-4 mb-8 px-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md text-white font-bold">
            U
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">John Doe</h3>
            <p className="text-[11px] font-normal uppercase tracking-widest text-blue-600">
              Explorer
            </p>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex flex-col gap-1 flex-grow">
          {[
            { label: "Map View", icon: "" },
            { label: "Robot Mode", icon: "" },
            { label: "Photo Quiz", icon: "" },
            { label: "Leaderboard", icon: "" },
            { label: "Add Location", icon: "" },
          ].map((item, idx) => (
            <button
              key={idx}
              className="flex items-center gap-3 px-4 py-3 w-full text-left text-zinc-600 font-semibold text-sm hover:bg-zinc-100 rounded-xl transition"
            >
              <div className="w-5 h-5 bg-zinc-500 rounded-sm"></div>
              {item.label}
            </button>
          ))}
        </nav>

        {/* Daily Goal Overlay */}
        <div className="bg-yellow-200/30 rounded-2xl p-4 mt-2 flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-semibold text-yellow-900 uppercase">
            <span>Daily Goal</span>
          </div>
          <div className="w-full h-1.5 bg-white/50 rounded-full relative">
            <div className="absolute left-0 top-0 h-full bg-yellow-700 rounded-full w-3/4"></div>
          </div>
          <span className="text-[11px] font-bold text-yellow-900">
            75% to Fog Master
          </span>
        </div>

        {/* Action Button */}
        <button className="mt-4 w-full py-3 bg-gradient-to-b from-green-700 to-green-500 text-white font-bold text-sm rounded-full shadow-lg hover:opacity-90 transition">
          Start Exploring
        </button>
      </aside>

      {/* Main MainCanvas (The Map Viewer) */}
      <main className="pl-[256px] pt-16 flex-grow relative w-full h-full">
        {children}

        {/* Right Side Stats Sidebar (Bento Style) */}
        <div className="absolute right-8 top-24 w-20 flex flex-col gap-4 z-40">
          <div className="w-20 h-16 bg-[#F3FCEF]/80 border border-white/20 backdrop-blur-md rounded-2xl shadow-sm flex flex-col items-center justify-center p-3">
            <div className="w-5 h-5 bg-yellow-700 rounded-full mb-1"></div>
            <span className="text-[10px] font-bold text-zinc-900">1.2k</span>
          </div>
          <div className="w-20 h-16 bg-[#F3FCEF]/80 border border-white/20 backdrop-blur-md rounded-2xl shadow-sm flex flex-col items-center justify-center p-3">
            <div className="w-4 h-4 bg-blue-600 rounded-sm mb-1"></div>
            <span className="text-[10px] font-bold text-zinc-900">450</span>
          </div>
          <div className="w-20 h-16 bg-[#F3FCEF]/80 border border-white/20 backdrop-blur-md rounded-2xl shadow-sm flex flex-col items-center justify-center p-3">
            <div className="w-5 h-4 bg-red-600 rounded-md mb-1"></div>
            <span className="text-[10px] font-bold text-zinc-900">12</span>
          </div>
        </div>

        {/* Floating Action Buttons Cluster */}
        <div className="absolute right-8 bottom-8 flex flex-col items-end gap-4 z-40">
          <button className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition">
            <div className="w-2 h-5 bg-zinc-900 rounded-sm"></div>
          </button>
          <button className="w-14 h-14 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition">
            <div className="w-5 h-5 bg-zinc-900 rounded-full"></div>
          </button>
          <button className="w-16 h-16 bg-gradient-to-br from-green-700 to-green-500 rounded-full shadow-[0_12px_48px_rgba(0,110,47,0.4)] flex items-center justify-center hover:scale-105 transition">
            <div className="w-4 h-4 bg-white rounded-sm"></div>
          </button>
        </div>
      </main>
    </div>
  );
}
