import React, { useState, useEffect } from 'react';
import { ReviewCard } from './ReviewCard';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';

const QUESTIONS = [
    {
        id: 'wins',
        question: "What were your biggest wins this week?",
        description: "Celebrate your progress, no matter how small.",
        placeholder: "I finally shipped that feature...",
        type: 'text'
    },
    {
        id: 'challenges',
        question: "What challenges did you face?",
        description: "Identify blockers and areas for improvement.",
        placeholder: "I struggled with focus because...",
        type: 'text'
    },
    {
        id: 'focus_score',
        question: "Rate your Focus & Productivity",
        description: "1 = Distracted/Unproductive, 10 = Deep Work/Flow State",
        type: 'rating'
    },
    {
        id: 'mood_score',
        question: "Rate your Overall Mood",
        description: "1 = Drained/Anxious, 10 = Energized/Happy",
        type: 'rating'
    },
    {
        id: 'stress_score',
        question: "Rate your Stress Level",
        description: "1 = Zen/Calm, 10 = Overwhelmed/Burnout",
        type: 'rating'
    },
    {
        id: 'sleep_score',
        question: "Rate your Sleep Quality",
        description: "1 = Poor/Insomnia, 10 = Rested/Recharged",
        type: 'rating'
    },
    {
        id: 'learning',
        question: "What did you learn?",
        description: "New skills, insights, or realizations.",
        placeholder: "I learned that I need to...",
        type: 'text'
    },
    {
        id: 'next_week',
        question: "What is the #1 priority for next week?",
        description: "One thing that makes everything else easier.",
        placeholder: "Complete the MVP...",
        type: 'text'
    }
];

export const ReviewWizard: React.FC = () => {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [submittedDate, setSubmittedDate] = useState<string | null>(null);

    // Get current week boundaries (Monday to Sunday)
    const getCurrentWeekBounds = () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        // Calculate days to subtract to get to Monday (0 = Sunday, 1 = Monday, etc.)
        const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        
        const monday = new Date(now);
        monday.setDate(now.getDate() - daysToMonday);
        monday.setHours(0, 0, 0, 0);
        
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(23, 59, 59, 999);
        
        return { monday, sunday };
    };

    // Check if user already submitted a review this week
    useEffect(() => {
        const checkExistingReview = async () => {
            if (!user) {
                setIsLoading(false);
                return;
            }

            try {
                const { monday, sunday } = getCurrentWeekBounds();
                
                const { data: existingReview, error } = await supabase
                    .from('weekly_reviews')
                    .select('id, created_at, status')
                    .eq('user_id', user.id)
                    .gte('created_at', monday.toISOString())
                    .lte('created_at', sunday.toISOString())
                    .eq('status', 'completed')
                    .maybeSingle();

                if (error) {
                    console.error('Error checking existing review:', error);
                } else if (existingReview) {
                    setAlreadySubmitted(true);
                    setSubmittedDate(existingReview.created_at);
                }
            } catch (err) {
                console.error('Error checking existing review:', err);
            } finally {
                setIsLoading(false);
            }
        };

        checkExistingReview();
    }, [user]);

    // Load saved draft
    useEffect(() => {
        if (!alreadySubmitted) {
            const saved = localStorage.getItem('review_draft');
            if (saved) {
                setAnswers(JSON.parse(saved));
            }
        }
    }, [alreadySubmitted]);

    useEffect(() => {
        if (!alreadySubmitted) {
            localStorage.setItem('review_draft', JSON.stringify(answers));
        }
    }, [answers, alreadySubmitted]);

    const handleAnswer = (value: string) => {
        setAnswers(prev => ({
            ...prev,
            [QUESTIONS[currentStep].id]: value
        }));
    };

    const handleNext = async () => {
        if (currentStep < QUESTIONS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            await submitReview();
        }
    };

    const handleSkip = () => {
        handleAnswer('');
        handleNext();
    };

    const submitReview = async () => {
        if (!user) return;
        setIsSubmitting(true);

        try {
            const { data: review, error } = await supabase
                .from('weekly_reviews')
                .insert({
                    user_id: user.id,
                    week_start_date: new Date().toISOString(),
                    status: 'completed',
                    answers: answers
                })
                .select()
                .single();

            if (error) throw error;

            const { data: aiResponse, error: aiError } = await supabase.functions.invoke('submit-review', {
                body: { review_id: review.id }
            });

            if (aiError) throw aiError;

            console.log('AI Analysis:', aiResponse);
            setIsComplete(true);
            localStorage.removeItem('review_draft');

        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-4">
                <div className="flex items-center gap-1.5 mb-4">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 rounded-full bg-gray-300 animate-pulse"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
                <p className="text-gray-400 text-sm">Loading...</p>
            </div>
        );
    }

    // Already submitted state
    if (alreadySubmitted) {
        const submittedDateFormatted = submittedDate 
            ? new Date(submittedDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit'
            })
            : 'earlier this week';

        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 sm:p-8">
                <div className="max-w-md w-full text-center">
                    {/* Already submitted icon */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-500 flex items-center justify-center mx-auto mb-6 sm:mb-8">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    
                    <h2 
                        className="text-2xl sm:text-3xl font-light text-gray-900 mb-2 sm:mb-3"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
                    >
                        Already Submitted
                    </h2>
                    <p className="text-gray-500 text-sm sm:text-base mb-2">
                        You've already submitted your weekly review.
                    </p>
                    <p className="text-gray-400 text-xs mb-6 sm:mb-8">
                        Submitted on {submittedDateFormatted}
                    </p>

                    {/* Info card */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 sm:p-5 mb-6 sm:mb-8 text-left">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 text-sm mb-1">One review per week</h4>
                                <p className="text-gray-500 text-xs leading-relaxed">
                                    You can submit a new review next week. In the meantime, check your dashboard for insights and analytics.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.href = '/app'}
                        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all text-sm sm:text-base"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Success state
    if (isComplete) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center p-6 sm:p-8">
                <div className="max-w-md w-full text-center">
                    {/* Success icon */}
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-900 flex items-center justify-center mx-auto mb-6 sm:mb-8">
                        <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    
                    <h2 
                        className="text-2xl sm:text-3xl font-light text-gray-900 mb-2 sm:mb-3"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
                    >
                        Done.
                    </h2>
                    <p className="text-gray-500 text-sm sm:text-base mb-6 sm:mb-8">
                        Your weekly review has been submitted. Great job reflecting on your week.
                    </p>

                    {/* Email notification card */}
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 sm:p-5 mb-6 sm:mb-8 text-left">
                        <div className="flex items-start gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-medium text-gray-900 text-sm mb-1">Check your email</h4>
                                <p className="text-gray-500 text-xs leading-relaxed">
                                    We've sent a detailed summary of your review to your inbox. If you don't see it, please check your spam folder and mark it as "Not Spam" to ensure future emails arrive directly in your inbox.
                                </p>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => window.location.href = '/app'}
                        className="w-full sm:w-auto px-8 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all text-sm sm:text-base"
                    >
                        Go to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // Submitting state
    if (isSubmitting) {
        return (
            <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-4">
                <div className="flex items-center gap-1.5 mb-6 sm:mb-8">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-gray-300 animate-pulse"
                            style={{ animationDelay: `${i * 150}ms` }}
                        />
                    ))}
                </div>
                <h2 
                    className="text-xl sm:text-2xl font-light text-gray-900 mb-2"
                    style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
                >
                    Submitting...
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm">Please wait while we save your review.</p>
            </div>
        );
    }

    const progress = ((currentStep + 1) / QUESTIONS.length) * 100;

    return (
        <div className="relative w-full max-w-2xl mx-auto px-4 sm:px-0">
            <div className="relative bg-white rounded-2xl p-6 sm:p-8 md:p-12 shadow-sm border border-gray-100 min-h-[500px] sm:min-h-[600px] flex flex-col">
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                    <h1 
                        className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2"
                        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
                    >
                        Weekly Review
                    </h1>
                    <p className="text-gray-500 text-xs sm:text-sm">Take a moment to reflect on your week.</p>
                </div>

                {/* Progress Bar */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                        <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1 sm:h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gray-900 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <ReviewCard
                    question={QUESTIONS[currentStep].question}
                    description={QUESTIONS[currentStep].description}
                    placeholder={QUESTIONS[currentStep].placeholder}
                    value={answers[QUESTIONS[currentStep].id] || ''}
                    onChange={handleAnswer}
                    onNext={handleNext}
                    onSkip={handleSkip}
                    isLast={currentStep === QUESTIONS.length - 1}
                    type={QUESTIONS[currentStep].type as 'text' | 'rating'}
                />
            </div>
        </div>
    );
};
