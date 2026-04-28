import { useState, useEffect, useMemo } from "react";

const METERS_PER_DEGREE_LAT = 111320;
const STEP_SIZE_METERS = 5;

export function useRobotPhysics(
  initialLat: number | null,
  initialLng: number | null,
  isEnabled: boolean
) {
  const [anchorPos, setAnchorPos] = useState<{ lat: number; lng: number } | null>(null);
  const [offsetMeters, setOffsetMeters] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    if (isEnabled && initialLat && initialLng && !anchorPos) {
      setAnchorPos({ lat: initialLat, lng: initialLng });
    } else if (!isEnabled) {
      setAnchorPos(null);
      setOffsetMeters({ x: 0, y: 0 });
    }
  }, [isEnabled, initialLat, initialLng]);

  useEffect(() => {
    if (!isEnabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setOffsetMeters((prev) => {
        const next = { ...prev };
        if (key === "w" || key === "arrowup") next.y += STEP_SIZE_METERS;
        if (key === "s" || key === "arrowdown") next.y -= STEP_SIZE_METERS;
        if (key === "a" || key === "arrowleft") next.x -= STEP_SIZE_METERS;
        if (key === "d" || key === "arrowright") next.x += STEP_SIZE_METERS;
        return next;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEnabled]);

  const effectivePos = useMemo(() => {
    if (!isEnabled || !anchorPos) {
      return { lat: initialLat, lng: initialLng };
    }

    const latRad = (anchorPos.lat * Math.PI) / 180;
    const metersPerDegreeLng = METERS_PER_DEGREE_LAT * Math.cos(latRad);

    return {
      lat: anchorPos.lat + offsetMeters.y / METERS_PER_DEGREE_LAT,
      lng: anchorPos.lng + offsetMeters.x / metersPerDegreeLng,
    };
  }, [isEnabled, anchorPos, offsetMeters, initialLat, initialLng]);

  return effectivePos;
}
