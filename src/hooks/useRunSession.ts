import { useState, useRef, useCallback, useEffect } from 'react';
import type { GpsPoint, Territory, PendingClaim } from '@/types';
import { USER_COLORS, MIN_GPS_POINTS } from '@/constants';
import {
  validateGPSPoint,
  isClosedLoop,
  calcTotalDistance,
  calcPolygonArea,
  checkOverlap,
} from '@/utils/geometry';

interface UseRunSessionArgs {
  username: string;
  colorIdx: number;
  territories: Territory[];
  onClaim: (pending: PendingClaim) => void;
  onRunComplete: (distKm: number, elapsed: number) => void;
}

export function useRunSession({
  username,
  colorIdx,
  territories,
  onClaim,
  onRunComplete,
}: UseRunSessionArgs) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [gpsPoints, setGpsPoints] = useState<GpsPoint[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [totalKm, setTotalKm] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pointsRef = useRef<GpsPoint[]>([]);
  const elapsedRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(() => {
      if (pausedRef.current) return;
      elapsedRef.current += 1;
      setElapsed(elapsedRef.current);
    }, 1000);
  }, []);

  const start = useCallback(() => {
    setError(null);
    setGpsPoints([]);
    setElapsed(0);
    setTotalKm(0);
    pointsRef.current = [];
    elapsedRef.current = 0;
    pausedRef.current = false;
    setIsPaused(false);
    setIsRunning(true);

    startTimer();

    if (!navigator.geolocation) {
      setError('Geolocation not supported by this browser.');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        if (pausedRef.current) return;
        const point: GpsPoint = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          timestamp: Date.now(),
        };
        const prev = pointsRef.current[pointsRef.current.length - 1];
        if (!validateGPSPoint(prev, point)) return;
        pointsRef.current.push(point);
        setGpsPoints([...pointsRef.current]);
        setTotalKm(calcTotalDistance(pointsRef.current));
      },
      (err) => {
        setError(err.message);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
  }, [startTimer]);

  const pause = useCallback(() => {
    pausedRef.current = true;
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    pausedRef.current = false;
    setIsPaused(false);
  }, []);

  const stop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    setIsPaused(false);
    pausedRef.current = false;

    const pts = pointsRef.current;
    const distKm = calcTotalDistance(pts);
    const elapsedFinal = elapsedRef.current;

    onRunComplete(distKm, elapsedFinal);

    if (pts.length >= MIN_GPS_POINTS && isClosedLoop(pts.map((p) => [p.lat, p.lng]))) {
      const coords = pts.map((p) => [p.lat, p.lng] as [number, number]);
      const area = calcPolygonArea(coords);
      const existing = checkOverlap(coords, territories);
      onClaim({
        coords,
        area,
        totalKm: distKm,
        elapsed: elapsedFinal,
        existingTerritory: existing,
        colorIdx,
      });
    }
  }, [territories, colorIdx, onClaim, onRunComplete]);

  return {
    isRunning,
    isPaused,
    gpsPoints,
    elapsed,
    totalKm,
    error,
    start,
    pause,
    resume,
    stop,
  };
}
