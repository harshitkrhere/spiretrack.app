import React from 'react';
import { LockClosedIcon, LockOpenIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface LockIndicatorProps {
  isLocked: boolean;
  lockedAt?: string | null;
  lockedBy?: string | null;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  className?: string;
}

/**
 * LockIndicator - Displays lock status for governance-controlled items
 * Used for reports, forms, and channel overviews
 */
export const LockIndicator: React.FC<LockIndicatorProps> = ({
  isLocked,
  lockedAt,
  lockedBy,
  size = 'sm',
  showLabel = false,
  className,
}) => {
  const iconSize = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';
  
  if (!isLocked) {
    return showLabel ? (
      <span className={cn('inline-flex items-center gap-1.5 text-slate-400', className)}>
        <LockOpenIcon className={iconSize} />
        <span className="text-xs">Editable</span>
      </span>
    ) : null;
  }

  const formattedDate = lockedAt 
    ? new Date(lockedAt).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      })
    : null;

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-50 border border-amber-200',
        className
      )}
      title={`Locked for integrity${formattedDate ? ` on ${formattedDate}` : ''}${lockedBy ? ` by admin` : ''}`}
    >
      <LockClosedIcon className={cn(iconSize, 'text-amber-600')} />
      {showLabel && (
        <span className="text-xs font-medium text-amber-700">Locked</span>
      )}
    </div>
  );
};

export default LockIndicator;
