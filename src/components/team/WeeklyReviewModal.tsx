import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Dialog } from '@headlessui/react';
import { XMarkIcon, PaperAirplaneIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { DynamicQuestionRenderer } from './DynamicQuestionRenderer';
import { DeadlineIndicator, DeadlineStatusBadge } from '../compliance/DeadlineStatusBadge';

interface WeeklyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  teamId: string;
}

interface SnapshotQuestion {
  id: string;
  snapshot_question_text: string;
  snapshot_question_type: 'text' | 'long_text' | 'number' | 'rating';
  snapshot_position: number;
  is_required_at_snapshot: boolean;
}

export const WeeklyReviewModal: React.FC<WeeklyReviewModalProps> = ({ isOpen, onClose, teamId }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [questions, setQuestions] = useState<SnapshotQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'pending' | 'on_time' | 'late' | 'missed'>('pending');

  // Helper to get Monday of current week
  const getCurrentWeekStart = () => {
    const date = new Date();
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    return format(new Date(date.setDate(diff)), 'yyyy-MM-dd');
  };

  const weekStart = getCurrentWeekStart();

  useEffect(() => {
    if (isOpen && teamId) {
      initializeForm();
    }
  }, [isOpen, teamId]);

  const initializeForm = async () => {
    try {
      setFetching(true);
      
      // Direct fetch from team_form_questions to ensure they load
      const { data: questionsData, error: questionsError } = await supabase
        .from('team_form_questions')
        .select('*')
        .eq('team_id', teamId)
        .order('position', { ascending: true });

      if (questionsError) throw questionsError;

      // Map to SnapshotQuestion format
      const mappedQuestions: SnapshotQuestion[] = (questionsData || []).map(q => ({
        id: q.id,
        snapshot_question_text: q.question_text,
        snapshot_question_type: q.question_type as any,
        snapshot_position: q.position,
        is_required_at_snapshot: q.is_required
      }));

      setQuestions(mappedQuestions);
      
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
      
      // Load existing answers if any (drafts)
      try {
        const { data: responseData } = await supabase.functions.invoke('team-operations', {
          body: {
            action: 'get_member_responses',
            team_id: teamId,
            week_start: weekStart,
            user_id: user?.id
          }
        });

        if (responseData?.responses) {
          const loadedAnswers: Record<string, string | number> = {};
          responseData.responses.forEach((r: any) => {
            loadedAnswers[r.snapshot_question_id] = r.answer_text || r.answer_number;
          });
          setAnswers(loadedAnswers);
        }
      } catch (e) {
        console.warn('Failed to load drafts:', e);
      }
    } catch (err) {
      console.error('Error initializing form:', err);
    } finally {
      setFetching(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    if (errors[questionId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[questionId];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    let isValid = true;

    questions.forEach(q => {
      if (q.is_required_at_snapshot) {
        const val = answers[q.id];
        if (val === undefined || val === '' || val === null) {
          newErrors[q.id] = 'This field is required';
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const formattedResponses = Object.entries(answers).map(([qId, val]) => ({
        snapshot_question_id: qId,
        answer_text: typeof val === 'string' ? val : undefined,
        answer_number: typeof val === 'number' ? val : undefined
      }));

      const { error } = await supabase.functions.invoke('team-operations', {
        body: {
          action: 'submit_team_review_responses',
          team_id: teamId,
          week_start: weekStart,
          responses: formattedResponses
        }
      });

      if (error) throw error;

      // Determine submission status based on deadline
      if (deadline) {
        const now = new Date();
        if (now > deadline) {
          setSubmissionStatus('late');
        } else {
          setSubmissionStatus('on_time');
        }
      }

      onClose();
      alert('Weekly review submitted successfully!');
    } catch (err: any) {
      console.error('Error submitting review:', err);
      alert('Failed to submit review: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="mx-auto max-w-2xl w-full bg-white rounded-xl shadow-2xl max-h-[90vh] flex flex-col animate-slide-up">
          
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <Dialog.Title className="text-xl font-bold text-gray-900">
                  Weekly Review
                </Dialog.Title>
                {submissionStatus !== 'pending' && (
                  <DeadlineStatusBadge status={submissionStatus} />
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Week of {format(new Date(weekStart), 'MMM d, yyyy')}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          
          {/* Deadline indicator */}
          {deadline && (
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
              <DeadlineIndicator deadline={deadline} isLocked={isLocked} />
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {fetching ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No questions defined for this team yet.</p>
                <p className="text-sm mt-2">Please ask your team admin to set up the review form.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {questions.map((question) => (
                  <DynamicQuestionRenderer
                    key={question.id}
                    question={question}
                    value={answers[question.id] ?? ''}
                    onChange={(val) => handleAnswerChange(question.id, val)}
                    error={errors[question.id]}
                  />
                ))}
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            {isLocked ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-600 rounded-lg">
                <LockClosedIcon className="h-4 w-4" />
                <span className="text-sm font-medium">Submission Locked</span>
              </div>
            ) : (
              <Button 
                onClick={handleSubmit} 
                isLoading={loading}
                disabled={fetching || questions.length === 0}
              >
                <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                Submit Review
              </Button>
            )}
          </div>

        </Dialog.Panel>
      </div>
    </Dialog>
  );
};
