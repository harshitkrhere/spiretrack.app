import React from 'react';
import { Avatar } from '../ui/Avatar';

type Severity = 'low' | 'medium' | 'high';
type EntityType = 'review' | 'task' | 'decision' | 'announcement';

interface EscalationRecord {
  id: string;
  team_id: string;
  entity_type: EntityType;
  entity_id: string;
  owner_id: string | null;
  owner?: {
    id: string;
    full_name: string | null;
    email: string;
    avatar_url: string | null;
  };
  severity: Severity;
  trigger_type: string;
  trigger_date: string;
  resolved_at: string | null;
  resolved_by: string | null;
  notes: string | null;
  created_at: string;
}

interface EscalationItemProps {
  escalation: EscalationRecord;
  onResolve?: (id: string) => void;
  className?: string;
}

const SEVERITY_CONFIG: Record<Severity, {
  label: string;
  bgColor: string;
  textColor: string;
  dotColor: string;
}> = {
  low: {
    label: 'Low',
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-700',
    dotColor: 'bg-slate-400',
  },
  medium: {
    label: 'Medium',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    dotColor: 'bg-amber-500',
  },
  high: {
    label: 'High',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    dotColor: 'bg-red-500',
  },
};

const ENTITY_TYPE_LABELS: Record<EntityType, string> = {
  review: 'Weekly Review',
  task: 'Task',
  decision: 'Decision',
  announcement: 'Announcement',
};

const TRIGGER_TYPE_LABELS: Record<string, string> = {
  missed_deadline: 'Missed deadline',
  unacknowledged: 'Not acknowledged',
  overdue_task: 'Overdue task',
  repeated_delay: 'Repeated delays',
};

/**
 * EscalationItem - Single escalation card with professional, audit-style design
 */
export const EscalationItem: React.FC<EscalationItemProps> = ({
  escalation,
  onResolve,
  className = '',
}) => {
  const severity = SEVERITY_CONFIG[escalation.severity];
  const entityLabel = ENTITY_TYPE_LABELS[escalation.entity_type] || escalation.entity_type;
  const triggerLabel = TRIGGER_TYPE_LABELS[escalation.trigger_type] || escalation.trigger_type;
  const isResolved = !!escalation.resolved_at;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div
      className={`
        border rounded-lg p-4 
        ${isResolved ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200'}
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-2">
            {/* Severity badge */}
            <span
              className={`
                inline-flex items-center px-2 py-0.5 text-xs font-medium rounded
                ${severity.bgColor} ${severity.textColor}
              `}
            >
              <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${severity.dotColor}`} />
              {severity.label}
            </span>

            {/* Entity type */}
            <span className="text-xs text-slate-500">{entityLabel}</span>

            {/* Resolved badge */}
            {isResolved && (
              <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 rounded">
                Resolved
              </span>
            )}
          </div>

          {/* Trigger description */}
          <p className="text-sm font-medium text-slate-900 mb-1">{triggerLabel}</p>

          {/* Timestamp */}
          <p className="text-xs text-slate-500">
            Triggered: {formatDate(escalation.trigger_date)}
            {isResolved && escalation.resolved_at && (
              <span className="ml-2">
                Resolved: {formatDate(escalation.resolved_at)}
              </span>
            )}
          </p>

          {/* Notes if present */}
          {escalation.notes && (
            <p className="mt-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded">
              {escalation.notes}
            </p>
          )}
        </div>

        {/* Right: Owner */}
        <div className="flex flex-col items-end gap-2">
          {escalation.owner && (
            <div className="flex items-center gap-2">
              <Avatar
                src={escalation.owner.avatar_url}
                name={escalation.owner.full_name || escalation.owner.email}
                size="sm"
              />
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700">
                  {escalation.owner.full_name || escalation.owner.email.split('@')[0]}
                </p>
                <p className="text-xs text-slate-500">Owner</p>
              </div>
            </div>
          )}

          {/* Resolve button (only if not resolved and handler provided) */}
          {!isResolved && onResolve && (
            <button
              onClick={() => onResolve(escalation.id)}
              className="text-xs text-slate-600 hover:text-slate-900 underline"
            >
              Mark resolved
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EscalationItem;
export type { EscalationRecord, Severity, EntityType };
