import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline';

interface ActionPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
  report: any;
  weekStart: string;
}

export const ActionPlanModal: React.FC<ActionPlanModalProps> = ({
  isOpen,
  onClose,
  teamId,
  report,
  weekStart
}) => {
  const [generating, setGenerating] = useState(false);
  const [actionPlan, setActionPlan] = useState<any>(null);

  if (!isOpen) return null;

  const generateActionPlan = async () => {
    setGenerating(true);
    try {
      console.log('📋 Generating action plan...', {
        teamId,
        weekStart,
        reportData: {
          critical_path: report.critical_path,
          blockers: report.collective_blockers,
          risks: report.team_risks,
          manager_actions: report.recommended_manager_actions
        }
      });

      const { data, error } = await supabase.functions.invoke('team-operations', {
        body: {
          action: 'generate_action_plan',
          team_id: teamId,
          week_start: weekStart,
          report_data: {
            critical_path: report.critical_path,
            blockers: report.collective_blockers,
            risks: report.team_risks,
            manager_actions: report.recommended_manager_actions
          }
        }
      });

      console.log('📋 Response:', { data, error });

      if (error) {
        console.error('❌ Supabase function error:', error);
        throw error;
      }
      
      setActionPlan(data);
    } catch (err: any) {
      console.error('❌ Error generating action plan:', err);
      alert('Failed to generate action plan: ' + (err.message || JSON.stringify(err)));
    } finally {
      setGenerating(false);
    }
  };

  const saveActionPlan = async () => {
    if (!actionPlan) return;
    
    try {
      const { error } = await supabase
        .from('team_action_plans')
        .insert({
          team_id: teamId,
          week_start: weekStart,
          plan: actionPlan
        });

      if (error) throw error;
      alert('Action plan saved successfully!');
      onClose();
    } catch (err: any) {
      console.error('Error saving action plan:', err);
      alert('Failed to save action plan: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-6 w-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-slate-900">Action Plan Generator</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!actionPlan ? (
            <div className="text-center py-12">
              <SparklesIcon className="h-16 w-16 text-primary-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Generate AI-Powered Action Plan
              </h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                Create a detailed, prioritized action plan based on this week's report, blockers, and critical path.
              </p>
              <Button onClick={generateActionPlan} isLoading={generating}>
                <SparklesIcon className="h-5 w-5 mr-2" />
                Generate Action Plan
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Summary */}
              {actionPlan.summary && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h3 className="font-semibold text-primary-900 mb-2">Summary</h3>
                  <p className="text-primary-800">{actionPlan.summary}</p>
                </div>
              )}

              {/* Immediate Actions */}
              {actionPlan.immediate_actions && actionPlan.immediate_actions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    🚨 Immediate Actions (This Week)
                  </h3>
                  <div className="space-y-2">
                    {actionPlan.immediate_actions.map((action: string, index: number) => (
                      <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <div className="flex items-start">
                          <span className="inline-block w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-slate-800">{action}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Short-term Actions */}
              {actionPlan.short_term_actions && actionPlan.short_term_actions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    📅 Short-term Actions (Next 2-4 Weeks)
                  </h3>
                  <div className="space-y-2">
                    {actionPlan.short_term_actions.map((action: string, index: number) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-slate-800">• {action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Long-term Actions */}
              {actionPlan.long_term_actions && actionPlan.long_term_actions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    🎯 Long-term Actions (1-3 Months)
                  </h3>
                  <div className="space-y-2">
                    {actionPlan.long_term_actions.map((action: string, index: number) => (
                      <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-slate-800">• {action}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {actionPlan && (
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200">
            <Button variant="secondary" onClick={onClose}>
              Close
            </Button>
            <Button onClick={saveActionPlan}>
              Save Action Plan
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
