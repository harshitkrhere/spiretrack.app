import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface ReviewSettingsPanelProps {
  teamId: string;
}

const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

/**
 * ReviewSettingsPanel - Modern Settings Design
 */
export const ReviewSettingsPanel: React.FC<ReviewSettingsPanelProps> = ({ teamId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [deadlineDay, setDeadlineDay] = useState<number | null>(5);
  const [deadlineTime, setDeadlineTime] = useState('18:00');
  const [lateSubmissionAllowed, setLateSubmissionAllowed] = useState(true);
  const [lockAfterDeadline, setLockAfterDeadline] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('team_review_settings')
          .select('*')
          .eq('team_id', teamId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setDeadlineDay(data.submission_deadline_day);
          setDeadlineTime(data.submission_deadline_time?.slice(0, 5) || '18:00');
          setLateSubmissionAllowed(data.late_submission_allowed ?? true);
          setLockAfterDeadline(data.lock_after_deadline ?? false);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) fetchSettings();
  }, [teamId]);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('team_review_settings')
        .upsert({
          team_id: teamId,
          submission_deadline_day: deadlineDay,
          submission_deadline_time: `${deadlineTime}:00`,
          late_submission_allowed: lateSubmissionAllowed,
          lock_after_deadline: lockAfterDeadline,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'team_id'
        });

      if (error) throw error;
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const markChanged = () => setHasChanges(true);

  // Modern Toggle Component
  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
        enabled ? 'bg-emerald-500' : 'bg-slate-200'
      }`}
    >
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
        enabled ? 'translate-x-5' : 'translate-x-0'
      }`} />
    </button>
  );

  if (loading) {
    return (
      <div className="p-4 space-y-3">
        <div className="animate-pulse h-10 bg-slate-100 rounded-lg" />
        <div className="animate-pulse h-10 bg-slate-100 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">
      {/* Row: Deadline Day */}
      <div className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors">
        <span className="text-sm font-medium text-slate-700">Day</span>
        <div className="flex items-center gap-1">
          <select
            value={deadlineDay ?? ''}
            onChange={(e) => {
              setDeadlineDay(e.target.value === '' ? null : parseInt(e.target.value));
              markChanged();
            }}
            className="text-sm text-slate-500 bg-transparent border-none text-right focus:outline-none focus:ring-0 cursor-pointer appearance-none font-medium"
          >
            <option value="">None</option>
            {DAYS_OF_WEEK.map(day => (
              <option key={day.value} value={day.value}>{day.label}</option>
            ))}
          </select>
          <ChevronRightIcon className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Row: Deadline Time */}
      <div className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors">
        <span className="text-sm font-medium text-slate-700">Time</span>
        <div className="flex items-center gap-2">
          <input
            type="time"
            value={deadlineTime}
            onChange={(e) => {
              setDeadlineTime(e.target.value);
              markChanged();
            }}
            disabled={deadlineDay === null}
            className="text-sm text-slate-500 bg-transparent border-none text-right focus:outline-none focus:ring-0 disabled:opacity-40 font-medium"
          />
        </div>
      </div>

      {/* Row: Allow Late Submissions */}
      <div className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors">
        <div className="flex-1 pr-4">
          <span className="text-sm font-medium text-slate-700">Allow Late Submissions</span>
          <p className="text-xs text-slate-400 mt-0.5">Members can submit after deadline</p>
        </div>
        <Toggle enabled={lateSubmissionAllowed} onChange={() => { setLateSubmissionAllowed(!lateSubmissionAllowed); markChanged(); }} />
      </div>

      {/* Row: Lock After Deadline */}
      <div className="flex items-center justify-between px-4 py-3.5 hover:bg-slate-50 transition-colors">
        <div className="flex-1 pr-4">
          <span className="text-sm font-medium text-slate-700">Lock After Deadline</span>
          <p className="text-xs text-slate-400 mt-0.5">Block submissions when deadline passes</p>
        </div>
        <Toggle enabled={lockAfterDeadline} onChange={() => { setLockAfterDeadline(!lockAfterDeadline); markChanged(); }} />
      </div>

      {/* Summary */}
      {deadlineDay !== null && (
        <div className="px-4 py-3 bg-slate-50">
          <p className="text-xs text-slate-500">
            📅 Deadline: Every <span className="font-medium text-slate-600">{DAYS_OF_WEEK[deadlineDay].label}</span> at <span className="font-medium text-slate-600">{deadlineTime}</span>
          </p>
        </div>
      )}

      {/* Save Button */}
      {hasChanges && (
        <div className="p-4 bg-slate-50">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 text-sm font-medium text-white bg-emerald-500 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSettingsPanel;
