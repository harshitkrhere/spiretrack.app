import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import { LoadingScreen } from '../components/ui/LoadingScreen';

interface Review {
    id: string;
    week_start_date: string;
    created_at: string;
    scores: {
        focus: number;
        mood: number;
        stress: number;
        sleep: number;
    };
}

interface DashboardState {
    reviews: Review[];
    totalCount: number;
    streak: number;
    lastDate: string | null;
    avgFocus: number;
    avgMood: number;
    trend: 'improving' | 'stable' | 'declining' | 'insufficient';
}

/**
 * Dashboard — Custom System Design
 * 
 * Principles:
 * - Insight before action
 * - Structure before decoration
 * - Typography and spacing over visuals
 * - Brand color (#14B670) used ONLY for primary CTA
 * - Works completely in grayscale
 */
export const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [state, setState] = useState<DashboardState | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            if (!user) return;

            const { data: reviews, error } = await supabase
                .from('weekly_reviews')
                .select('id, week_start_date, created_at, scores')
                .eq('user_id', user.id)
                .eq('status', 'completed')
                .order('created_at', { ascending: false })
                .limit(12);

            if (error) {
                console.error('Dashboard fetch error:', error);
                setLoading(false);
                return;
            }

            if (reviews && reviews.length > 0) {
                // Calculate metrics
                const focusScores = reviews.map(r => r.scores?.focus || 0).filter(s => s > 0);
                const moodScores = reviews.map(r => r.scores?.mood || 0).filter(s => s > 0);
                
                const avgFocus = focusScores.length > 0 
                    ? Math.round(focusScores.reduce((a, b) => a + b, 0) / focusScores.length) 
                    : 0;
                const avgMood = moodScores.length > 0 
                    ? Math.round(moodScores.reduce((a, b) => a + b, 0) / moodScores.length) 
                    : 0;

                // Calculate trend (compare recent 3 vs older 3)
                let trend: DashboardState['trend'] = 'insufficient';
                if (reviews.length >= 4) {
                    const recent = reviews.slice(0, 3);
                    const older = reviews.slice(3, 6);
                    
                    const recentAvg = recent.reduce((sum, r) => sum + (r.scores?.focus || 0), 0) / recent.length;
                    const olderAvg = older.reduce((sum, r) => sum + (r.scores?.focus || 0), 0) / older.length;
                    
                    if (recentAvg > olderAvg + 0.5) trend = 'improving';
                    else if (recentAvg < olderAvg - 0.5) trend = 'declining';
                    else trend = 'stable';
                }

                // Calculate streak
                let streak = 0;
                const now = new Date();
                const oneWeek = 7 * 24 * 60 * 60 * 1000;
                
                for (let i = 0; i < reviews.length; i++) {
                    const reviewDate = new Date(reviews[i].week_start_date);
                    const expectedDate = new Date(now.getTime() - (i * oneWeek));
                    const diffDays = Math.abs((expectedDate.getTime() - reviewDate.getTime()) / (24 * 60 * 60 * 1000));
                    
                    if (diffDays <= 10) streak++;
                    else break;
                }

                setState({
                    reviews,
                    totalCount: reviews.length,
                    streak,
                    lastDate: reviews[0]?.week_start_date || null,
                    avgFocus,
                    avgMood,
                    trend
                });
            } else {
                setState({
                    reviews: [],
                    totalCount: 0,
                    streak: 0,
                    lastDate: null,
                    avgFocus: 0,
                    avgMood: 0,
                    trend: 'insufficient'
                });
            }
            setLoading(false);
        };

        fetchData();
    }, [user]);

    if (loading) return <LoadingScreen message="Loading" />;

    const getTimeAgo = (dateString: string): string => {
        const date = new Date(dateString);
        const now = new Date();
        const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'today';
        if (diffDays === 1) return 'yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 14) return 'last week';
        return `${Math.floor(diffDays / 7)} weeks ago`;
    };

    const formatDateCompact = (dateString: string): string => {
        return new Date(dateString).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    };

    /**
     * DEDUPLICATION & CLASSIFICATION LOGIC
     * 
     * Step 1: Group all reviews by week_start_date (canonical identifier)
     * Step 2: Aggregate scores per unique week
     * Step 3: Classify each unique week into EXACTLY ONE category
     * 
     * Category Rules (mutually exclusive, priority order):
     * - Strong: avg >= 7
     * - Mixed: avg >= 4 AND avg < 7  
     * - Challenging: avg < 4
     */
    const groupByQuality = (reviews: Review[]) => {
        // Step 1: Deduplicate by week_start_date, keeping most recent review per week
        const weekMap = new Map<string, Review>();
        
        reviews.forEach(r => {
            const weekKey = r.week_start_date; // Canonical week identifier
            const existing = weekMap.get(weekKey);
            
            if (!existing) {
                weekMap.set(weekKey, r);
            } else {
                // Keep the more recent review (by created_at) for this week
                if (new Date(r.created_at) > new Date(existing.created_at)) {
                    weekMap.set(weekKey, r);
                }
            }
        });

        // Step 2: Convert to array of unique weeks
        const uniqueWeeks = Array.from(weekMap.values());

        // Step 3: Classify each unique week into EXACTLY ONE category
        const high: Review[] = [];
        const moderate: Review[] = [];
        const low: Review[] = [];

        uniqueWeeks.forEach(week => {
            const focus = week.scores?.focus || 0;
            const mood = week.scores?.mood || 0;
            const avg = (focus + mood) / 2;

            // Mutually exclusive classification with strict priority
            if (avg >= 7) {
                high.push(week);
            } else if (avg >= 4) {
                moderate.push(week);
            } else {
                low.push(week);
            }
        });

        // Validation: Assert no duplicates
        const totalClassified = high.length + moderate.length + low.length;
        console.assert(
            totalClassified === uniqueWeeks.length,
            `Classification error: ${totalClassified} classified vs ${uniqueWeeks.length} unique weeks`
        );

        return { high, moderate, low };
    };

    const grouped = state ? groupByQuality(state.reviews.slice(0, 12)) : { high: [], moderate: [], low: [] };

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                
                {/* ═══════════════════════════════════════════
                    HEADER — Typography hierarchy only
                ═══════════════════════════════════════════ */}
                <header className="mb-10 sm:mb-16">
                    <h1 className="text-2xl sm:text-[28px] font-medium text-neutral-900 tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-neutral-400 text-xs sm:text-sm mt-1 sm:mt-1.5 font-normal">
                        Weekly review system
                    </p>
                </header>

                {/* ═══════════════════════════════════════════
                    STATUS SUMMARY — Analytical observation, not stat cards
                ═══════════════════════════════════════════ */}
                {state && state.totalCount > 0 ? (
                    <section className="mb-16">
                        <div className="text-neutral-600 text-[15px] leading-relaxed">
                            <span className="text-neutral-900 font-medium">{state.totalCount} reviews</span>
                            {' '}completed
                            {state.streak > 1 && (
                                <span className="text-neutral-500">
                                    {' '}· {state.streak}-week streak
                                </span>
                            )}
                            {state.lastDate && (
                                <span className="text-neutral-400">
                                    {' '}· last entry {getTimeAgo(state.lastDate)}
                                </span>
                            )}
                        </div>

                        {state.trend !== 'insufficient' && (
                            <div className="mt-4 text-[15px]">
                                <span className="text-neutral-400">Pattern: </span>
                                <span className="text-neutral-700">
                                    {state.trend === 'improving' && 'Focus scores trending upward over recent weeks'}
                                    {state.trend === 'stable' && 'Consistent performance across recent reviews'}
                                    {state.trend === 'declining' && 'Focus metrics lower than previous period'}
                                </span>
                            </div>
                        )}

                        {state.avgFocus > 0 && (
                            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-neutral-100">
                                <div className="flex gap-8 sm:gap-12">
                                    <div>
                                        <div className="text-xl sm:text-2xl font-light text-neutral-900">{state.avgFocus}</div>
                                        <div className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider mt-1">Avg Focus</div>
                                    </div>
                                    <div>
                                        <div className="text-xl sm:text-2xl font-light text-neutral-900">{state.avgMood}</div>
                                        <div className="text-[10px] sm:text-xs text-neutral-400 uppercase tracking-wider mt-1">Avg Mood</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                ) : (
                    <section className="mb-16">
                        <p className="text-neutral-500 text-[15px]">
                            No reviews recorded yet. Start tracking to see patterns.
                        </p>
                    </section>
                )}

                {/* ═══════════════════════════════════════════
                    TWO-COLUMN LAYOUT — Review Intelligence + Insights
                ═══════════════════════════════════════════ */}
                {state && state.reviews.length > 0 && (
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-16 mb-10 sm:mb-16">
                        
                        {/* LEFT: Review Intelligence — Grouped by quality */}
                        <section className="lg:col-span-3">
                            <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-6">
                                Review Intelligence
                            </h2>

                            {/* High Quality Reviews */}
                            {grouped.high.length > 0 && (
                                <div className="mb-8">
                                    <div className="text-[13px] text-neutral-500 mb-3">
                                        Strong weeks ({grouped.high.length})
                                    </div>
                                    <div className="space-y-2">
                                        {grouped.high.slice(0, 3).map(review => (
                                            <ReviewRow key={review.id} review={review} formatDate={formatDateCompact} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Moderate Reviews */}
                            {grouped.moderate.length > 0 && (
                                <div className="mb-8">
                                    <div className="text-[13px] text-neutral-500 mb-3">
                                        Mixed weeks ({grouped.moderate.length})
                                    </div>
                                    <div className="space-y-2">
                                        {grouped.moderate.slice(0, 3).map(review => (
                                            <ReviewRow key={review.id} review={review} formatDate={formatDateCompact} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Low Quality Reviews */}
                            {grouped.low.length > 0 && (
                                <div className="mb-8">
                                    <div className="text-[13px] text-neutral-500 mb-3">
                                        Challenging weeks ({grouped.low.length})
                                    </div>
                                    <div className="space-y-2">
                                        {grouped.low.slice(0, 2).map(review => (
                                            <ReviewRow key={review.id} review={review} formatDate={formatDateCompact} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {state.reviews.length > 8 && (
                                <Link 
                                    to="/app/history"
                                    className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
                                >
                                    View all {state.totalCount} reviews →
                                </Link>
                            )}
                        </section>

                        {/* RIGHT: Insight Area */}
                        <aside className="lg:col-span-2">
                            <h2 className="text-xs font-medium text-neutral-400 uppercase tracking-widest mb-6">
                                Observations
                            </h2>

                            <div className="space-y-6 text-[14px] leading-relaxed text-neutral-600">
                                {state.avgFocus >= 7 && (
                                    <p>
                                        Focus levels have been consistently above average. 
                                        This pattern suggests effective work routines.
                                    </p>
                                )}

                                {state.avgFocus > 0 && state.avgFocus < 5 && (
                                    <p>
                                        Focus scores indicate room for improvement. 
                                        Consider reviewing recent blockers.
                                    </p>
                                )}

                                {state.streak >= 4 && (
                                    <p>
                                        {state.streak}-week consistency. Sustained tracking 
                                        correlates with better self-awareness.
                                    </p>
                                )}

                                {grouped.high.length > grouped.low.length && (
                                    <p className="text-neutral-500">
                                        More strong weeks than challenging ones in this period.
                                    </p>
                                )}

                                {state.reviews.length < 4 && (
                                    <p className="text-neutral-400">
                                        More data needed to identify meaningful patterns.
                                    </p>
                                )}
                            </div>
                        </aside>
                    </div>
                )}

                {/* ═══════════════════════════════════════════
                    PRIMARY ACTION — Appears after insight
                ═══════════════════════════════════════════ */}
                <section className="pt-8 border-t border-neutral-100">
                    <Link to="/app/review">
                        <button 
                            className="px-5 py-2.5 bg-[#14B670] text-white text-sm font-medium rounded-md hover:bg-[#12a562] transition-colors"
                        >
                            New Review
                        </button>
                    </Link>

                    <div className="mt-6 sm:mt-8 flex flex-wrap gap-4 sm:gap-6">
                        <Link 
                            to="/app/team"
                            className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                            Teams
                        </Link>
                        <Link 
                            to="/app/analytics"
                            className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                            Analytics
                        </Link>
                        <Link 
                            to="/app/settings"
                            className="text-[13px] text-neutral-400 hover:text-neutral-600 transition-colors"
                        >
                            Settings
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════

interface ReviewRowProps {
    review: Review;
    formatDate: (date: string) => string;
}

const ReviewRow: React.FC<ReviewRowProps> = ({ review, formatDate }) => {
    const focus = review.scores?.focus || 0;
    const mood = review.scores?.mood || 0;

    return (
        <Link
            to={`/app/report/${review.id}`}
            className="flex items-center justify-between py-2 px-3 -mx-3 rounded hover:bg-neutral-50 transition-colors group"
        >
            <div className="flex items-baseline gap-3">
                <span className="text-neutral-900 text-[14px] font-medium">
                    {formatDate(review.week_start_date)}
                </span>
                <span className="text-neutral-400 text-[13px]">
                    F{focus} · M{mood}
                </span>
            </div>
            <span className="text-neutral-300 text-xs group-hover:text-neutral-500 transition-colors">
                →
            </span>
        </Link>
    );
};

export default Dashboard;
