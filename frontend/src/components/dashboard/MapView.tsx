import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import gsap from "gsap";
import { useNavigate } from "@tanstack/react-router";
import { useDashboard } from "./DashboardContext";
import { Navigation2, MapPin, Camera, ChevronDown, ChevronUp, X, LocateFixed, Loader2, AlertTriangle, Search, Sparkles, MapPinPlus, Bookmark, CheckCircle, Globe } from "lucide-react";
import { categories } from "./AppSidebar";
import { SubmissionForm } from "./SubmissionForm";
import { AddLocationForm } from "./AddLocationForm";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useNearbyLocations } from "@/hooks/useNearbyLocations";
import { useSearch, type RagResponse } from "@/hooks/useSearch";
import { useRoute, useSaveRoute } from "@/hooks/useRoute";
import { useNavigationGuide } from "@/hooks/useNavigationGuide";
import { useRobotPhysics } from "@/hooks/useRobotPhysics";
import { AnimatePresence } from "framer-motion";
import { apiRequest } from "@/lib/api";

type NearbyPlace = {
  lat: number;
  lng: number;
  name: string;
  category: string;
  distance: number;
  status: string;
  note: string;
};

const categoryPinStyles: Record<string, { from: string; to: string; glow: string }> = {
  food: { from: "#ff9f43", to: "#ff6b6b", glow: "rgba(255,159,67,.7)" },
  transport: { from: "#4f8bff", to: "#88d6ff", glow: "rgba(99,160,255,.75)" },
  art: { from: "#ff6ad5", to: "#8b5cf6", glow: "rgba(255,106,213,.65)" },
  study: { from: "#5eead4", to: "#38bdf8", glow: "rgba(94,234,212,.65)" },
  culture: { from: "#f7b955", to: "#fb7185", glow: "rgba(247,185,85,.65)" },
  hidden: { from: "#22c55e", to: "#a3e635", glow: "rgba(34,197,94,.7)" },
  health: { from: "#34d399", to: "#60a5fa", glow: "rgba(52,211,153,.7)" },
  services: { from: "#94a3b8", to: "#cbd5e1", glow: "rgba(148,163,184,.65)" },
  game: { from: "#a855f7", to: "#06b6d4", glow: "rgba(168,85,247,.7)" },
};

function createPinIcon(category: string) {
  const style = categoryPinStyles[category] ?? categoryPinStyles.transport;
  return new L.DivIcon({
    className: "smartmap-pin",
    html: `<div style="
      width:30px;height:30px;border-radius:9999px;
      background:linear-gradient(135deg,${style.from},${style.to});
      border:2px solid rgba(0,0,0,.85);
      box-shadow:0 0 16px ${style.glow};
      position:relative;
    ">
      <div style="position:absolute;inset:7px;border-radius:9999px;background:rgba(255,255,255,.18);"></div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

const userLocationIcon = new L.DivIcon({
  className: "smartmap-user-marker",
  html: `
    <div style="position:relative;width:60px;height:60px;display:flex;align-items:center;justify-content:center;">
      {/* Outer Pulse */}
      <div style="position:absolute;inset:0;border-radius:9999px;
        background:radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(239, 68, 68, 0) 70%);
        animation:pulse 2s ease-out infinite;"></div>
      
      {/* Red Location Pin */}
      <div style="font-size:45px;filter:drop-shadow(0 0 10px #ef4444);z-index:10;">📍</div>
      
      {/* Black Directional Arrow */}
      <div id="user-heading-arrow" style="
        position:absolute;
        top:-15px;
        font-size:35px;
        color:black;
        filter:drop-shadow(0 0 4px white);
        transition: transform 0.3s ease;
      ">⬆️</div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(0.6); opacity: 1; }
        100% { transform: scale(1.8); opacity: 0; }
      }
    </style>
  `,
  iconSize: [60, 60],
  iconAnchor: [30, 30],
});

// Mock data removed in favor of real API fetching

function FollowPlayer({ position, follow }: { position: [number, number] | null; follow: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (follow && position) map.setView(position, map.getZoom() < 15 ? 16 : map.getZoom(), { animate: true });
  }, [position, follow, map]);

  return null;
}

function MapEvents({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function FlyToLocation({ position }: { position: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 17, { duration: 1.5 });
  }, [position, map]);
  return null;
}

function Key({ cap }: { cap: string }) {
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/30 bg-black/40 font-bold text-primary-glow shadow-elegant backdrop-blur-md">
      {cap}
    </div>
  );
}

export function MapView() {
  const navigate = useNavigate();
  const { activeCategory } = useDashboard();
  const { lat, lng, error: geoError, isLoading: isGeoLoading } = useGeolocation();
  const { data: locations = [], isLoading: isNearbyLoading } = useNearbyLocations(lat, lng);
  const searchMutation = useSearch();
  const saveRouteMutation = useSaveRoute();


  const cat = categories.find((c) => c.id === activeCategory);
  
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  
  const [unlocked, setUnlocked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [resultsMinimized, setResultsMinimized] = useState(false);
  const [follow, setFollow] = useState(true);
  const [query, setQuery] = useState("");
  const [ragData, setRagData] = useState<RagResponse | null>(null);
  const [flyToPos, setFlyToPos] = useState<[number, number] | null>(null);
  const [selectedSearchPin, setSelectedSearchPin] = useState<any | null>(null);
  const [isSimulator, setIsSimulator] = useState(false);
  const [personaMsg, setPersonaMsg] = useState<string | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);
  const [addCoords, setAddCoords] = useState<{ lat: number; lng: number } | null>(null);

  const effectivePos = useRobotPhysics(lat, lng, isSimulator);

  // Navigation Target Logic
  const activeDest = selectedTargetId 
    ? locations.find(l => l.id === selectedTargetId) 
    : selectedSearchPin;
  
  const destCoords = activeDest ? { lat: activeDest.lat, lng: activeDest.lng } : null;

  const { data: routeData, isLoading: isRouteLoading } = useRoute(
    effectivePos.lat && effectivePos.lng ? { lat: effectivePos.lat, lng: effectivePos.lng } : null,
    destCoords
  );

  const { data: navGuide } = useNavigationGuide(
    effectivePos.lat && effectivePos.lng ? { lat: effectivePos.lat, lng: effectivePos.lng } : null,
    destCoords
  );

  // AI Persona Chat Logic
  useEffect(() => {
    const fetchChat = async () => {
      if (!effectivePos.lat || !effectivePos.lng) return;
      try {
        const res = await apiRequest(`/missions/persona/chat?lat=${effectivePos.lat}&lng=${effectivePos.lng}`);
        if (res.message) {
          setPersonaMsg(res.message);
          setTimeout(() => setPersonaMsg(null), 8000);
        }
      } catch (e) {}
    };
    
    fetchChat();
    const interval = setInterval(fetchChat, 35000);
    return () => clearInterval(interval);
  }, [effectivePos.lat, effectivePos.lng, isSimulator]);

  // Mode Toggle Controller
  const toggleSimulator = () => {
    if (!isSimulator) {
      setIsSimulator(true);
      setFollow(true); // Auto-focus on robot
    } else {
      setIsSimulator(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setRagData(null);
    searchMutation.mutate(
      { query, userLat: effectivePos.lat || 8.9806, userLng: effectivePos.lng || 38.7578 },
      { 
        onSuccess: (data) => {
          setRagData(data);
          // Don't show all pins anymore, just reset selection
          setSelectedSearchPin(null);
        },
        onError: (err: any) => {
          console.error("Search failed:", err);
          // Assuming toast is available in the project context (it is in imports)
          import("sonner").then(({ toast }) => toast.error(err.message || "Search failed"));
        }
      }
    );
  };

  const cardRef = useRef<HTMLDivElement>(null);
  const resultsScrollRef = useRef<HTMLDivElement>(null);
  const searchResultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ragData && searchResultRef.current) {
      gsap.fromTo(searchResultRef.current,
        { y: 20, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [ragData]);

  const nearbyPlaces = activeCategory 
    ? locations.filter((place) => place.category === activeCategory) 
    : locations;

  const nearbyLabel = cat?.label ?? "All Categories";
  
  const target = selectedTargetId 
    ? locations.find(p => p.id === selectedTargetId) || nearbyPlaces[0] || null
    : nearbyPlaces[0] || null;

  useEffect(() => {
    if (target && target.distance <= 0.05) { // 50 meters
      setUnlocked(true);
    } else {
      setUnlocked(false);
    }
  }, [target]);

  // routeData is already declared above using effectivePos for better accuracy

  // Declare handleSaveRoute HERE — after routeData, target, effectivePos are all defined
  const handleSaveRoute = () => {
    if (!routeData || !target || !effectivePos.lat || !effectivePos.lng) return;
    saveRouteMutation.mutate({
      name: `Route to ${target.name}`,
      originLat: effectivePos.lat,
      originLng: effectivePos.lng,
      destinationLat: target.lat,
      destinationLng: target.lng,
    });
  };

  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { y: 60, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "power3.out" },
    );
  }, [minimized]);

  useEffect(() => {
    if (resultsScrollRef.current) {
      resultsScrollRef.current.scrollTop = 0;
    }
  }, [activeCategory, nearbyPlaces]);

  return (
    <div className="relative h-[calc(100vh-56px)] w-full lg:h-screen overflow-hidden">
      {" "}
      {isAddMode && (
        <div className="absolute inset-x-0 top-20 z-2000 flex justify-center pointer-events-none">
          <div className="rounded-full bg-gradient-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow-glow animate-pulse">
            Select a point on the map to add a place
          </div>
        </div>
      )}
      {/* AI Navigation Overlay */}
      <AnimatePresence>
        {navGuide && activeDest && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-24 left-1/2 z-[1000] w-full max-w-md -translate-x-1/2 px-4"
          >
            <div className="group relative overflow-hidden rounded-2xl border border-primary/30 bg-black/80 p-4 shadow-elegant backdrop-blur-xl">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-50"></div>
              
              <div className="relative flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary shadow-glow">
                  <Navigation2 className="h-6 w-6 animate-pulse" />
                </div>
                
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary-glow">AI Navigator</p>
                    <span className="text-[10px] text-muted-foreground">{navGuide.distance}</span>
                  </div>
                  <h3 className="mt-0.5 text-sm font-bold text-white line-clamp-1">
                    {navGuide.instruction}
                  </h3>
                  <p className="mt-1 text-[11px] text-muted-foreground line-clamp-1 italic">
                    "{navGuide.robotPersona}"
                  </p>
                </div>

                <button 
                  onClick={() => {
                    setSelectedTargetId(null);
                    setSelectedSearchPin(null);
                  }}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-white/5 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/5">
                <div className="h-full bg-primary shadow-glow transition-all duration-1000" style={{ width: '65%' }}></div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-3">
        {/* Top Search Bar */}
      </div>
      <div className="absolute inset-x-0 top-4 z-2000 flex flex-col items-center gap-3 px-4">
        <form
          onSubmit={handleSearch}
          className="group flex w-full max-w-md items-center gap-2 rounded-full border border-border/60 bg-black/70 p-1 pl-4 shadow-glow backdrop-blur-xl transition-all focus-within:border-primary/50 focus-within:bg-black/90 sm:max-w-lg"
        >
          <Search className="h-4 w-4 text-muted-foreground group-focus-within:text-primary-glow" />
          <input
            type="text"
            placeholder="Ask AI: 'Where is the best cafe nearby?'"
            className="flex-1 bg-transparent py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="submit"
            disabled={searchMutation.isPending}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-primary-foreground shadow-glow transition-transform hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {searchMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </button>
        </form>

        <AnimatePresence>
          {ragData && (
            <div
              ref={searchResultRef}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-primary/30 bg-black/95 shadow-glow backdrop-blur-xl sm:max-w-lg"
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-2 border-b border-border/30 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/20">
                    <Sparkles className="h-3 w-3 text-primary-glow" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-primary-glow">SmartMap AI · RAG Search</span>
                  {ragData.confidence != null && (
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] text-primary-glow">
                      {Math.round(ragData.confidence * 100)}% confidence
                    </span>
                  )}
                </div>
                <button onClick={() => setRagData(null)} className="p-1 text-muted-foreground hover:text-foreground">
                  <X className="h-3 w-3" />
                </button>
              </div>

              {/* AI Answer */}
              <div className="px-4 py-3">
                <p className="text-xs leading-relaxed text-foreground/90">{ragData.answer}</p>
              </div>

              {/* Results */}
              {(() => {
                const allResults = [
                  ...(ragData.sources?.database ?? []),
                  ...(ragData.sources?.osm ?? []),
                  ...(ragData.sources?.overpass ?? [])
                ].slice(0, 5);
                return allResults.length > 0 ? (
                  <div className="border-t border-border/30 px-4 pb-3 pt-2">
                    <p className="mb-2 text-[9px] uppercase tracking-widest text-muted-foreground">
                      Top Results · {ragData.total_results} found
                    </p>
                    <div className="space-y-2">
                      {allResults.map((r, i) => (
                        <button 
                          key={i} 
                          onClick={() => {
                            if (r.lat && r.lng) {
                              setFlyToPos([r.lat, r.lng]);
                              setFollow(false);
                              if (r.source === 'database') {
                                setSelectedTargetId(r.id);
                                setSelectedSearchPin(null);
                              } else {
                                setSelectedSearchPin(r);
                                setSelectedTargetId(null);
                              }
                            }
                          }}
                          className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/30 bg-white/5 px-3 py-2 text-left transition-all hover:border-primary/50 hover:bg-white/10 active:scale-[0.98]"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-xs font-medium text-foreground">{r.name}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[9px] uppercase text-muted-foreground">{r.category || 'location'}</span>
                              {r.source && (
                                <span className="flex items-center gap-0.5 text-[9px] text-primary-glow">
                                  <Globe className="h-2.5 w-2.5" />{r.source}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-1">
                            {r.distance != null && (
                              <span className="text-[9px] text-muted-foreground">
                                {r.distance < 1 ? `${Math.round(r.distance * 1000)}m` : `${r.distance.toFixed(1)}km`}
                              </span>
                            )}
                            {r.trust_score != null && (
                              <span className="text-[9px] font-medium" style={{ color: r.trust_score > 0.7 ? '#22c55e' : '#f59e0b' }}>
                                {Math.round(r.trust_score * 100)}% trust
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </AnimatePresence>

        {/* Navigation Directions Ribbon */}
        {routeData && (
          <div className="flex items-center gap-4 rounded-full border border-primary/40 bg-black/80 px-4 py-2 text-[10px] sm:text-xs backdrop-blur-xl shadow-glow animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-2 border-r border-border/60 pr-4">
              <Navigation2 className="h-3.5 w-3.5 text-primary-glow fill-primary/20" />
              <span className="font-bold text-foreground">
                {routeData.summary || "Main Route"}
              </span>
            </div>
            <div className="flex items-center gap-3 border-r border-border/60 pr-4">
              <span className="text-muted-foreground">
                {routeData.estimatedDistanceKm} km
              </span>
              <span className="text-primary-glow">
                {routeData.estimatedTimeMin} min ETA
              </span>
            </div>
            <button
               onClick={handleSaveRoute}
               disabled={saveRouteMutation.isPending}
               className="flex items-center gap-1.5 text-muted-foreground hover:text-primary-glow transition-colors disabled:opacity-50"
            >
               {saveRouteMutation.isSuccess ? (
                 <CheckCircle className="h-4 w-4 text-success" />
               ) : saveRouteMutation.isPending ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                 <Bookmark className="h-4 w-4" />
               )}
               <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        )}
      </div>
      {/* Global Status Ribbon for Edge Cases */}
      {(geoError || isGeoLoading || isNearbyLoading) && (
        <div className="absolute inset-x-0 top-24 z-2000 flex items-center justify-center p-2">
          <div className="flex items-center gap-2 rounded-full border border-border/60 bg-black/80 px-4 py-1.5 text-[11px] backdrop-blur-xl shadow-elegant">
            {isGeoLoading ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin text-primary-glow" />
                <span className="text-foreground">Acquiring GPS Signal...</span>
              </>
            ) : geoError ? (
              <>
                <AlertTriangle className="h-3 w-3 text-warning" />
                <span className="text-foreground">
                  GPS Denied · Defaulting to City View
                </span>
              </>
            ) : isNearbyLoading ? (
              <>
                <div className="h-2 w-2 animate-pulse rounded-full bg-primary-glow" />
                <span className="text-foreground">Syncing nearby points...</span>
              </>
            ) : null}
          </div>
        </div>
      )}
      <MapContainer
        center={effectivePos.lat && effectivePos.lng ? [effectivePos.lat, effectivePos.lng] : [8.9806, 38.7578]}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#000" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {isAddMode && (
          <MapEvents
            onMapClick={(lat, lng) => {
              setAddCoords({ lat, lng });
              setIsAddMode(false);
            }}
          />
        )}

        {/* Navigation Polyline */}
        {routeData && routeData.path && (
          <Polyline 
            positions={routeData.path
              .filter(p => p.lat !== undefined && p.lng !== undefined && !isNaN(p.lat) && !isNaN(p.lng))
              .map(p => [p.lat, p.lng]) as [number, number][]
            } 
            color="#63a0ff"
            weight={5}
            opacity={0.8}
            lineCap="round"
            dashArray="1, 10"
            className="animate-pulse shadow-glow"
          />
        )}
        {selectedSearchPin && (
          <Marker 
            position={[selectedSearchPin.lat, selectedSearchPin.lng]} 
            icon={new L.DivIcon({
              className: "selected-search-pin",
              html: `
                <div style="width:45px;height:45px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 10px #22c55e); z-index: 999;">
                  <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="#22c55e" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                    <circle cx="12" cy="10" r="3" fill="white"></circle>
                  </svg>
                </div>`,
              iconSize: [45, 45],
              iconAnchor: [22.5, 45],
            })}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold text-xs">{selectedSearchPin.name}</p>
                <p className="text-[9px] uppercase text-muted-foreground">{selectedSearchPin.source} · {selectedSearchPin.category}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {locations
          .filter(p => p.lat !== undefined && p.lng !== undefined)
          .map((p) => (
          <Marker 
            key={p.id} 
            position={[p.lat, p.lng]} 
            icon={selectedTargetId === p.id 
              ? new L.DivIcon({
                  className: "selected-location-pin",
                  html: `
                    <div style="width:45px;height:45px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 0 10px #22c55e); z-index: 999;">
                      <svg xmlns="http://www.w3.org/2000/svg" width="45" height="45" viewBox="0 0 24 24" fill="#22c55e" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
                        <circle cx="12" cy="10" r="3" fill="white"></circle>
                      </svg>
                    </div>`,
                  iconSize: [45, 45],
                  iconAnchor: [22.5, 45],
                })
              : createPinIcon(p.category)
            }
            eventHandlers={{
              click: () => {
                setFlyToPos([p.lat, p.lng]);
                setFollow(false);
                setSelectedTargetId(p.id); // Instant selection
                setSelectedSearchPin(null);
              },
            }}
          >
            <Popup>
              <div className="p-1">
                <p className="font-bold">{p.name}</p>
                <p className="text-[10px] uppercase text-muted-foreground">{p.category}</p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <span className="text-primary-glow">+{p.points} XP</span>
                  <button 
                    onClick={() => {
                      setSelectedTargetId(p.id);
                      setFollow(true);
                    }}
                    className={`rounded-full px-3 py-1 text-[10px] transition-all ${
                      selectedTargetId === p.id 
                        ? "bg-primary text-primary-foreground shadow-glow" 
                        : "bg-primary/20 text-primary hover:bg-primary/30"
                    }`}
                  >
                    {selectedTargetId === p.id ? "Targeted" : "Navigate To"}
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
        {typeof effectivePos.lat === 'number' && typeof effectivePos.lng === 'number' && !isNaN(effectivePos.lat) && !isNaN(effectivePos.lng) && (
          <>
            <Marker position={[effectivePos.lat, effectivePos.lng]} icon={userLocationIcon}>
              <Popup>
                {isSimulator ? "Robot Mode (Simulated)" : "You are here · Player Car"}
              </Popup>
            </Marker>
            {personaMsg && (
              <Marker 
                position={[effectivePos.lat + 0.0005, effectivePos.lng]} 
                icon={new L.DivIcon({
                  className: "persona-bubble",
                  html: `
                    <div style="
                      background: rgba(0,0,0,0.85);
                      border: 1px solid rgba(99,160,255,0.5);
                      padding: 8px 12px;
                      border-radius: 12px;
                      color: white;
                      font-size: 11px;
                      width: 150px;
                      box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                      position: relative;
                      animation: float 3s ease-in-out infinite;
                    ">
                      ${personaMsg}
                      <div style="
                        position: absolute;
                        bottom: -6px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 0; 
                        height: 0; 
                        border-left: 6px solid transparent;
                        border-right: 6px solid transparent;
                        border-top: 6px solid rgba(0,0,0,0.85);
                      "></div>
                    </div>
                    <style>
                      @keyframes float {
                        0%, 100% { transform: translateY(0); }
                        50% { transform: translateY(-5px); }
                      }
                    </style>
                  `,
                  iconSize: [150, 50],
                  iconAnchor: [75, 60]
                })}
              />
            )}
            {routeData?.path && (
              <Polyline 
                positions={routeData.path.map(p => [p.lat, p.lng])} 
                color="#63a0ff" 
                weight={5}
                opacity={0.7}
                dashArray="10, 10"
                lineJoin="round"
              />
            )}
            <FollowPlayer position={[effectivePos.lat, effectivePos.lng]} follow={follow} />
            <FlyToLocation position={flyToPos} />
          </>
        )}
      </MapContainer>

      {/* WASD HUD Overlay */}
      {isSimulator && (
        <div className="absolute bottom-24 left-1/2 z-2000 -translate-x-1/2">
          <div className="flex flex-col items-center gap-2 rounded-2xl border border-primary/40 bg-black/80 px-4 py-3 backdrop-blur-xl shadow-glow">
            <div className="flex gap-2">
              <Key cap="W" />
            </div>
            <div className="flex gap-2">
              <Key cap="A" />
              <Key cap="S" />
              <Key cap="D" />
            </div>
            <p className="mt-1 text-[9px] uppercase tracking-widest text-primary-glow animate-pulse">
              Robot: Keyboard Control Active
            </p>
          </div>
        </div>
      )}

      <div className="pointer-events-none absolute left-4 top-4 z-1000 flex items-center gap-2 rounded-full border border-border/60 bg-black/70 px-3 py-2 text-[11px] text-foreground backdrop-blur sm:px-4 sm:text-xs">
        <MapPin className="h-3.5 w-3.5 text-primary-glow" />
        <span className="font-medium">{nearbyLabel}</span>
        <span className="text-muted-foreground">· {locations.length} pins</span>
      </div>

      {resultsMinimized ? (
        <button
          onClick={() => setResultsMinimized(false)}
          className="absolute left-2 top-16 z-1000 flex w-[min(88vw,18rem)] items-center justify-between rounded-2xl border border-border/60 bg-black/80 px-3 py-3 text-left shadow-glow backdrop-blur-xl sm:left-4 sm:top-20 sm:w-[min(92vw,20rem)] sm:px-4"
        >
          <div>
            <p className="text-[10px] uppercase tracking-widest text-primary-glow">Nearby Results</p>
            <p className="text-sm font-semibold text-foreground">{nearbyLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-border/60 px-2 py-1 text-[10px] text-muted-foreground">
              {nearbyPlaces.length}
            </span>
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </div>
        </button>
      ) : (
        <div className="absolute left-2 top-16 z-1000 w-[min(88vw,18rem)] rounded-2xl border border-border/60 bg-black/80 p-3 shadow-glow backdrop-blur-xl sm:left-4 sm:top-20 sm:w-[min(92vw,20rem)] sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-primary-glow">Nearby Results</p>
              <p className="text-xs font-semibold text-foreground sm:text-sm">{nearbyLabel}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-border/60 px-2 py-1 text-[10px] text-muted-foreground">
                {nearbyPlaces.length}
              </span>
              <button
                onClick={() => setResultsMinimized(true)}
                className="rounded-full border border-border/60 p-1.5 text-muted-foreground hover:text-foreground"
                title="Minimize nearby results"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div ref={resultsScrollRef} className="mt-3 max-h-56 space-y-2 overflow-y-auto pr-1 sm:max-h-72">
            {nearbyPlaces.map((place) => {
              const categoryLabel = categories.find((item) => item.id === place.category)?.label ?? place.category;
              const isSelected = selectedTargetId === place.id;
              return (
                <button
                  key={place.id}
                  onClick={() => {
                    setSelectedTargetId(place.id);
                    setFollow(true);
                  }}
                  className={`w-full rounded-xl border p-2.5 text-left transition-all sm:p-3 ${
                    isSelected 
                      ? "border-primary bg-primary/10 shadow-glow" 
                      : "border-border/40 bg-surface/40 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-xs font-medium text-foreground sm:text-sm">{place.name}</p>
                        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-primary-glow animate-pulse" />}
                      </div>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{categoryLabel}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] text-primary-glow">+{place.points} XP</span>
                      <span className="text-[10px] text-muted-foreground">{place.distance} km</span>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">
                    {place.statusText || (place as any).note || "Tap to set as target for this mission."}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="absolute right-2 top-20 z-1000 flex max-w-[min(44vw,10rem)] flex-col gap-2 sm:right-4 sm:top-4 sm:max-w-none">
        <button
          onClick={toggleSimulator}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-2 text-[11px] backdrop-blur transition sm:px-3 sm:text-xs ${
            isSimulator
              ? "border-primary bg-primary text-primary-foreground shadow-glow"
              : "border-border/60 bg-black/70 text-muted-foreground hover:text-foreground"
          }`}
          title="Robot mode"
        >
          <Navigation2 className={`h-3.5 w-3.5 ${isSimulator ? 'animate-pulse' : ''}`} />
          {isSimulator ? "Robot Active" : "Robot Mode"}
        </button>
        <button
          onClick={() => setIsAddMode(!isAddMode)}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-2 text-[11px] backdrop-blur transition sm:px-3 sm:text-xs ${
            isAddMode
              ? "border-primary bg-primary text-primary-foreground shadow-glow"
              : "border-border/60 bg-black/70 text-muted-foreground hover:text-foreground"
          }`}
          title="Add location"
        >
          <MapPinPlus className="h-3.5 w-3.5" />
          {isAddMode ? "Cancel Add" : "Add Place"}
        </button>
        <button
          onClick={() => setFollow((f) => !f)}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-2 text-[11px] backdrop-blur transition sm:px-3 sm:text-xs ${
            follow
              ? "border-primary/50 bg-primary/20 text-primary-glow shadow-glow"
              : "border-border/60 bg-black/70 text-muted-foreground hover:text-foreground"
          }`}
          title="Follow player"
        >
          <LocateFixed className="h-3.5 w-3.5" />
          {follow ? "Following" : "Free cam"}
        </button>
        <button
          onClick={() => navigate({ to: "/dashboard" })}
          className="flex items-center gap-1.5 whitespace-nowrap rounded-full border border-border/60 bg-black/70 px-2.5 py-2 text-[11px] text-muted-foreground backdrop-blur hover:text-foreground sm:px-3 sm:text-xs"
          title="Close map"
        >
          <X className="h-3.5 w-3.5" /> Exit
        </button>
      </div>

      {target &&
        (minimized ? (
          <button
            onClick={() => setMinimized(false)}
            className="absolute bottom-2 right-2 z-1000 flex items-center gap-2 rounded-full border border-primary/40 bg-black/80 px-3 py-2 text-[11px] text-foreground shadow-glow backdrop-blur-xl sm:right-4 sm:bottom-4 sm:px-4 sm:text-xs"
          >
            <ChevronUp className="h-3.5 w-3.5 text-primary-glow" />
            Active Quest · {target.name}
          </button>
        ) : (
          <div
            ref={cardRef}
            className="absolute inset-x-2 bottom-2 z-1000 mx-auto w-[min(94vw,42rem)] rounded-2xl border border-primary/40 bg-black/80 p-3 shadow-glow backdrop-blur-xl sm:inset-x-4 sm:bottom-4 sm:w-full sm:max-w-xl sm:p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-primary-glow">
                  {isSimulator ? "Simulated Quest" : "Active Quest"}
                </p>
                <p className="truncate text-sm font-semibold text-foreground sm:text-base">{target.name}</p>
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  {target.distance}km away ·{" "}
                  <span className={unlocked ? "text-success" : "text-warning"}>
                    {unlocked ? "AT TARGET — Form Unlocked" : "Navigating"}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                {!unlocked ? (
                  <button
                    onClick={() => setUnlocked(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground shadow-glow sm:px-4 sm:text-xs"
                  >
                    <Navigation2 className="h-3.5 w-3.5" /> Force Unlock
                  </button>
                ) : (
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-3 py-2 text-[11px] font-semibold text-primary-foreground shadow-glow animate-pulse-glow sm:px-4 sm:text-xs"
                  >
                    <Camera className="h-3.5 w-3.5" /> Capture Mission
                  </button>
                )}
                <button
                  onClick={() => setMinimized(true)}
                  className="rounded-full border border-border/60 p-2 text-muted-foreground hover:text-foreground"
                  title="Minimize"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}

      {showForm && target && (
        <SubmissionForm
          locationId={target.id}
          target={target.name}
          category={cat?.label ?? target.category}
          userLat={effectivePos.lat || 0}
          userLng={effectivePos.lng || 0}
          isSimulator={isSimulator}
          onClose={() => {
            setShowForm(false);
            setUnlocked(false);
          }}
        />
      )}

      {addCoords && (
        <AddLocationForm
          lat={addCoords.lat}
          lng={addCoords.lng}
          onClose={() => setAddCoords(null)}
        />
      )}
    </div>
  );
}