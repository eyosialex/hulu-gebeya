import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import gsap from "gsap";
import { useNavigate } from "@tanstack/react-router";
import { useDashboard } from "./DashboardContext";
import { Navigation2, MapPin, Camera, ChevronDown, ChevronUp, X, LocateFixed } from "lucide-react";
import { categories } from "./AppSidebar";
import { SubmissionForm } from "./SubmissionForm";

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

const carIcon = new L.DivIcon({
  className: "smartmap-car",
  html: `
    <div style="position:relative;width:44px;height:44px;">
      <div style="position:absolute;inset:0;border-radius:9999px;
        background:radial-gradient(circle, rgba(99,160,255,.5) 0%, rgba(99,160,255,0) 70%);
        animation:pulse 1.6s ease-out infinite;"></div>
      <div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);
        font-size:26px;line-height:1;filter:drop-shadow(0 0 6px rgba(99,160,255,.9));">
        🚗
      </div>
    </div>
    <style>
      @keyframes pulse {
        0% { transform: scale(0.6); opacity: 1; }
        100% { transform: scale(1.6); opacity: 0; }
      }
    </style>
  `,
  iconSize: [44, 44],
  iconAnchor: [22, 22],
});

const samplePoints: NearbyPlace[] = [
  {
    lat: 6.5244,
    lng: 3.3792,
    name: "City Central Taxi Terminal",
    category: "transport",
    distance: 250,
    status: "Navigating",
    note: "High pickup traffic · best for transit missions",
  },
  {
    lat: 6.5231,
    lng: 3.3811,
    name: "Marina Ride Share Point",
    category: "transport",
    distance: 310,
    status: "Busy",
    note: "Quick pickup lane · 3-minute wait",
  },
  {
    lat: 6.5274,
    lng: 3.3851,
    name: "Central Bus Link",
    category: "transport",
    distance: 430,
    status: "Open now",
    note: "Major transfer stop · frequent departures",
  },
  {
    lat: 6.5288,
    lng: 3.3804,
    name: "Harbor Shuttle Bay",
    category: "transport",
    distance: 520,
    status: "Open now",
    note: "Easy route to the waterfront terminals",
  },
  {
    lat: 6.5283,
    lng: 3.3831,
    name: "Marina Hidden Café",
    category: "food",
    distance: 340,
    status: "Open now",
    note: "Popular breakfast stop · 4.8 rating",
  },
  {
    lat: 6.5291,
    lng: 3.3818,
    name: "Lighthouse Brunch Spot",
    category: "food",
    distance: 460,
    status: "Open now",
    note: "Weekend crowd favorite · fast service",
  },
  {
    lat: 6.5250,
    lng: 3.3856,
    name: "Palm Street Juice Bar",
    category: "food",
    distance: 540,
    status: "Quiet",
    note: "Cold drinks · low queue at the moment",
  },
  {
    lat: 6.5272,
    lng: 3.3862,
    name: "Luna Noodle Stand",
    category: "food",
    distance: 590,
    status: "Open now",
    note: "Quick bites · high review score",
  },
  {
    lat: 6.5201,
    lng: 3.3755,
    name: "Heritage Mural Wall",
    category: "art",
    distance: 410,
    status: "Quiet",
    note: "Great photo spot · low crowd now",
  },
  {
    lat: 6.5215,
    lng: 3.3778,
    name: "District 7 Art Lane",
    category: "art",
    distance: 500,
    status: "Trending",
    note: "Street artists rotating today",
  },
  {
    lat: 6.5189,
    lng: 3.3805,
    name: "Neon Wall Gallery",
    category: "art",
    distance: 610,
    status: "Open now",
    note: "Good for high-value photo missions",
  },
  {
    lat: 6.5222,
    lng: 3.3744,
    name: "Color Step Studio",
    category: "art",
    distance: 680,
    status: "Trending",
    note: "Fresh mural drop · active crowd",
  },
  {
    lat: 6.5260,
    lng: 3.3880,
    name: "Old Library Quiet Zone",
    category: "study",
    distance: 620,
    status: "Open now",
    note: "Free wifi · best for study missions",
  },
  {
    lat: 6.5299,
    lng: 3.3895,
    name: "Campus Read Room",
    category: "study",
    distance: 710,
    status: "Open now",
    note: "Low noise · charger stations available",
  },
  {
    lat: 6.5228,
    lng: 3.3871,
    name: "Coastline Research Desk",
    category: "study",
    distance: 820,
    status: "Quiet",
    note: "Bright tables · ideal for longer sessions",
  },
  {
    lat: 6.5239,
    lng: 3.3903,
    name: "Study Lounge Annex",
    category: "study",
    distance: 860,
    status: "Open now",
    note: "Power outlets · low distraction",
  },
  {
    lat: 6.5304,
    lng: 3.3764,
    name: "Heritage Chapel",
    category: "culture",
    distance: 690,
    status: "Open now",
    note: "Historic site · guided entry slots today",
  },
  {
    lat: 6.5320,
    lng: 3.3738,
    name: "Old Fort Museum",
    category: "culture",
    distance: 740,
    status: "Open now",
    note: "Heritage walkthroughs every hour",
  },
  {
    lat: 6.5289,
    lng: 3.3749,
    name: "Community Heritage Hall",
    category: "culture",
    distance: 780,
    status: "Busy",
    note: "Local stories exhibit · good mission score",
  },
  {
    lat: 6.5315,
    lng: 3.3791,
    name: "City Shrine Steps",
    category: "culture",
    distance: 810,
    status: "Quiet",
    note: "Good for faith missions and photos",
  },
  {
    lat: 6.5197,
    lng: 3.3826,
    name: "Hidden Courtyard Archive",
    category: "hidden",
    distance: 560,
    status: "Hard to spot",
    note: "Secret lane · unlocks a rare badge",
  },
  {
    lat: 6.5179,
    lng: 3.3819,
    name: "Back Alley Record Shop",
    category: "hidden",
    distance: 630,
    status: "Hard to spot",
    note: "Locals-only place · rare quest entry",
  },
  {
    lat: 6.5218,
    lng: 3.3798,
    name: "Palm Court Secret Cafe",
    category: "hidden",
    distance: 700,
    status: "Open now",
    note: "Hidden menu · badge-worthy visit",
  },
  {
    lat: 6.5235,
    lng: 3.3788,
    name: "Whisper Lane Lookout",
    category: "hidden",
    distance: 760,
    status: "Quiet",
    note: "Hard-to-find view point · photo bonus",
  },
  {
    lat: 6.5279,
    lng: 3.3768,
    name: "Wellness Corner Clinic",
    category: "health",
    distance: 760,
    status: "Open now",
    note: "Fast check-in · wellness missions nearby",
  },
  {
    lat: 6.5293,
    lng: 3.3782,
    name: "Pulse Care Center",
    category: "health",
    distance: 820,
    status: "Open now",
    note: "Health check missions are active here",
  },
  {
    lat: 6.5269,
    lng: 3.3739,
    name: "Greenline Pharmacy",
    category: "health",
    distance: 880,
    status: "Busy",
    note: "Quick service · useful daily stop",
  },
  {
    lat: 6.5254,
    lng: 3.3770,
    name: "Wellness Trail Studio",
    category: "health",
    distance: 930,
    status: "Quiet",
    note: "Low noise · active wellness challenge",
  },
  {
    lat: 6.5258,
    lng: 3.3749,
    name: "Tech Fix Hub",
    category: "services",
    distance: 880,
    status: "Open now",
    note: "Local services spot · good for errands",
  },
  {
    lat: 6.5248,
    lng: 3.3734,
    name: "Street Repair Booth",
    category: "services",
    distance: 940,
    status: "Open now",
    note: "Fast turnaround · everyday errands",
  },
  {
    lat: 6.5278,
    lng: 3.3726,
    name: "Parcel Drop Point",
    category: "services",
    distance: 990,
    status: "Busy",
    note: "Pickup and delivery hub nearby",
  },
  {
    lat: 6.5232,
    lng: 3.3751,
    name: "Quick Fix Workshop",
    category: "services",
    distance: 1040,
    status: "Open now",
    note: "Best for urgent small repairs",
  },
  {
    lat: 6.5311,
    lng: 3.3844,
    name: "Game Arcade Dock",
    category: "game",
    distance: 930,
    status: "Open now",
    note: "Bonus challenge zone · active players inside",
  },
  {
    lat: 6.5297,
    lng: 3.3867,
    name: "Pixel Arena",
    category: "game",
    distance: 980,
    status: "Busy",
    note: "Daily challenge boards are live",
  },
  {
    lat: 6.5323,
    lng: 3.3829,
    name: "Quest Pocket Hub",
    category: "game",
    distance: 1060,
    status: "Open now",
    note: "Mini-game missions and streak rewards",
  },
  {
    lat: 6.5271,
    lng: 3.3879,
    name: "Turbo Play Corner",
    category: "game",
    distance: 1110,
    status: "Quiet",
    note: "Good for quick score runs",
  },
];

function FollowPlayer({ position, follow }: { position: [number, number] | null; follow: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (follow && position) map.setView(position, map.getZoom() < 15 ? 16 : map.getZoom(), { animate: true });
  }, [position, follow, map]);

  return null;
}

export function MapView() {
  const navigate = useNavigate();
  const { activeCategory } = useDashboard();
  const cat = categories.find((c) => c.id === activeCategory);
  const [target] = useState<{ name: string; distance: number } | null>({
    name: samplePoints[0].name,
    distance: 250,
  });
  const [unlocked, setUnlocked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [resultsMinimized, setResultsMinimized] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [follow, setFollow] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);
  const resultsScrollRef = useRef<HTMLDivElement>(null);
  const nearbyPlaces = activeCategory ? samplePoints.filter((place) => place.category === activeCategory) : samplePoints;
  const nearbyLabel = cat?.label ?? "All Categories";

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

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      let t = 0;
      const id = setInterval(() => {
        t += 0.0002;
        setPosition([6.5244 + Math.sin(t * 50) * 0.0015, 3.3792 + Math.cos(t * 50) * 0.0015]);
      }, 1000);
      return () => clearInterval(id);
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => setPosition([pos.coords.latitude, pos.coords.longitude]),
      () => {
        let t = 0;
        const id = setInterval(() => {
          t += 0.0002;
          setPosition([6.5244 + Math.sin(t * 50) * 0.0015, 3.3792 + Math.cos(t * 50) * 0.0015]);
        }, 1000);
        return () => clearInterval(id);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="relative h-[calc(100vh-56px)] w-full lg:h-screen">
      <MapContainer
        center={[6.5244, 3.3792]}
        zoom={14}
        scrollWheelZoom
        className="h-full w-full"
        style={{ background: "#000" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {samplePoints.map((p) => (
          <Marker key={p.name} position={[p.lat, p.lng]} icon={createPinIcon(p.category)}>
            <Popup>{p.name}</Popup>
          </Marker>
        ))}
        {position && (
          <>
            <Marker position={position} icon={carIcon}>
              <Popup>You are here · Player Car</Popup>
            </Marker>
            <FollowPlayer position={position} follow={follow} />
          </>
        )}
      </MapContainer>

      <div className="pointer-events-none absolute left-4 top-4 z-1000 flex items-center gap-2 rounded-full border border-border/60 bg-black/70 px-3 py-2 text-[11px] text-foreground backdrop-blur sm:px-4 sm:text-xs">
        <MapPin className="h-3.5 w-3.5 text-primary-glow" />
        <span className="font-medium">{nearbyLabel}</span>
        <span className="text-muted-foreground">· {samplePoints.length} pins</span>
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
              return (
                <div key={place.name} className="rounded-xl border border-border/40 bg-surface/40 p-2.5 sm:p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-medium text-foreground sm:text-sm">{place.name}</p>
                      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{categoryLabel}</p>
                    </div>
                    <span className="text-[10px] text-primary-glow">{place.distance}m</span>
                  </div>
                  <p className="mt-2 text-[11px] text-muted-foreground sm:text-xs">{place.note}</p>
                  <div className="mt-2 text-[10px] text-muted-foreground">{place.status}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="absolute right-2 top-20 z-1000 flex max-w-[min(44vw,10rem)] flex-col gap-2 sm:right-4 sm:top-4 sm:max-w-none">
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
                  Active Quest
                </p>
                <p className="truncate text-sm font-semibold text-foreground sm:text-base">{target.name}</p>
                <p className="text-[11px] text-muted-foreground sm:text-xs">
                  {target.distance}m away ·{" "}
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
                    <Navigation2 className="h-3.5 w-3.5" /> Simulate Arrival
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

      {showForm && (
        <SubmissionForm
          target={target?.name ?? ""}
          category={cat?.label ?? "Unknown"}
          onClose={() => {
            setShowForm(false);
            setUnlocked(false);
          }}
        />
      )}
    </div>
  );
}