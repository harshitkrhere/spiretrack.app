import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import { CalendarIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Skeleton } from '../components/ui/Skeleton';

interface ReviewHistoryItem {
    id: string;
    week_start_date: string;
    scores: {
        focus: number;
        mood: number;
        stress: number;
        sleep: number;
    };
    ai_output: {
        summary: string;
    };
}

export const History: React.FC = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<ReviewHistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReviews();
    }, [user]);

    const fetchReviews = async () => {
        if (!user) return;

        const { data, error } = await supabase
            .from('weekly_reviews')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .order('week_start_date', { ascending: false });

        if (error) {
            console.error('Error fetching history:', error);
        } else {
            setReviews(data || []);
        }
        setLoading(false);
    };

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        if (!window.confirm('Are you sure you want to delete this review?')) return;

        const { error } = await supabase
            .from('weekly_reviews')
            .delete()
            .eq('id', id);

        if (error) {
            alert('Error deleting review');
        } else {
            setReviews(reviews.filter(r => r.id !== id));
        }
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6 lg:p-8 space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">History</h1>
            </div>

            {reviews.length === 0 ? (
                <div className="text-center py-12 sm:py-20">
                    <p className="text-slate-500 mb-4 text-sm sm:text-base">No reviews found.</p>
                    <Link to="/app/review">
                        <Button>Start a Review</Button>
                    </Link>
                </div>
            ) : (
                <div className="grid gap-3 sm:gap-4">
                    {reviews.map((review) => (
                        <Link key={review.id} to={`/app/report/${review.id}`}>
                            <Card className="group hover:border-primary-200 transition-all">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex gap-3 sm:gap-4 min-w-0">
                                        <div className="mt-1 p-1.5 sm:p-2 bg-slate-50 rounded-lg text-slate-500 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors flex-shrink-0">
                                            <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                                                Week of {new Date(review.week_start_date).toLocaleDateString()}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">
                                                {review.ai_output?.summary || 'No summary available.'}
                                            </p>
                                            <div className="flex flex-wrap gap-2 sm:gap-4 mt-2 sm:mt-3 text-xs font-medium text-slate-600">
                                                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 sm:py-1 rounded">
                                                    Focus: {review.scores?.focus}/10
                                                </span>
                                                <span className="bg-purple-50 text-purple-700 px-2 py-0.5 sm:py-1 rounded">
                                                    Mood: {review.scores?.mood}/10
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-400 hover:text-red-600 hover:bg-red-50 flex-shrink-0"
                                        onClick={(e) => handleDelete(review.id, e)}
                                    >
                                        <TrashIcon className="h-4 w-4" />
                                    </Button>
                                </div>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
