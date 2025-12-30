import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface AcknowledgementButtonProps {
  entityType: 'announcement' | 'decision' | 'report';
  entityId: string;
  teamId: string;
  acknowledgedAt?: string | null;
  onAcknowledge?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * AcknowledgementButton - Explicit sign-off for critical content
 * Once acknowledged, the action is immutable and timestamped
 */
export const AcknowledgementButton: React.FC<AcknowledgementButtonProps> = ({
  entityType,
  entityId,
  teamId,
  acknowledgedAt,
  onAcknowledge,
  disabled = false,
  className = '',
}) => {
  const [loading, setLoading] = useState(false);
  const [acknowledged, setAcknowledged] = useState(!!acknowledgedAt);
  const [timestamp, setTimestamp] = useState<string | null>(acknowledgedAt || null);

  const handleAcknowledge = async () => {
    if (acknowledged || loading || disabled) return;

    setLoading(true);
    try {
      const { error } = await supabase.rpc('acknowledge_entity', {
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_team_id: teamId,
      });

      if (error) throw error;

      const now = new Date().toISOString();
      setAcknowledged(true);
      setTimestamp(now);
      onAcknowledge?.();
    } catch (err) {
      console.error('Error acknowledging entity:', err);
    } finally {
      setLoading(false);
    }
  };

  // Format timestamp for display
  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (acknowledged && timestamp) {
    return (
      <div className={`inline-flex items-center gap-2 ${className}`}>
        <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
          <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Acknowledged
        </span>
        <span className="text-xs text-slate-500">
          {formatTimestamp(timestamp)}
        </span>
      </div>
    );
  }

  return (
    <button
      onClick={handleAcknowledge}
      disabled={loading || disabled}
      className={`
        inline-flex items-center px-4 py-2 text-sm font-medium
        bg-slate-900 text-white rounded-md
        hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-colors
        ${className}
      `}
    >
      {loading ? (
        <>
          <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Processing...
        </>
      ) : (
        <>
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          I Acknowledge
        </>
      )}
    </button>
  );
};

/**
 * AcknowledgementStats - Admin view of acknowledgement progress
 */
export const AcknowledgementStats: React.FC<{
  totalMembers: number;
  acknowledgedCount: number;
  className?: string;
}> = ({ totalMembers, acknowledgedCount, className = '' }) => {
  const percentage = totalMembers > 0 ? Math.round((acknowledgedCount / totalMembers) * 100) : 0;
  const pending = totalMembers - acknowledgedCount;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Progress bar */}
      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Stats text */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-emerald-600 font-medium">{acknowledgedCount} acknowledged</span>
        <span className="text-slate-400">|</span>
        <span className="text-slate-500">{pending} pending</span>
      </div>
    </div>
  );
};

/**
 * RequiresAcknowledgementBadge - Indicator that content requires sign-off
 */
export const RequiresAcknowledgementBadge: React.FC<{
  className?: string;
}> = ({ className = '' }) => {
  return (
    <span
      className={`
        inline-flex items-center px-2 py-0.5
        text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 rounded
        ${className}
      `}
    >
      <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      Requires Acknowledgement
    </span>
  );
};

export default AcknowledgementButton;
