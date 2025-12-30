import React from 'react';

type SubmissionStatus = 'on_time' | 'late' | 'missed' | 'pending';

interface DeadlineStatusBadgeProps {
  status: SubmissionStatus;
  deadline?: Date | string;
  showCountdown?: boolean;
  className?: string;
}

const STATUS_CONFIG: Record<SubmissionStatus, {
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
}> = {
  on_time: {
    label: 'On time',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
  },
  late: {
    label: 'Late',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
  },
  missed: {
    label: 'Missed',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    borderColor: 'border-red-200',
  },
  pending: {
    label: 'Pending',
    bgColor: 'bg-slate-50',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200',
  },
};

/**
 * Formats the time remaining until a deadline in a human-readable way
 */
const formatTimeRemaining = (deadline: Date): string => {
  const now = new Date();
  const diff = deadline.getTime() - now.getTime();
  
  if (diff <= 0) return 'Overdue';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return `${days}d ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
};

/**
 * DeadlineStatusBadge - Displays submission status with optional countdown
 * Enterprise-grade, neutral design with clear status indicators
 */
export const DeadlineStatusBadge: React.FC<DeadlineStatusBadgeProps> = ({
  status,
  deadline,
  showCountdown = false,
  className = '',
}) => {
  const config = STATUS_CONFIG[status];
  const deadlineDate = deadline ? new Date(deadline) : null;
  const isOverdue = deadlineDate && deadlineDate.getTime() < Date.now();
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      {/* Status Badge */}
      <span
        className={`
          inline-flex items-center px-2.5 py-1 
          text-xs font-medium rounded-md border
          ${config.bgColor} ${config.textColor} ${config.borderColor}
        `}
      >
        {/* Status indicator dot */}
        <span
          className={`
            w-1.5 h-1.5 rounded-full mr-1.5
            ${status === 'on_time' ? 'bg-emerald-500' : ''}
            ${status === 'late' ? 'bg-amber-500' : ''}
            ${status === 'missed' ? 'bg-red-500' : ''}
            ${status === 'pending' ? 'bg-slate-400' : ''}
          `}
        />
        {config.label}
      </span>
      
      {/* Countdown */}
      {showCountdown && deadlineDate && !isOverdue && status === 'pending' && (
        <span className="text-xs text-slate-500">
          {formatTimeRemaining(deadlineDate)}
        </span>
      )}
      
      {/* Overdue indicator */}
      {showCountdown && isOverdue && status !== 'missed' && (
        <span className="text-xs text-red-600 font-medium">
          Overdue
        </span>
      )}
    </div>
  );
};

/**
 * DeadlineIndicator - Compact deadline display for forms
 */
export const DeadlineIndicator: React.FC<{
  deadline: Date | string;
  isLocked?: boolean;
}> = ({ deadline, isLocked }) => {
  const deadlineDate = new Date(deadline);
  const isOverdue = deadlineDate.getTime() < Date.now();
  
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg">
      <svg
        className={`w-4 h-4 ${isOverdue ? 'text-red-500' : 'text-slate-400'}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      
      <div className="flex-1">
        <span className="text-xs text-slate-500">Deadline:</span>
        <span className={`ml-1 text-sm font-medium ${isOverdue ? 'text-red-600' : 'text-slate-700'}`}>
          {deadlineDate.toLocaleDateString(undefined, {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </div>
      
      {isLocked && (
        <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-slate-200 text-slate-600 rounded">
          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Locked
        </span>
      )}
    </div>
  );
};

export default DeadlineStatusBadge;
