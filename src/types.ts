export interface User {
  username: string;
  email: string;
  colorIdx: number;
  totalKm: number;
  runs: number;
}

export interface GpsPoint {
  lat: number;
  lng: number;
  timestamp: number;
}

export interface Territory {
  id: string;
  owner: string;
  colorIdx: number;
  coords: [number, number][];
  area: number;
  claimedAt: number;
  distance: string;
  duration: number;
}

export type HistoryType = 'run' | 'claimed' | 'reclaimed' | 'open';

export interface HistoryEntry {
  type: HistoryType;
  user: string;
  dist: string;
  duration: number;
  area?: string;
  date: number;
}

export interface PendingClaim {
  coords: [number, number][];
  area: number;
  totalKm: number;
  elapsed: number;
  existingTerritory: Territory | null;
  colorIdx: number;
}
