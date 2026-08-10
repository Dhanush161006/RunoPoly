export function formatDuration(seconds: number): string {
  const s = Math.floor(seconds);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0)
    return `${h}:${(m % 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  return `${(m % 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
}

export function formatPace(elapsedSec: number, totalKm: number): string {
  if (totalKm <= 0 || elapsedSec <= 30) return '—';
  const paceSecPerKm = elapsedSec / totalKm;
  const m = Math.floor(paceSecPerKm / 60);
  const s = Math.floor(paceSecPerKm % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}
