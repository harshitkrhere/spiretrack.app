import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowLeftIcon, CheckCircleIcon, LockClosedIcon, ClockIcon } from '@heroicons/react/24/outline';
import { DeadlineStatusBadge, DeadlineIndicator } from '../compliance/DeadlineStatusBadge';

interface Question {
  id: string;
  question_text: string;
  question_type: 'text' | 'long_text' | 'number' | 'rating';
  position: number;
  is_required: boolean;
}

interface CustomFormRendererProps {
  teamId: string;
  teamName: string;
}

export const CustomFormRenderer: React.FC<CustomFormRendererProps> = ({ teamId, teamName }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [autoSaving, setAutoSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'on_time' | 'late' | 'missed'>('pending');

  // Get current week start (Monday) - must match TeamDashboard's getCurrentWeekStart
  const getWeekStart = () => {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return format(new Date(date.setDate(diff)), 'yyyy-MM-dd');
  };

  const weekStart = getWeekStart();

  // Fetch questions and check if already submitted
  useEffect(() => {
    const fetchData = async () => {
      if (!teamId || !user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch custom questions from team_form_questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('team_form_questions')
          .select('*')
          .eq('team_id', teamId)
          .order('position', { ascending: true });

        if (questionsError) throw questionsError;

        if (!questionsData || questionsData.length === 0) {
          setQuestions([]);
          setLoading(false);
          return;
        }

        setQuestions(questionsData);

        // Check if user already submitted this week
        const { data: existingSubmission, error: submissionError } = await supabase
          .from('team_weekly_reviews')
          .select('id')
          .eq('team_id', teamId)
          .eq('user_id', user.id)
          .eq('week_start', weekStart)
          .single();

        if (submissionError && submissionError.code !== 'PGRST116') {
          // PGRST116 = no rows found
          throw submissionError;
        }

        if (existingSubmission) {
          setAlreadySubmitted(true);
        }

        // Fetch team review settings for deadline
        try {
          const { data: settings } = await supabase
            .from('team_review_settings')
            .select('*')
            .eq('team_id', teamId)
            .maybeSingle();
          
          if (settings?.submission_deadline_day !== null && settings?.submission_deadline_time) {
            // Calculate this week's deadline
            const now = new Date();
            const currentDay = now.getDay();
            let daysUntilDeadline = (settings.submission_deadline_day - currentDay + 7) % 7;
            if (daysUntilDeadline === 0) daysUntilDeadline = 7; // Next week if today
            
            const deadlineDate = new Date(now);
            deadlineDate.setDate(now.getDate() + daysUntilDeadline);
            const [hours, minutes] = settings.submission_deadline_time.split(':');
            deadlineDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
            
            setDeadline(deadlineDate);
            
            // Check if locked
            if (settings.lock_after_deadline && deadlineDate < now) {
              setIsLocked(true);
              setSubmissionStatus('missed');
            }
          }
        } catch (e) {
          console.warn('Failed to load review settings:', e);
        }

        // Load draft from localStorage
        const draft = localStorage.getItem(`custom_form_draft_${teamId}_${weekStart}`);
        if (draft) {
          try {
            setResponses(JSON.parse(draft));
          } catch (err) {
            console.error('Failed to load draft:', err);
          }
        }
      } catch (err: any) {
        console.error('Error fetching form data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [teamId, user, weekStart]);

  // Autosave every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(responses).length > 0 && !alreadySubmitted) {
        autoSave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [responses, alreadySubmitted]);

  const autoSave = async () => {
    setAutoSaving(true);
    try {
      localStorage.setItem(`custom_form_draft_${teamId}_${weekStart}`, JSON.stringify(responses));
      setLastSaved(new Date());
    } catch (err) {
      console.error('Autosave failed:', err);
    } finally {
      setAutoSaving(false);
    }
  };

  const handleChange = (questionId: string, value: string | number) => {
    setResponses(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate required fields
    const missingRequired = questions
      .filter(q => q.is_required)
      .filter(q => !responses[q.id] || responses[q.id] === '');

    if (missingRequired.length > 0) {
      setError(`Please answer all required questions: ${missingRequired.map(q => q.question_text).join(', ')}`);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Format responses for storage
      const formattedResponses: Record<string, any> = {};
      questions.forEach(q => {
        formattedResponses[q.question_text] = responses[q.id] || '';
      });

      // Insert into team_weekly_reviews with custom responses in the responses JSONB column
      const { error: insertError } = await supabase
        .from('team_weekly_reviews')
        .insert({
          team_id: teamId,
          user_id: user.id,
          week_start: weekStart,
          responses: formattedResponses
        });

      if (insertError) throw insertError;

      // Clear draft
      localStorage.removeItem(`custom_form_draft_${teamId}_${weekStart}`);
      
      setAlreadySubmitted(true);
      alert('Weekly review submitted successfully! ✅');
      navigate(`/app/team/${teamId}`);
    } catch (err: any) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderQuestionInput = (question: Question) => {
    const value = responses[question.id] || '';

    switch (question.question_type) {
      case 'long_text':
        return (
          <textarea
            value={value as string}
            onChange={(e) => handleChange(question.id, e.target.value)}
            rows={4}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            placeholder="Enter your response..."
          />
        );

      case 'number':
        return (
          <input
            type="number"
            value={value as number}
            onChange={(e) => handleChange(question.id, parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="0"
          />
        );

      case 'rating':
        return (
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => handleChange(question.id, num)}
                className={`w-10 h-10 rounded-lg border-2 transition-all ${
                  value === num
                    ? 'bg-primary-500 border-primary-500 text-white'
                    : 'border-slate-200 hover:border-primary-300 text-slate-600'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        );

      case 'text':
      default:
        return (
          <input
            type="text"
            value={value as string}
            onChange={(e) => handleChange(question.id, e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Enter your response..."
          />
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (alreadySubmitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="text-center py-12">
          <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Already Submitted!</h2>
          <p className="text-slate-600 mb-6">
            You have already submitted your weekly review for this week.
          </p>
          <Button onClick={() => navigate(`/app/team/${teamId}`)}>
            Back to Team
          </Button>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card className="text-center py-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">No Form Configured</h2>
          <p className="text-slate-600 mb-6">
            Your team admin hasn't set up a weekly review form yet.
          </p>
          <Button onClick={() => navigate(`/app/team/${teamId}`)}>
            Back to Team
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <Button variant="ghost" onClick={() => navigate(`/app/team/${teamId}`)}>
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to Team
        </Button>
        {lastSaved && (
          <span className="text-sm text-slate-500">
            {autoSaving ? 'Saving...' : `Last saved: ${lastSaved.toLocaleTimeString()}`}
          </span>
        )}
      </div>

      <Card className="p-8">
        {/* Title */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-slate-900">Weekly Review</h1>
            {submissionStatus !== 'pending' && (
              <DeadlineStatusBadge status={submissionStatus} />
            )}
          </div>
          <p className="text-slate-600">
            Share your weekly update with <span className="font-semibold">{teamName}</span>
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Week of {new Date(weekStart).toLocaleDateString()}
          </p>
        </div>

        {/* Deadline Indicator */}
        {deadline && (
          <div className="mb-6">
            <DeadlineIndicator deadline={deadline} isLocked={isLocked} />
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {questions.map((question, index) => (
            <div key={question.id} className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">
                {index + 1}. {question.question_text}
                {question.is_required && <span className="text-red-500 ml-1">*</span>}
              </label>
              {renderQuestionInput(question)}
            </div>
          ))}

          {/* Submit Button */}
          <div className="pt-6 border-t border-slate-200">
            {isLocked ? (
              <div className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-600 rounded-lg">
                <LockClosedIcon className="h-5 w-5" />
                <span className="font-medium">Submission Locked - Deadline Passed</span>
              </div>
            ) : (
              <Button
                type="submit"
                isLoading={submitting}
                className="w-full"
              >
                Submit Weekly Review
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};
