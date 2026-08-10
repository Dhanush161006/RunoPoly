import { useState, useCallback, useEffect } from 'react';
import { Topbar } from '@/components/Topbar';
import { MapView } from '@/components/MapView';
import { RunPanel } from '@/components/RunPanel';
import { HistoryPanel } from '@/components/HistoryPanel';
import { LeaderboardModal } from '@/components/LeaderboardModal';
import { ClaimModal } from '@/components/ClaimModal';
import { ToastContainer } from '@/components/ToastContainer';
import { useToast } from '@/hooks/useToast';
import { useRunSession } from '@/hooks/useRunSession';
import { api } from '@/api';
import { DEFAULT_MAP_CENTER } from '@/constants';
import type { User, Territory, HistoryEntry, PendingClaim } from '@/types';

interface MainAppProps {
  user: User;
  onLogout: () => void;
  onUserUpdate: (user: User) => void;
}

export function MainApp({ user, onLogout, onUserUpdate }: MainAppProps) {
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [pendingClaim, setPendingClaim] = useState<PendingClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const { toasts, showToast } = useToast();

  useEffect(() => {
    Promise.all([api.getTerritories(), api.getHistory()])
      .then(([ts, hs]) => {
        setTerritories(ts);
        setHistory(hs);
      })
      .catch(() => showToast('Failed to load data from server', 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const handleClaim = useCallback((pending: PendingClaim) => {
    setPendingClaim(pending);
  }, []);

  const handleRunComplete = useCallback(
    async (distKm: number, elapsed: number) => {
      try {
        const updatedUser = await api.updateStats(distKm);
        onUserUpdate(updatedUser);
        const entry = await api.addHistory({
          type: 'run',
          dist: `${distKm.toFixed(2)} km`,
          duration: elapsed,
        });
        setHistory((prev) => [entry, ...prev]);
        showToast(`Run saved: ${distKm.toFixed(2)} km`, 'success');
      } catch {
        showToast('Failed to save run', 'error');
      }
    },
    [onUserUpdate, showToast]
  );

  const session = useRunSession({
    username: user.username,
    colorIdx: user.colorIdx,
    territories,
    onClaim: handleClaim,
    onRunComplete: handleRunComplete,
  });

  const confirmClaim = async () => {
    if (!pendingClaim) return;
    const isReclaim = pendingClaim.existingTerritory !== null;
    try {
      const { territory, reclaimed } = await api.claimTerritory({
        coords: pendingClaim.coords,
        area: pendingClaim.area,
        totalKm: pendingClaim.totalKm,
        elapsed: pendingClaim.elapsed,
        colorIdx: user.colorIdx,
        existingId: pendingClaim.existingTerritory?.id,
      });

      setTerritories((prev) => {
        if (reclaimed) {
          return prev.map((t) => (t.id === territory.id ? territory : t));
        }
        return [territory, ...prev];
      });

      showToast(
        reclaimed
          ? `Reclaimed territory from ${pendingClaim.existingTerritory!.owner}!`
          : 'New territory claimed!',
        'success'
      );

      const entry = await api.addHistory({
        type: reclaimed ? 'reclaimed' : 'claimed',
        dist: `${pendingClaim.totalKm.toFixed(2)} km`,
        duration: pendingClaim.elapsed,
        area: `${(pendingClaim.area / 1_000_000).toFixed(4)} km²`,
      });
      setHistory((prev) => [entry, ...prev]);
    } catch {
      showToast('Failed to claim territory', 'error');
    }
    setPendingClaim(null);
  };

  if (loading) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <p className="auth-tagline">Loading map data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Topbar
        user={user}
        onLogout={onLogout}
        onShowLeaderboard={() => setShowLeaderboard(true)}
      />

      <div className="app-body">
        <aside className="app-sidebar">
          <RunPanel
            isRunning={session.isRunning}
            isPaused={session.isPaused}
            elapsed={session.elapsed}
            totalKm={session.totalKm}
            error={session.error}
            onStart={session.start}
            onPause={session.pause}
            onResume={session.resume}
            onStop={session.stop}
          />
          <HistoryPanel history={history} />
        </aside>

        <main className="app-main">
          <MapView
            territories={territories}
            gpsPoints={session.gpsPoints}
            isRunning={session.isRunning}
            mapCenter={DEFAULT_MAP_CENTER}
          />
        </main>
      </div>

      {showLeaderboard && <LeaderboardModal onClose={() => setShowLeaderboard(false)} />}
      {pendingClaim && (
        <ClaimModal
          pending={pendingClaim}
          username={user.username}
          onConfirm={confirmClaim}
          onCancel={() => setPendingClaim(null)}
        />
      )}
      <ToastContainer toasts={toasts} />
    </div>
  );
}
