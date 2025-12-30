import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface TeamReviewProps {
  teamId: string;
  teamName: string;
}

const TEAM_QUESTIONS = [
  {
    id: 'wins',
    question: 'What were your biggest wins this week?',
    placeholder: 'Share your achievements and successes...'
  },
  {
    id: 'challenges',
    question: 'What challenges did you face?',
    placeholder: 'Describe any blockers or difficulties...'
  },
  {
    id: 'morale',
    question: 'How would you rate your morale this week? (1-10)',
    type: 'number',
    placeholder: '7'
  },
  {
    id: 'needs',
    question: 'What support or resources do you need?',
    placeholder: 'What would help you succeed?'
  },
  {
    id: 'next_week',
    question: 'What are your priorities for next week?',
    placeholder: 'Share your upcoming focus areas...'
  }
];

export const TeamReviewSubmit: React.FC<TeamReviewProps> = ({ teamId, teamName }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (questionId: string, value: string) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get current week start (Monday)
      const date = new Date();
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1);
      const weekStart = new Date(date.setDate(diff)).toISOString().split('T')[0];

      // Insert team review
      const { error } = await supabase
        .from('team_weekly_reviews')
        .insert({
          team_id: teamId,
          user_id: user?.id,
          week_start: weekStart,
          responses: responses
        });

      if (error) throw error;

      alert('Team review submitted successfully! ✅');
      navigate(`/app/team/${teamId}`);
    } catch (err: any) {
      console.error('Error submitting team review:', err);
      alert('Failed to submit review: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const allQuestionsAnswered = TEAM_QUESTIONS.every(q => responses[q.id]?.trim());

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate(`/app/team/${teamId}`)}>
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Team
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Team Weekly Review</h1>
          <p className="text-slate-600">
            Share your weekly update with <span className="font-semibold">{teamName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {TEAM_QUESTIONS.map((q, index) => (
            <div key={q.id} className="space-y-3">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">
                  {index + 1}. {q.question}
                </span>
                {q.type === 'number' ? (
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={responses[q.id] || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    className="mt-2 block w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                ) : (
                  <textarea
                    value={responses[q.id] || ''}
                    onChange={(e) => handleChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    rows={4}
                    className="mt-2 block w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    required
                  />
                )}
              </label>
            </div>
          ))}

          <div className="pt-6 border-t border-slate-200">
            <Button
              type="submit"
              isLoading={submitting}
              disabled={!allQuestionsAnswered}
              className="w-full"
            >
              Submit Team Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
