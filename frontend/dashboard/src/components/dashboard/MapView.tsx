import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import gsap from "gsap";
import { useDashboard } from "./DashboardContext";
import { Navigation2, MapPin, Camera, ChevronDown, ChevronUp, X, LocateFixed } from "lucide-react";
import { categories } from "./AppSidebar";
import { SubmissionForm } from "./SubmissionForm";

/* ----- pin icon (target spots) ----- */
const pinIcon = new L.DivIcon({
  className: "smartmap-pin",
  html: `<div style="
    width:28px;height:28px;border-radius:9999px;
    background:linear-gradient(135deg,#4f8bff,#9bd5ff);
    border:2px solid #000;
    box-shadow:0 0 14px rgba(99,160,255,.7);"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

/* ----- player car icon (gamified marker) ----- */
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

const samplePoints = [
  { lat: 6.5244, lng: 3.3792, name: "City Central Taxi Terminal" },
  { lat: 6.5283, lng: 3.3831, name: "Marina Hidden Café" },
  { lat: 6.5201, lng: 3.3755, name: "Heritage Mural Wall" },
  { lat: 6.5260, lng: 3.3880, name: "Old Library Quiet Zone" },
];

function FollowPlayer({ position, follow }: { position: [number, number] | null; follow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (follow && position) map.setView(position, map.getZoom() < 15 ? 16 : map.getZoom(), { animate: true });
  }, [position, follow, map]);
  return null;
}

export function MapView() {
  const { activeCategory, setView } = useDashboard();
  const cat = categories.find((c) => c.id === activeCategory);
  const [target] = useState<{ name: string; distance: number } | null>({
    name: samplePoints[0].name,
    distance: 250,
  });
  const [unlocked, setUnlocked] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [follow, setFollow] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  /* GSAP entrance for the floating quest card */
  useEffect(() => {
    if (!cardRef.current) return;
    gsap.fromTo(
      cardRef.current,
      { y: 60, opacity: 0, scale: 0.96 },
      { y: 0, opacity: 1, scale: 1, duration: 0.55, ease: "power3.out" },
    );
  }, [minimized]);

  /* live geolocation tracking → moves the player car */
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      // demo fallback: animate around Lagos so the car still moves
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
        // permission denied → simulate movement
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
          <Marker key={p.name} position={[p.lat, p.lng]} icon={pinIcon}>
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

      {/* Top overlay */}
      <div className="pointer-events-none absolute left-4 top-4 z-[1000] flex items-center gap-2 rounded-full border border-border/60 bg-black/70 px-4 py-2 text-xs text-foreground backdrop-blur">
        <MapPin className="h-3.5 w-3.5 text-primary-glow" />
        <span className="font-medium">{cat?.label ?? "All Categories"}</span>
        <span className="text-muted-foreground">· {samplePoints.length} pins</span>
      </div>

      {/* Map controls (top-right) */}
      <div className="absolute right-4 top-4 z-[1000] flex flex-col gap-2">
        <button
          onClick={() => setFollow((f) => !f)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs backdrop-blur transition ${
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
          onClick={() => setView("dashboard")}
          className="flex items-center gap-1.5 rounded-full border border-border/60 bg-black/70 px-3 py-2 text-xs text-muted-foreground backdrop-blur hover:text-foreground"
          title="Close map"
        >
          <X className="h-3.5 w-3.5" /> Exit
        </button>
      </div>

      {/* Quest card — minimizable */}
      {target &&
        (minimized ? (
          <button
            onClick={() => setMinimized(false)}
            className="absolute bottom-4 right-4 z-[1000] flex items-center gap-2 rounded-full border border-primary/40 bg-black/80 px-4 py-2 text-xs text-foreground shadow-glow backdrop-blur-xl"
          >
            <ChevronUp className="h-3.5 w-3.5 text-primary-glow" />
            Active Quest · {target.name}
          </button>
        ) : (
          <div
            ref={cardRef}
            className="absolute inset-x-4 bottom-4 z-[1000] mx-auto max-w-xl rounded-2xl border border-primary/40 bg-black/80 p-4 shadow-glow backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-primary-glow">
                  Active Quest
                </p>
                <p className="truncate text-base font-semibold text-foreground">{target.name}</p>
                <p className="text-xs text-muted-foreground">
                  {target.distance}m away ·{" "}
                  <span className={unlocked ? "text-success" : "text-warning"}>
                    {unlocked ? "AT TARGET — Form Unlocked" : "Navigating"}
                  </span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!unlocked ? (
                  <button
                    onClick={() => setUnlocked(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow"
                  >
                    <Navigation2 className="h-3.5 w-3.5" /> Simulate Arrival
                  </button>
                ) : (
                  <button
                    onClick={() => setShowForm(true)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-gradient-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-glow animate-pulse-glow"
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
