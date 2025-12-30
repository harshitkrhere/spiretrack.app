import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { ArrowLeftIcon, ArchiveBoxIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ReportHistorySelectorProps {
  teamName: string;
  selectedWeek: string;
  reportHistory: Array<{ week_start: string; created_at: string }>;
  onWeekChange: (week: string) => void;
  onGenerateNew: () => void;
  onBackToTeams: () => void;
  onArchiveReport?: (week: string) => void;
  onDeleteReport?: (week: string) => void;
  generating: boolean;
}

export const ReportHistorySelector: React.FC<ReportHistorySelectorProps> = ({
  teamName,
  selectedWeek,
  reportHistory,
  onWeekChange,
  onGenerateNew,
  onBackToTeams,
  onArchiveReport,
  onDeleteReport,
  generating
}) => {
  const [showActions, setShowActions] = useState(false);

  const handleArchive = () => {
    if (confirm(`Archive report for week of ${new Date(selectedWeek).toLocaleDateString()}? It will be hidden from history but not deleted.`)) {
      onArchiveReport?.(selectedWeek);
    }
  };

  const handleDelete = () => {
    if (confirm(`⚠️ PERMANENTLY DELETE report for week of ${new Date(selectedWeek).toLocaleDateString()}? This cannot be undone!`)) {
      onDeleteReport?.(selectedWeek);
    }
  };

  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBackToTeams}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Teams
          </Button>
          
          <div className="h-6 w-px bg-slate-300"></div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-slate-700">{teamName}</span>
            <span className="text-slate-400">•</span>
            <label className="text-sm font-medium text-slate-700">Week:</label>
            <select
              value={selectedWeek}
              onChange={(e) => onWeekChange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
            >
              {reportHistory.map((r) => (
                <option key={r.week_start} value={r.week_start}>
                  {new Date(r.week_start).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </option>
              ))}
            </select>
            
            <Button 
              size="sm" 
              onClick={onGenerateNew}
              isLoading={generating}
            >
              Generate New Report
            </Button>

            {/* Archive/Delete Actions */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                ⋮
              </button>
              
              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                  <button
                    onClick={() => {
                      handleArchive();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center"
                  >
                    <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                    Archive Report
                  </button>
                  <button
                    onClick={() => {
                      handleDelete();
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                  >
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Delete Report
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <span className="text-sm text-slate-600">
            {reportHistory.length} report{reportHistory.length !== 1 ? 's' : ''} in history
          </span>
        </div>
      </div>
    </div>
  );
};
