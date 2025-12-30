import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { EscalationItem } from './EscalationItem';
import type { EscalationRecord, Severity, EntityType } from './EscalationItem';

interface EscalationPanelProps {
  teamId: string;
  className?: string;
}

interface Filters {
  severity: Severity | 'all';
  entityType: EntityType | 'all';
  showResolved: boolean;
}

/**
 * EscalationPanel - Admin-only view of operational escalations
 * Read-only, audit-style interface for surfacing risks
 */
export const EscalationPanel: React.FC<EscalationPanelProps> = ({
  teamId,
  className = '',
}) => {
  const [escalations, setEscalations] = useState<EscalationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    severity: 'all',
    entityType: 'all',
    showResolved: false,
  });

  // Fetch escalations
  useEffect(() => {
    const fetchEscalations = async () => {
      try {
        setLoading(true);
        
        let query = supabase
          .from('escalation_records')
          .select(`
            *,
            owner:owner_id (id, full_name, email, avatar_url)
          `)
          .eq('team_id', teamId)
          .order('created_at', { ascending: false });

        // Apply filters
        if (filters.severity !== 'all') {
          query = query.eq('severity', filters.severity);
        }
        if (filters.entityType !== 'all') {
          query = query.eq('entity_type', filters.entityType);
        }
        if (!filters.showResolved) {
          query = query.is('resolved_at', null);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;
        setEscalations(data || []);
      } catch (err) {
        console.error('Error fetching escalations:', err);
        setError('Failed to load escalations');
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchEscalations();
    }
  }, [teamId, filters]);

  // Resolve escalation
  const handleResolve = async (escalationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('escalation_records')
        .update({
          resolved_at: new Date().toISOString(),
          resolved_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq('id', escalationId);

      if (updateError) throw updateError;

      // Refresh list
      setEscalations(prev =>
        prev.map(e =>
          e.id === escalationId
            ? { ...e, resolved_at: new Date().toISOString() }
            : e
        )
      );
    } catch (err) {
      console.error('Error resolving escalation:', err);
    }
  };

  // Stats
  const stats = {
    total: escalations.length,
    high: escalations.filter(e => e.severity === 'high' && !e.resolved_at).length,
    medium: escalations.filter(e => e.severity === 'medium' && !e.resolved_at).length,
    low: escalations.filter(e => e.severity === 'low' && !e.resolved_at).length,
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Escalations</h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Operational risks requiring attention
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex items-center gap-4">
            {stats.high > 0 && (
              <span className="inline-flex items-center text-xs font-medium text-red-700">
                <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5" />
                {stats.high} High
              </span>
            )}
            {stats.medium > 0 && (
              <span className="inline-flex items-center text-xs font-medium text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 mr-1.5" />
                {stats.medium} Medium
              </span>
            )}
            {stats.low > 0 && (
              <span className="inline-flex items-center text-xs font-medium text-slate-600">
                <span className="w-2 h-2 rounded-full bg-slate-400 mr-1.5" />
                {stats.low} Low
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3 border-b border-slate-100 bg-slate-50 flex items-center gap-4">
        {/* Severity filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Severity:</label>
          <select
            value={filters.severity}
            onChange={(e) => setFilters(f => ({ ...f, severity: e.target.value as Severity | 'all' }))}
            className="text-sm border border-slate-200 rounded px-2 py-1 bg-white"
          >
            <option value="all">All</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>

        {/* Entity type filter */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Type:</label>
          <select
            value={filters.entityType}
            onChange={(e) => setFilters(f => ({ ...f, entityType: e.target.value as EntityType | 'all' }))}
            className="text-sm border border-slate-200 rounded px-2 py-1 bg-white"
          >
            <option value="all">All</option>
            <option value="review">Reviews</option>
            <option value="task">Tasks</option>
            <option value="announcement">Announcements</option>
            <option value="decision">Decisions</option>
          </select>
        </div>

        {/* Show resolved toggle */}
        <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={filters.showResolved}
            onChange={(e) => setFilters(f => ({ ...f, showResolved: e.target.checked }))}
            className="rounded border-slate-300 text-slate-600 focus:ring-slate-500"
          />
          Show resolved
        </label>
      </div>

      {/* Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        ) : escalations.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-12 h-12 mx-auto text-slate-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-slate-600">No escalations found</p>
            <p className="text-xs text-slate-400 mt-1">
              {filters.showResolved
                ? 'No escalation records match your filters'
                : 'All caught up — no pending escalations'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {escalations.map((escalation) => (
              <EscalationItem
                key={escalation.id}
                escalation={escalation}
                onResolve={handleResolve}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EscalationPanel;
