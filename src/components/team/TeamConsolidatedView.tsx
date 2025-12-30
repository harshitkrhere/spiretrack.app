import React from 'react';

interface TeamReport {
  morale_score: number;
  collective_wins: string[];
  collective_blockers: string[];
  team_risks: string[];
  next_week_strategy: string;
  delegation_suggestions: string[];
  critical_actions: string[];
}

interface TeamConsolidatedViewProps {
  report: TeamReport;
}

export const TeamConsolidatedView: React.FC<TeamConsolidatedViewProps> = ({ report }) => {
  return (
    <div className="space-y-8">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 text-center">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide">Team Morale</h3>
          <div className="mt-2 flex items-baseline justify-center">
            <span className={`text-4xl font-extrabold ${
              report.morale_score >= 80 ? 'text-green-600' :
              report.morale_score >= 60 ? 'text-blue-600' :
              'text-yellow-600'
            }`}>
              {report.morale_score}
            </span>
            <span className="ml-1 text-xl text-slate-400">/100</span>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 col-span-2">
          <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">Next Week's Strategy</h3>
          <p className="text-lg text-slate-800 font-medium leading-relaxed">
            "{report.next_week_strategy}"
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Wins & Blockers */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-green-100 text-green-700 p-2 rounded-lg mr-3">🎉</span>
              Collective Wins
            </h3>
            <ul className="space-y-3">
              {report.collective_wins.map((win, i) => (
                <li key={i} className="flex items-start text-slate-600">
                  <span className="mr-2 text-green-500">•</span>
                  {win}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-red-100 text-red-700 p-2 rounded-lg mr-3">🚧</span>
              Core Blockers
            </h3>
            <ul className="space-y-3">
              {report.collective_blockers.map((blocker, i) => (
                <li key={i} className="flex items-start text-slate-600">
                  <span className="mr-2 text-red-500">•</span>
                  {blocker}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Risks & Actions */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
              <span className="bg-yellow-100 text-yellow-700 p-2 rounded-lg mr-3">⚠️</span>
              Identified Risks
            </h3>
            <ul className="space-y-3">
              {report.team_risks.map((risk, i) => (
                <li key={i} className="flex items-start text-slate-600">
                  <span className="mr-2 text-yellow-500">•</span>
                  {risk}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg">
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="bg-slate-700 p-2 rounded-lg mr-3">⚡</span>
              Critical Actions
            </h3>
            <ul className="space-y-4">
              {report.critical_actions.map((action, i) => (
                <li key={i} className="flex items-start">
                  <span className="flex-shrink-0 h-6 w-6 flex items-center justify-center border border-slate-600 rounded-full text-xs font-medium mr-3">
                    {i + 1}
                  </span>
                  <span className="text-slate-300">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
