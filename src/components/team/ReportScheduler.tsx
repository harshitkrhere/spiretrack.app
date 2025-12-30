import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface Schedule {
  id: string;
  frequency: string;
  day_of_week: number | null;
  time_of_day: string;
  recipients: string[];
  enabled: boolean;
  last_run: string | null;
  next_run: string | null;
}

interface ReportSchedulerProps {
  teamId: string;
}

export const ReportScheduler: React.FC<ReportSchedulerProps> = ({ teamId }) => {
  const [schedule, setSchedule] = useState<Schedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    frequency: 'weekly',
    day_of_week: 1, // Monday
    time_of_day: '09:00',
    recipients: '',
    enabled: true
  });

  useEffect(() => {
    fetchSchedule();
  }, [teamId]);

  const fetchSchedule = async () => {
    try {
      const { data, error } = await supabase
        .from('report_schedules')
        .select('*')
        .eq('team_id', teamId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // Ignore not found
      
      if (data) {
        setSchedule(data);
        setFormData({
          frequency: data.frequency,
          day_of_week: data.day_of_week || 1,
          time_of_day: data.time_of_day,
          recipients: Array.isArray(data.recipients) ? data.recipients.join(', ') : '',
          enabled: data.enabled
        });
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const recipientsArray = formData.recipients
        .split(',')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      const scheduleData = {
        team_id: teamId,
        frequency: formData.frequency,
        day_of_week: formData.frequency === 'weekly' ? formData.day_of_week : null,
        time_of_day: formData.time_of_day,
        recipients: recipientsArray,
        enabled: formData.enabled
      };

      if (schedule) {
        // Update existing
        const { error } = await supabase
          .from('report_schedules')
          .update(scheduleData)
          .eq('id', schedule.id);

        if (error) throw error;
      } else {
        // Create new
        const { error } = await supabase
          .from('report_schedules')
          .insert(scheduleData);

        if (error) throw error;
      }

      setEditing(false);
      fetchSchedule();
      alert('Schedule saved successfully!');
    } catch (err: any) {
      console.error('Error saving schedule:', err);
      alert('Failed to save schedule: ' + err.message);
    }
  };

  const handleToggle = async () => {
    if (!schedule) return;
    
    try {
      const { error } = await supabase
        .from('report_schedules')
        .update({ enabled: !schedule.enabled })
        .eq('id', schedule.id);

      if (error) throw error;
      fetchSchedule();
    } catch (err: any) {
      console.error('Error toggling schedule:', err);
      alert('Failed to toggle schedule: ' + err.message);
    }
  };

  const getDayName = (day: number) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[day];
  };

  if (loading) {
    return <div className="text-center py-4 text-slate-600">Loading schedule...</div>;
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 flex items-center">
            <ClockIcon className="h-5 w-5 mr-2" />
            Automated Reports
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Schedule automatic report generation and delivery
          </p>
        </div>
        {schedule && !editing && (
          <div className="flex space-x-2">
            <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
              Edit Schedule
            </Button>
            <Button
              size="sm"
              variant={schedule.enabled ? 'secondary' : 'primary'}
              onClick={handleToggle}
            >
              {schedule.enabled ? 'Disable' : 'Enable'}
            </Button>
          </div>
        )}
      </div>

      {!schedule && !editing ? (
        <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
          <p className="text-slate-600 mb-4">No automated schedule set up</p>
          <Button onClick={() => setEditing(true)}>
            <ClockIcon className="h-5 w-5 mr-2" />
            Set Up Schedule
          </Button>
        </div>
      ) : editing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Frequency</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          {formData.frequency === 'weekly' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Day of Week</label>
              <select
                value={formData.day_of_week}
                onChange={(e) => setFormData({ ...formData, day_of_week: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                {[0, 1, 2, 3, 4, 5, 6].map(day => (
                  <option key={day} value={day}>{getDayName(day)}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Time of Day</label>
            <input
              type="time"
              value={formData.time_of_day}
              onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              <EnvelopeIcon className="h-4 w-4 inline mr-1" />
              Recipients (comma-separated emails)
            </label>
            <textarea
              value={formData.recipients}
              onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
              placeholder="email1@example.com, email2@example.com"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
              className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            />
            <label htmlFor="enabled" className="text-sm text-slate-700">
              Enable schedule immediately
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button onClick={handleSave}>Save Schedule</Button>
            <Button variant="secondary" onClick={() => {
              setEditing(false);
              if (schedule) {
                setFormData({
                  frequency: schedule.frequency,
                  day_of_week: schedule.day_of_week || 1,
                  time_of_day: schedule.time_of_day,
                  recipients: Array.isArray(schedule.recipients) ? schedule.recipients.join(', ') : '',
                  enabled: schedule.enabled
                });
              }
            }}>
              Cancel
            </Button>
          </div>
        </div>
      ) : schedule ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-slate-600">Frequency</div>
              <div className="text-lg font-semibold text-slate-900 capitalize">
                {schedule.frequency}
              </div>
            </div>
            {schedule.day_of_week !== null && (
              <div>
                <div className="text-sm text-slate-600">Day</div>
                <div className="text-lg font-semibold text-slate-900">
                  {getDayName(schedule.day_of_week)}
                </div>
              </div>
            )}
            <div>
              <div className="text-sm text-slate-600">Time</div>
              <div className="text-lg font-semibold text-slate-900">{schedule.time_of_day}</div>
            </div>
            <div>
              <div className="text-sm text-slate-600">Status</div>
              <div className={`text-lg font-semibold ${schedule.enabled ? 'text-green-600' : 'text-slate-400'}`}>
                {schedule.enabled ? 'Active' : 'Disabled'}
              </div>
            </div>
          </div>

          {schedule.recipients && schedule.recipients.length > 0 && (
            <div>
              <div className="text-sm text-slate-600 mb-2">Recipients</div>
              <div className="flex flex-wrap gap-2">
                {schedule.recipients.map((email, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {email}
                  </span>
                ))}
              </div>
            </div>
          )}

          {schedule.last_run && (
            <div className="text-sm text-slate-600">
              Last run: {new Date(schedule.last_run).toLocaleString()}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
