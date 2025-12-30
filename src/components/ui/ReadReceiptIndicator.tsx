import React from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { cn } from '../../lib/utils';

interface ReadReceiptIndicatorProps {
  readCount: number;
  totalMembers: number;
  className?: string;
  showPercentage?: boolean;
}

/**
 * ReadReceiptIndicator - Shows "Viewed by X/Y members" for admin visibility
 * Non-intrusive, professional display of engagement metrics
 */
export const ReadReceiptIndicator: React.FC<ReadReceiptIndicatorProps> = ({
  readCount,
  totalMembers,
  className,
  showPercentage = true,
}) => {
  const percentage = totalMembers > 0 
    ? Math.round((readCount / totalMembers) * 100) 
    : 0;

  const getStatusColor = () => {
    if (percentage >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (percentage >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-slate-500 bg-slate-50 border-slate-200';
  };

  return (
    <div 
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium',
        getStatusColor(),
        className
      )}
      title={`${readCount} of ${totalMembers} members have viewed this`}
    >
      <EyeIcon className="w-3.5 h-3.5" />
      <span>
        {readCount}/{totalMembers}
        {showPercentage && <span className="ml-1 opacity-70">({percentage}%)</span>}
      </span>
    </div>
  );
};

export default ReadReceiptIndicator;
