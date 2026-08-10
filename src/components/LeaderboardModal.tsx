import { useState, useEffect } from 'react';
import { Trophy, Medal, Footprints } from 'lucide-react';
import type { User } from '@/types';
import { USER_COLORS } from '@/constants';
import { api } from '@/api';

interface LeaderboardModalProps {
  onClose: () => void;
}

export function LeaderboardModal({ onClose }: LeaderboardModalProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getLeaderboard()
      .then(setUsers)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Trophy size={20} /> Leaderboard
          </h2>
          <button className="modal-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>
        {loading ? (
          <p className="history-empty">Loading…</p>
        ) : (
          <ul className="leaderboard-list">
            {users.map((u, i) => (
              <li key={u.username} className="leaderboard-row">
                <span className="leaderboard-rank">
                  {i === 0 ? <Medal size={18} className="gold" /> : i + 1}
                </span>
                <span
                  className="leaderboard-avatar"
                  style={{ background: USER_COLORS[u.colorIdx] }}
                >
                  {u.username[0].toUpperCase()}
                </span>
                <span className="leaderboard-name">{u.username}</span>
                <span className="leaderboard-stats">
                  <Footprints size={13} /> {u.totalKm.toFixed(1)} km · {u.runs} runs
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
