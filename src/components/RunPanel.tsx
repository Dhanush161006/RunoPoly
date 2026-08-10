import { Play, Pause, Square, MapPin, AlertCircle } from 'lucide-react';
import { formatDuration, formatPace } from '@/utils/format';

interface RunPanelProps {
  isRunning: boolean;
  isPaused: boolean;
  elapsed: number;
  totalKm: number;
  error: string | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
}

export function RunPanel({
  isRunning,
  isPaused,
  elapsed,
  totalKm,
  error,
  onStart,
  onPause,
  onResume,
  onStop,
}: RunPanelProps) {
  const pace = formatPace(elapsed, totalKm);

  return (
    <div className="run-panel">
      <h3 className="panel-title">Run Tracker</h3>

      <div className="run-stats">
        <div className="run-stat">
          <span className="run-stat-value">{formatDuration(elapsed)}</span>
          <span className="run-stat-label">Time</span>
        </div>
        <div className="run-stat">
          <span className="run-stat-value">{totalKm.toFixed(2)}</span>
          <span className="run-stat-label">km</span>
        </div>
        <div className="run-stat">
          <span className="run-stat-value">{pace}</span>
          <span className="run-stat-label">pace /km</span>
        </div>
      </div>

      {error && (
        <div className="run-error">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      <div className="run-controls">
        {!isRunning && (
          <button className="btn-run btn-start" onClick={onStart} type="button">
            <Play size={18} /> Start Run
          </button>
        )}
        {isRunning && !isPaused && (
          <button className="btn-run btn-pause" onClick={onPause} type="button">
            <Pause size={18} /> Pause
          </button>
        )}
        {isRunning && isPaused && (
          <button className="btn-run btn-resume" onClick={onResume} type="button">
            <Play size={18} /> Resume
          </button>
        )}
        {isRunning && (
          <button className="btn-run btn-stop" onClick={onStop} type="button">
            <Square size={18} /> Stop & Claim
          </button>
        )}
      </div>

      {!isRunning && (
        <p className="run-hint">
          <MapPin size={13} /> Press Start, run a loop, then press Stop & Claim to capture territory.
        </p>
      )}
    </div>
  );
}
