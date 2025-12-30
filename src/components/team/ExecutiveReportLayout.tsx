import React from 'react';
import { format } from 'date-fns';
import { 
  TrophyIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface ExecutiveReportLayoutProps {
  report: any;
  teamName: string;
  weekStart: string;
  teamId: string;
  onCreateActionPlan?: () => void;
  onAssignTasks?: () => void;
  onShareReport?: () => void;
  onDownloadPDF?: () => void;
  onRegenerate?: () => void;
}

/**
 * Dashboard-style executive report with visual gauges
 */
export const ExecutiveReportLayout: React.FC<ExecutiveReportLayoutProps> = ({
  report,
  teamName,
  weekStart,
  onDownloadPDF,
  onRegenerate,
}) => {
  const startDate = weekStart ? new Date(weekStart) : new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const metrics = [
    { label: 'Morale', value: report.morale_score || 0, color: '#22C55E', icon: '😊' },
    { label: 'Productivity', value: report.productivity_score || 0, color: '#3B82F6', icon: '📊' },
    { label: 'Stress Level', value: report.stress_score || 0, color: '#EAB308', icon: '😰' },
    { label: 'Risk Factor', value: report.risk_score || 0, color: '#EF4444', icon: '⚠️' },
    { label: 'Alignment', value: report.alignment_score || 0, color: '#A855F7', icon: '🎯' },
  ];

  const achievementIcons = [TrophyIcon, ChartBarIcon, UserGroupIcon];

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header */}
        <header className="mb-8">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">
            Internal Document • Confidential
          </p>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Weekly Performance Report
              </h1>
              <p className="text-slate-600 mt-1">
                Period: {format(startDate, 'MMM d, yyyy')} – {format(endDate, 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex gap-3">
              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-sm"
                >
                  Generate New
                </button>
              )}
              {onDownloadPDF && (
                <button
                  onClick={onDownloadPDF}
                  className="px-4 py-2 text-xs uppercase tracking-wider font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-sm"
                >
                  Export Data
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Gauge Cards */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
          <div className="grid grid-cols-5 gap-6">
            {metrics.map((metric) => (
              <GaugeCard 
                key={metric.label}
                label={metric.label}
                value={metric.value}
                color={metric.color}
                icon={metric.icon}
              />
            ))}
          </div>
        </div>

        {/* Three Column Cards */}
        <div className="grid grid-cols-3 gap-6 mb-6">
          
          {/* Executive Summary */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Executive Summary
            </h3>
            <p className="text-slate-600 leading-relaxed text-sm">
              {report.summary_text || 'No executive summary available for this period.'}
            </p>
          </div>

          {/* Achievements & Wins */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Achievements & Wins
            </h3>
            <div className="space-y-4">
              {report.collective_wins?.length > 0 ? (
                report.collective_wins.slice(0, 3).map((item: string, i: number) => {
                  const Icon = achievementIcons[i % achievementIcons.length];
                  return (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-emerald-600" />
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
                    </div>
                  );
                })
              ) : (
                <p className="text-slate-400 text-sm italic">No achievements recorded.</p>
              )}
            </div>
          </div>

          {/* Constraints & Risks */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Constraints & Risks
            </h3>
            <div className="space-y-4">
              {(report.collective_blockers?.length > 0 || report.team_risks?.length > 0) ? (
                <>
                  {report.collective_blockers?.slice(0, 2).map((item: string, i: number) => (
                    <div key={`b-${i}`} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-600" />
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                  {report.team_risks?.slice(0, 2).map((item: string, i: number) => (
                    <div key={`r-${i}`} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                        <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
                      </div>
                      <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
                    </div>
                  ))}
                </>
              ) : (
                <p className="text-slate-400 text-sm italic">No significant blockers detected.</p>
              )}
            </div>
          </div>
        </div>

        {/* Priority Actions */}
        {report.critical_path?.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
              Priority Actions
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {report.critical_path.slice(0, 4).map((item: string, i: number) => (
                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-semibold">
                    {i + 1}
                  </span>
                  <p className="text-slate-700 text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-xs text-slate-400 pt-4">
          SpireTrack • {teamName} • Generated {format(new Date(), 'MMM d, yyyy')}
        </footer>
      </div>
    </div>
  );
};

// === Gauge Component ===

const GaugeCard: React.FC<{
  label: string;
  value: number;
  color: string;
  icon: string;
}> = ({ label, value, color, icon }) => {
  const percentage = Math.min(100, Math.max(0, value));
  const rotation = (percentage / 100) * 180; // 0-180 degrees for half circle
  
  return (
    <div className="flex flex-col items-center">
      {/* Gauge */}
      <div className="relative w-28 h-16 overflow-hidden mb-2">
        {/* Background arc */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-[10px] border-slate-100"
          style={{ clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)' }}
        />
        {/* Colored arc */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-28 rounded-full border-[10px] border-transparent"
          style={{ 
            borderBottomColor: color,
            borderLeftColor: rotation > 90 ? color : 'transparent',
            borderRightColor: rotation < 90 ? color : 'transparent',
            transform: `translateX(-50%) rotate(${rotation - 90}deg)`,
            clipPath: 'polygon(0 50%, 100% 50%, 100% 100%, 0 100%)'
          }}
        />
        {/* Icon */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xl">
          {icon}
        </div>
      </div>
      
      {/* Value */}
      <div className="text-center">
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
        <span className="text-slate-400 text-sm ml-0.5">/ 100</span>
      </div>
      
      {/* Label */}
      <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{label}</p>
    </div>
  );
};

export default ExecutiveReportLayout;
