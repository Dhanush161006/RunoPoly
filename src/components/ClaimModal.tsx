import { Shield, AlertTriangle } from 'lucide-react';
import type { PendingClaim } from '@/types';
import { USER_COLORS } from '@/constants';

interface ClaimModalProps {
  pending: PendingClaim;
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ClaimModal({ pending, username, onConfirm, onCancel }: ClaimModalProps) {
  const isReclaim = pending.existingTerritory !== null;
  const areaKm2 = (pending.area / 1_000_000).toFixed(4);

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Shield size={20} /> {isReclaim ? 'Reclaim Territory?' : 'Claim Territory?'}
          </h2>
          <button className="modal-close" onClick={onCancel} type="button">
            ✕
          </button>
        </div>

        <div className="claim-body">
          {isReclaim && (
            <div className="claim-warning">
              <AlertTriangle size={16} />
              <span>
                This area belongs to <strong>{pending.existingTerritory!.owner}</strong>. Claiming it
                will take it from them.
              </span>
            </div>
          )}

          <div className="claim-stats">
            <div className="claim-stat">
              <span className="claim-stat-value">{pending.totalKm.toFixed(2)}</span>
              <span className="claim-stat-label">km run</span>
            </div>
            <div className="claim-stat">
              <span className="claim-stat-value">{areaKm2}</span>
              <span className="claim-stat-label">km² area</span>
            </div>
            <div className="claim-stat">
              <span
                className="claim-stat-color"
                style={{ background: USER_COLORS[pending.colorIdx] }}
              />
              <span className="claim-stat-label">your color</span>
            </div>
          </div>

          <p className="claim-username">Claiming as <strong>{username}</strong></p>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel} type="button">
            Cancel
          </button>
          <button className="btn-primary" onClick={onConfirm} type="button">
            {isReclaim ? 'Reclaim' : 'Claim'} Territory
          </button>
        </div>
      </div>
    </div>
  );
}
