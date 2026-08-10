import { History, Clock, MapPin } from 'lucide-react';
import type { HistoryEntry } from '@/types';
import { USER_COLORS } from '@/constants';
import { formatDuration } from '@/utils/format';

interface HistoryPanelProps {
  history: HistoryEntry[];
}

const TYPE_LABELS: Record<HistoryEntry['type'], string> = {
  run: 'Run',
  claimed: 'Claimed',
  reclaimed: 'Reclaimed',
  open: 'Opened',
};

export function HistoryPanel({ history }: HistoryPanelProps) {
  return (
    <div className="history-panel">
      <h3 className="panel-title">
        <History size={16} /> Activity
      </h3>
      {history.length === 0 ? (
        <p className="history-empty">No activity yet. Go for a run!</p>
      ) : (
        <ul className="history-list">
          {history.slice(0, 30).map((h, i) => (
            <li key={i} className="history-item">
              <span
                className="history-dot"
                style={{ background: USER_COLORS[0] }}
              />
              <div className="history-content">
                <span className="history-type">{TYPE_LABELS[h.type]}</span>
                <span className="history-user">{h.user}</span>
                <span className="history-dist">{h.dist}</span>
                <span className="history-time">
                  <Clock size={11} /> {formatDuration(h.duration)}
                </span>
                {h.area && (
                  <span className="history-area">
                    <MapPin size={11} /> {h.area}
                  </span>
                )}
              </div>
              <span className="history-date">
                {new Date(h.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
