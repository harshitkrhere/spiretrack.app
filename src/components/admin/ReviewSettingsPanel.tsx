import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

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
 * ReviewSettingsPanel - System Settings style
 * Clean, flat, system-like design
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

  if (loading) {
    return (
      <div className="px-4 py-3">
        <div className="animate-pulse h-5 bg-[#e5e5e7] rounded w-1/3" />
      </div>
    );
  }

  return (
    <div>
      {/* Row: Deadline Day */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e7]">
        <span className="text-[15px] text-[#1d1d1f]">Day</span>
        <select
          value={deadlineDay ?? ''}
          onChange={(e) => {
            setDeadlineDay(e.target.value === '' ? null : parseInt(e.target.value));
            markChanged();
          }}
          className="text-[15px] text-[#86868b] bg-transparent border-none text-right focus:outline-none cursor-pointer appearance-none pr-4"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2386868b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M9 5l7 7-7 7'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right center', backgroundSize: '16px' }}
        >
          <option value="">None</option>
          {DAYS_OF_WEEK.map(day => (
            <option key={day.value} value={day.value}>{day.label}</option>
          ))}
        </select>
      </div>

      {/* Row: Deadline Time */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e7]">
        <span className="text-[15px] text-[#1d1d1f]">Time</span>
        <input
          type="time"
          value={deadlineTime}
          onChange={(e) => {
            setDeadlineTime(e.target.value);
            markChanged();
          }}
          disabled={deadlineDay === null}
          className="text-[15px] text-[#86868b] bg-transparent border-none text-right focus:outline-none disabled:opacity-40"
        />
      </div>

      {/* Row: Allow Late Submissions */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e7]">
        <div className="flex-1 pr-4">
          <span className="text-[15px] text-[#1d1d1f]">Allow Late Submissions</span>
          <p className="text-[12px] text-[#86868b] mt-0.5">Members can submit after deadline</p>
        </div>
        <button
          onClick={() => {
            setLateSubmissionAllowed(!lateSubmissionAllowed);
            markChanged();
          }}
          className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 ${
            lateSubmissionAllowed ? 'bg-[#34c759]' : 'bg-[#e5e5e7]'
          }`}
        >
          <span className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
            lateSubmissionAllowed ? 'translate-x-[22px]' : 'translate-x-[2px]'
          }`} />
        </button>
      </div>

      {/* Row: Lock After Deadline */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#e5e5e7]">
        <div className="flex-1 pr-4">
          <span className="text-[15px] text-[#1d1d1f]">Lock After Deadline</span>
          <p className="text-[12px] text-[#86868b] mt-0.5">Block submissions when deadline passes</p>
        </div>
        <button
          onClick={() => {
            setLockAfterDeadline(!lockAfterDeadline);
            markChanged();
          }}
          className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 ${
            lockAfterDeadline ? 'bg-[#34c759]' : 'bg-[#e5e5e7]'
          }`}
        >
          <span className={`absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-sm transition-transform duration-200 ${
            lockAfterDeadline ? 'translate-x-[22px]' : 'translate-x-[2px]'
          }`} />
        </button>
      </div>

      {/* Summary - quiet inline */}
      {deadlineDay !== null && (
        <div className="px-4 py-3 border-b border-[#e5e5e7]">
          <p className="text-[13px] text-[#86868b]">
            Deadline: Every {DAYS_OF_WEEK[deadlineDay].label} at {deadlineTime}
          </p>
        </div>
      )}

      {/* Save - only shows when changes exist */}
      {hasChanges && (
        <div className="px-4 py-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-2.5 text-[15px] font-medium text-white bg-[#007aff] rounded-lg hover:bg-[#0066d6] transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewSettingsPanel;
