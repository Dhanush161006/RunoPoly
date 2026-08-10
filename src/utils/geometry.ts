import type { GpsPoint, Territory } from '@/types';
import { MAX_GPS_SPEED_MS, CLOSED_LOOP_THRESHOLD_M } from '@/constants';

export function offsetPoly(
  base: [number, number],
  dlat: number,
  dlng: number,
  scale: number
): [number, number][] {
  const pts = 8;
  const coords: [number, number][] = [];
  for (let i = 0; i < pts; i++) {
    const angle = (i / pts) * 2 * Math.PI;
    coords.push([
      base[0] + dlat + Math.sin(angle) * scale * 0.002,
      base[1] + dlng + Math.cos(angle) * scale * 0.002,
    ]);
  }
  return coords;
}

// Shoelace formula → area in m²
export function calcPolygonArea(coords: [number, number][]): number {
  let area = 0;
  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    const xi =
      coords[i][1] * (Math.PI / 180) * 6371000 * Math.cos((coords[i][0] * Math.PI) / 180);
    const yi = coords[i][0] * (Math.PI / 180) * 6371000;
    const xj =
      coords[j][1] * (Math.PI / 180) * 6371000 * Math.cos((coords[j][0] * Math.PI) / 180);
    const yj = coords[j][0] * (Math.PI / 180) * 6371000;
    area += xi * yj - xj * yi;
  }
  return Math.abs(area / 2);
}

// Haversine distance in km
export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Check if point is inside polygon (ray casting)
export function pointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [px, py] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi > py !== yj > py && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Check if closed loop: start & end within threshold metres
export function isClosedLoop(coords: [number, number][], thresholdM = CLOSED_LOOP_THRESHOLD_M): boolean {
  if (coords.length < 4) return false;
  const first = coords[0];
  const last = coords[coords.length - 1];
  const dist = haversine(first[0], first[1], last[0], last[1]) * 1000;
  return dist <= thresholdM;
}

// Validate GPS point (reject teleportation / unrealistic speeds)
export function validateGPSPoint(prev: GpsPoint | undefined, next: GpsPoint, maxSpeedMs = MAX_GPS_SPEED_MS): boolean {
  if (!prev) return true;
  const dist = haversine(prev.lat, prev.lng, next.lat, next.lng) * 1000;
  const dt = (next.timestamp - prev.timestamp) / 1000;
  if (dt <= 0) return false;
  return dist / dt <= maxSpeedMs;
}

// Check territory overlap with existing territories
export function checkOverlap(newCoords: [number, number][], territories: Territory[]): Territory | null {
  const centroid: [number, number] = [
    newCoords.reduce((s, c) => s + c[0], 0) / newCoords.length,
    newCoords.reduce((s, c) => s + c[1], 0) / newCoords.length,
  ];
  for (const t of territories) {
    if (pointInPolygon(centroid, t.coords)) return t;
  }
  return null;
}

export function calcTotalDistance(points: GpsPoint[] | [number, number][]): number {
  let totalKm = 0;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    if ('lat' in prev) {
      totalKm += haversine(prev.lat, prev.lng, (curr as GpsPoint).lat, (curr as GpsPoint).lng);
    } else {
      const p = prev as [number, number];
      const c = curr as [number, number];
      totalKm += haversine(p[0], p[1], c[0], c[1]);
    }
  }
  return totalKm;
}
