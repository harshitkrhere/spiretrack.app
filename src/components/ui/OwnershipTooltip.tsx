import React, { useState } from 'react';
import { cn } from '../../lib/utils';

interface OwnershipTooltipProps {
  owner?: {
    name: string;
    email?: string;
  };
  lastModifiedBy?: {
    name: string;
    email?: string;
  };
  lastModifiedAt?: string | null;
  createdAt?: string | null;
  children: React.ReactNode;
  className?: string;
}

/**
 * OwnershipTooltip - Hover-based metadata display for accountability
 * Shows owner, last modified by, and timestamps
 */
export const OwnershipTooltip: React.FC<OwnershipTooltipProps> = ({
  owner,
  lastModifiedBy,
  lastModifiedAt,
  createdAt,
  children,
  className,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div 
      className={cn('relative inline-block', className)}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      
      {isVisible && (owner || lastModifiedBy) && (
        <div 
          className="absolute z-50 bottom-full left-0 mb-2 p-3 bg-slate-900 text-white rounded-lg shadow-xl text-xs min-w-[200px] animate-in fade-in-0 zoom-in-95 duration-150"
        >
          {owner && (
            <div className="mb-2">
              <span className="text-slate-400 block mb-0.5">Owner</span>
              <span className="font-medium">{owner.name}</span>
              {owner.email && (
                <span className="text-slate-400 block text-[10px]">{owner.email}</span>
              )}
            </div>
          )}
          
          {lastModifiedBy && (
            <div className="mb-2">
              <span className="text-slate-400 block mb-0.5">Last modified by</span>
              <span className="font-medium">{lastModifiedBy.name}</span>
              {lastModifiedAt && (
                <span className="text-slate-400 block text-[10px]">{formatDate(lastModifiedAt)}</span>
              )}
            </div>
          )}
          
          {createdAt && (
            <div className="pt-2 border-t border-slate-700">
              <span className="text-slate-400">Created: </span>
              <span>{formatDate(createdAt)}</span>
            </div>
          )}
          
          {/* Tooltip arrow */}
          <div className="absolute -bottom-1 left-4 w-2 h-2 bg-slate-900 rotate-45" />
        </div>
      )}
    </div>
  );
};

export default OwnershipTooltip;
