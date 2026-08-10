import { Footprints, LogOut, Trophy } from 'lucide-react';
import type { User } from '@/types';
import { USER_COLORS } from '@/constants';

interface TopbarProps {
  user: User;
  onLogout: () => void;
  onShowLeaderboard: () => void;
}

export function Topbar({ user, onLogout, onShowLeaderboard }: TopbarProps) {
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <Footprints size={24} strokeWidth={2.5} />
        <span>RunoPoly</span>
      </div>
      <div className="topbar-right">
        <button className="topbar-btn" onClick={onShowLeaderboard} type="button">
          <Trophy size={16} /> Leaderboard
        </button>
        <div className="topbar-user">
          <span
            className="topbar-avatar"
            style={{ background: USER_COLORS[user.colorIdx] }}
          >
            {user.username[0].toUpperCase()}
          </span>
          <span className="topbar-username">{user.username}</span>
        </div>
        <button className="topbar-btn" onClick={onLogout} type="button">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
}
