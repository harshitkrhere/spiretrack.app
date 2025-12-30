import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { FormQuestionCard } from '../components/team/FormQuestionCard';
import { FormPreview } from '../components/team/FormPreview';
import { SubmissionsViewer } from '../components/team/SubmissionsViewer';

interface Question {
  id?: string;
  question_text: string;
  question_type: 'text' | 'long_text' | 'number' | 'rating';
  position: number;
  is_required: boolean;
}

export const TeamFormBuilder: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'submissions'>('builder');

  useEffect(() => {
    if (teamId) {
      checkAdminStatus();
      fetchForm();
    }
  }, [teamId]);

  const checkAdminStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        return;
      }

      const { data: memberRoles } = await supabase
        .from('team_member_roles')
        .select('team_roles(is_admin)')
        .eq('team_id', teamId)
        .eq('user_id', user.id);
      
      const hasAdminRole = memberRoles?.some((mr: any) => mr.team_roles?.is_admin) || false;
      setIsAdmin(data?.role === 'admin' || hasAdminRole);
    } catch (err) {
      console.error('Admin check error:', err);
      setIsAdmin(false);
    }
  };

  const fetchForm = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('team_form_questions')
        .select('*')
        .eq('team_id', teamId)
        .order('position', { ascending: true });

      if (error) throw error;
      setQuestions(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      question_text: '',
      question_type: 'text',
      position: questions.length,
      is_required: true
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const deleteQuestion = (index: number) => {
    const updated = questions.filter((_, i) => i !== index);
    updated.forEach((q, i) => q.position = i);
    setQuestions(updated);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const updated = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    
    updated.forEach((q, i) => q.position = i);
    setQuestions(updated);
  };

  const saveForm = async () => {
    try {
      setSaving(true);
      setError(null);

      if (questions.length === 0) {
        throw new Error('Please add at least one question');
      }

      const emptyQuestions = questions.filter(q => !q.question_text.trim());
      if (emptyQuestions.length > 0) {
        throw new Error('All questions must have text');
      }

      const { data, error } = await supabase.functions.invoke('team-operations', {
        body: {
          action: 'save_team_form',
          team_id: teamId,
          questions: questions.map(q => ({
            id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            position: q.position,
            is_required: q.is_required
          }))
        }
      });

      if (error) throw error;

      await fetchForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <p className="text-[15px] text-[#86868b]">Only team admins can manage forms.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#86868b] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f7]">
      {/* Header */}
      <div className="bg-white border-b border-[#e5e5e7]">
        <div className="max-w-6xl mx-auto px-6 py-5">
          {/* Back link - subtle */}
          <button
            onClick={() => navigate(`/app/team/${teamId}`)}
            className="text-[13px] text-[#007aff] hover:opacity-70 transition-opacity mb-3"
          >
            ← Team Dashboard
          </button>
          
          {/* Title */}
          <h1 className="text-[22px] font-semibold text-[#1d1d1f] tracking-tight">
            Form Manager
          </h1>
          <p className="text-[13px] text-[#86868b] mt-1">
            Build custom review forms for your team
          </p>
        </div>
      </div>

      {/* Segmented Control */}
      <div className="bg-white border-b border-[#e5e5e7]">
        <div className="max-w-6xl mx-auto px-6 py-3">
          <div className="inline-flex bg-[#e5e5e7] rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('builder')}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 ${
                activeTab === 'builder'
                  ? 'bg-white text-[#1d1d1f] shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Build Form
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`px-4 py-1.5 text-[13px] font-medium rounded-md transition-all duration-200 ${
                activeTab === 'submissions'
                  ? 'bg-white text-[#1d1d1f] shadow-sm'
                  : 'text-[#86868b] hover:text-[#1d1d1f]'
              }`}
            >
              Submissions
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {activeTab === 'builder' ? (
          <>
            {/* Info note - quiet inline */}
            <p className="text-[12px] text-[#86868b] mb-6">
              Changes apply to future weeks only. Past submissions remain unchanged.
            </p>

            {/* Error */}
            {error && (
              <div className="mb-4 px-4 py-3 bg-white rounded-lg border border-[#e5e5e7]">
                <p className="text-[13px] text-[#ff3b30]">{error}</p>
              </div>
            )}

            {/* Editor + Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Left: Questions Editor */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[15px] font-medium text-[#1d1d1f]">Questions</h2>
                  <button
                    onClick={addQuestion}
                    className="text-[13px] text-[#007aff] hover:opacity-70 transition-opacity"
                  >
                    + Add Question
                  </button>
                </div>

                {questions.length === 0 ? (
                  <div className="bg-white rounded-xl border border-[#e5e5e7] px-6 py-12 text-center">
                    <p className="text-[15px] text-[#86868b]">No questions yet</p>
                    <button
                      onClick={addQuestion}
                      className="mt-3 text-[13px] text-[#007aff] hover:opacity-70 transition-opacity"
                    >
                      Add your first question
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {questions.map((question, index) => (
                      <FormQuestionCard
                        key={index}
                        question={question}
                        index={index}
                        totalQuestions={questions.length}
                        onUpdate={(updates) => updateQuestion(index, updates)}
                        onDelete={() => deleteQuestion(index)}
                        onMove={(direction) => moveQuestion(index, direction)}
                      />
                    ))}
                  </div>
                )}

                {/* Save - appears when questions exist */}
                {questions.length > 0 && (
                  <div className="mt-6">
                    <button
                      onClick={saveForm}
                      disabled={saving}
                      className="w-full py-3 text-[15px] font-medium text-white bg-[#007aff] rounded-xl hover:bg-[#0066d6] transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : 'Save Form'}
                    </button>
                  </div>
                )}
              </div>

              {/* Right: Live Preview */}
              <div className="lg:sticky lg:top-6 lg:self-start">
                <h2 className="text-[15px] font-medium text-[#1d1d1f] mb-4">Preview</h2>
                <FormPreview questions={questions} />
              </div>
            </div>
          </>
        ) : (
          <SubmissionsViewer teamId={teamId!} />
        )}
      </div>
    </div>
  );
};
