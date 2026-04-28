import React from "react";
import MainLayout from "../../shared/layouts/MainLayout";

export default function MapView() {
  return (
    <MainLayout>
      {/* Interactive Map Background */}
      <div className="absolute inset-0 bg-white z-0">
        {/* Simulating Map Surface */}
        <div className="w-full h-full bg-[linear-gradient(0deg,#FFFFFF,#FFFFFF),url('/map-texture.png')] bg-blend-saturation opacity-50"></div>

        {/* Fog Map Overlays (Atmospheric Depth) */}
        <div className="absolute w-96 h-96 left-1/3 top-1/4 bg-zinc-900/80 border border-white/5 backdrop-blur-md rounded-full mask-gradient z-10 pointer-events-none"></div>
        <div className="absolute w-[480px] h-[480px] right-64 bottom-64 bg-zinc-900/90 border border-white/5 backdrop-blur-md rounded-full mask-gradient z-10 pointer-events-none"></div>
      </div>

      {/* Map Markers Overlay */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        {/* Placeholder Marker 1 */}
        <div className="absolute left-[496px] top-[393px] flex flex-col items-center group pointer-events-auto">
          {/* Tooltip (Hover) */}
          <div className="absolute bottom-full mb-2 bg-white shadow-2xl rounded-xl p-4 w-48 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2">
            <div className="flex justify-between items-start">
              <h4 className="text-sm font-bold text-zinc-900 leading-tight">
                Hidden Cafe
              </h4>
              <span className="bg-yellow-300 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded">
                150 XP
              </span>
            </div>
            <p className="text-xs text-green-900">
              Unexplored terrain detected. Scan to unlock.
            </p>
          </div>

          {/* Pin */}
          <div className="relative w-8 h-8 flex justify-center items-center">
            <div className="w-8 h-8 rounded-full bg-green-700/40 absolute"></div>
            <div className="w-8 h-8 rounded-full bg-green-700 border-2 border-white flex justify-center items-center shadow-lg relative z-10">
              <div className="w-2.5 h-3 bg-white rounded-sm"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Filter / Category Switch Bar (Internal overlay) */}
      <div className="absolute top-6 left-6 z-30">
        <div className="bg-green-50/90 backdrop-blur-md px-6 py-3 rounded-full flex gap-4 shadow-lg border border-green-200">
          <button className="text-sm font-bold text-green-800 uppercase tracking-wider">
            All
          </button>
          <button className="text-sm font-bold text-zinc-500 uppercase tracking-wider hover:text-green-700">
            Food
          </button>
          <button className="text-sm font-bold text-zinc-500 uppercase tracking-wider hover:text-green-700">
            Zones
          </button>
          <button className="text-sm font-bold text-zinc-500 uppercase tracking-wider hover:text-green-700">
            Gems
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
