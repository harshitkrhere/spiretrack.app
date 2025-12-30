import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, PlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center px-6"
        >
          <p className="text-gray-400 text-lg">Only team admins can manage forms.</p>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-6 h-6 border-2 border-gray-200 border-t-gray-900 rounded-full"
        />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white"
    >
      {/* Hero Header */}
      <div className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 py-8 sm:py-12">
          {/* Back link */}
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => navigate(`/app/team/${teamId}`)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mb-6"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to Team
          </motion.button>
          
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="text-center"
          >
            <h1 className="text-4xl sm:text-5xl font-light text-gray-900 tracking-tight mb-3"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
              Form Builder
            </h1>
            <p className="text-lg text-gray-400 font-light">
              Create custom review forms for your team
            </p>
          </motion.div>
        </div>
      </div>

      {/* Tab Navigation */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="border-b border-gray-100"
      >
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex justify-center">
            <div className="inline-flex bg-gray-100 rounded-full p-1">
              <button
                onClick={() => setActiveTab('builder')}
                className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  activeTab === 'builder'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Build Form
              </button>
              <button
                onClick={() => setActiveTab('submissions')}
                className={`px-6 py-2 text-sm font-medium rounded-full transition-all duration-300 ${
                  activeTab === 'submissions'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Submissions
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'builder' ? (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Info note */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm text-gray-400 text-center mb-8"
              >
                Changes apply to future weeks only. Past submissions remain unchanged.
              </motion.p>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 px-4 py-3 bg-red-50 rounded-xl border border-red-100 text-center"
                  >
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Editor + Preview Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                
                {/* Left: Questions Editor */}
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-medium text-gray-900">Questions</h2>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={addQuestion}
                      className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                    >
                      <PlusIcon className="w-4 h-4" />
                      Add Question
                    </motion.button>
                  </div>

                  {questions.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gray-50 rounded-2xl px-8 py-16 text-center"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <DocumentTextIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <p className="text-lg text-gray-500 mb-2">No questions yet</p>
                      <p className="text-sm text-gray-400 mb-6">Start building your review form</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addQuestion}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-colors"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add your first question
                      </motion.button>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <AnimatePresence>
                        {questions.map((question, index) => (
                          <motion.div
                            key={question.id || `new-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, height: 0 }}
                            transition={{ duration: 0.2 }}
                            layout
                          >
                            <FormQuestionCard
                              question={question}
                              index={index}
                              totalQuestions={questions.length}
                              onUpdate={(updates) => updateQuestion(index, updates)}
                              onDelete={() => deleteQuestion(index)}
                              onMove={(direction) => moveQuestion(index, direction)}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Save Button */}
                  {questions.length > 0 && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-8"
                    >
                      <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={saveForm}
                        disabled={saving}
                        className="w-full py-4 text-base font-medium text-white bg-gray-900 rounded-2xl hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {saving ? (
                          <span className="flex items-center justify-center gap-2">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                            />
                            Saving...
                          </span>
                        ) : (
                          'Save Form'
                        )}
                      </motion.button>
                    </motion.div>
                  )}
                </div>

                {/* Right: Live Preview */}
                <div className="lg:sticky lg:top-8 lg:self-start">
                  <h2 className="text-xl font-medium text-gray-900 mb-6">Preview</h2>
                  <FormPreview questions={questions} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="submissions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SubmissionsViewer teamId={teamId!} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
