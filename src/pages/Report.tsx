import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ArrowLeftIcon, LightBulbIcon, ExclamationTriangleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { LoadingScreen } from '../components/ui/LoadingScreen';
import { exportIndividualReviewToExcel, exportWeeklyBriefToPdf } from '../lib/exportUtils';

interface NextWeekActions {
    must_do: string[];
    stop_doing: string[];
    experiment: string;
}

interface ReportData {
    executive_summary?: string;
    key_patterns?: string[];
    root_causes?: string[];
    hidden_risks?: string[];
    leverage_points?: string[];
    next_week_actions?: NextWeekActions;
    accountability_statement?: string;
    summary?: string;
    fix_plan?: string[];
    blockers?: string[];
    call_out?: string;
    tags?: string[];
    focus_score: number;
    mood_score: number;
    stress_score: number;
    sleep_score: number;
}

function normalizeReportData(data: ReportData): ReportData {
    return {
        ...data,
        executive_summary: data.executive_summary || data.summary || 'No analysis available.',
        key_patterns: data.key_patterns?.length ? data.key_patterns : (data.tags || []),
        root_causes: data.root_causes?.length ? data.root_causes : (data.blockers || []),
        hidden_risks: data.hidden_risks || [],
        leverage_points: data.leverage_points?.length ? data.leverage_points : (data.fix_plan || []),
        next_week_actions: data.next_week_actions || {
            must_do: data.fix_plan || [],
            stop_doing: [],
            experiment: ''
        },
        accountability_statement: data.accountability_statement || data.call_out || ''
    };
}

const Report: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [weekStart, setWeekStart] = useState<Date | null>(null);
    const [showExportMenu, setShowExportMenu] = useState(false);

    useEffect(() => {
        const fetchReport = async () => {
            if (!id) {
                setError('No report ID provided.');
                setLoading(false);
                return;
            }

            try {
                const { data: review, error: fetchError } = await supabase
                    .from('weekly_reviews')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (fetchError) throw fetchError;

                if (review) {
                    setWeekStart(new Date(review.week_start_date));
                    
                    if (review.status === 'completed' && review.ai_output) {
                        const normalized = normalizeReportData(review.ai_output);
                        setData(normalized);
                    } else if (review.status === 'draft' || review.status === 'processing') {
                        setProcessing(true);
                        const interval = setInterval(async () => {
                            const { data: updated } = await supabase
                                .from('weekly_reviews')
                                .select('status, ai_output')
                                .eq('id', id)
                                .single();
                            
                            if (updated?.status === 'completed' && updated.ai_output) {
                                setData(normalizeReportData(updated.ai_output));
                                setProcessing(false);
                                clearInterval(interval);
                            }
                        }, 1000);
                        return () => clearInterval(interval);
                    }
                }
            } catch (err) {
                console.error('Error fetching report:', err);
                setError('Failed to load report.');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [id]);

    const handleExcelExport = async () => {
        if (!data) return;
        try {
            const exportDate = weekStart && !isNaN(weekStart.getTime()) ? weekStart : new Date();
            await exportIndividualReviewToExcel({ report: data, weekStart: exportDate });
        } catch (err) {
            console.error('Excel export failed:', err);
            alert('Failed to export. Please try again.');
        }
    };

    const handlePdfExport = async () => {
        if (!data) return;
        try {
            const exportDate = weekStart && !isNaN(weekStart.getTime()) ? weekStart : new Date();
            await exportWeeklyBriefToPdf(data, 'Personal Review', exportDate);
        } catch (err) {
            console.error('PDF export failed:', err);
            alert('Failed to export PDF. Please try again.');
        }
    };

    if (loading) return <LoadingScreen message="Loading report" />;
    if (processing) return <LoadingScreen message="Generating analysis" />;

    if (error || !data) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <p className="text-slate-900 font-medium mb-4">{error || 'No report available'}</p>
                <button 
                    onClick={() => navigate('/app/review')}
                    className="px-4 py-2 text-sm bg-slate-900 text-white rounded-lg"
                >
                    Start Review
                </button>
            </div>
        );
    }

    const endDate = weekStart ? new Date(weekStart) : new Date();
    endDate.setDate(endDate.getDate() + 6);

    const metrics = [
        { label: 'Focus', value: data.focus_score || 0, color: '#3B82F6', icon: '🎯' },
        { label: 'Mood', value: data.mood_score || 0, color: '#22C55E', icon: '😊' },
        { label: 'Stress', value: data.stress_score || 0, color: '#EAB308', icon: '😰' },
        { label: 'Sleep', value: data.sleep_score || 0, color: '#A855F7', icon: '😴' },
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-slate-600 text-xs sm:text-sm mb-4 sm:mb-6"
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    Back
                </button>

                {/* Header */}
                <header className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                            <p className="text-[10px] sm:text-xs text-slate-500 uppercase tracking-widest mb-1">
                                Personal Report • Confidential
                            </p>
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">
                                Weekly Performance Report
                            </h1>
                            {weekStart && !isNaN(weekStart.getTime()) && (
                                <p className="text-slate-600 mt-1 text-sm sm:text-base">
                                    Period: {format(weekStart, 'MMM d, yyyy')} – {format(endDate, 'MMM d, yyyy')}
                                </p>
                            )}
                        </div>
                        <div className="relative">
                            <button
                                onClick={() => setShowExportMenu(!showExportMenu)}
                                className="flex items-center gap-2 px-4 py-2 text-xs uppercase tracking-wider font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 shadow-sm"
                            >
                                <ArrowDownTrayIcon className="w-4 h-4" />
                                Export
                                <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>
                            {showExportMenu && (
                                <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-10">
                                    <button
                                        onClick={() => { handleExcelExport(); setShowExportMenu(false); }}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Excel (.xlsx)
                                    </button>
                                    <div className="border-t border-slate-100 my-1" />
                                    <button
                                        onClick={() => { handlePdfExport(); setShowExportMenu(false); }}
                                        className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                        </svg>
                                        PDF Brief
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Gauge Cards */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 mb-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                        {metrics.map((metric) => (
                            <GaugeCard 
                                key={metric.label}
                                label={metric.label}
                                value={metric.value}
                                color={metric.color}
                                icon={metric.icon}
                            />
                        ))}
                    </div>
                </div>

                {/* Two Column Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    
                    {/* Executive Summary */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                            Executive Summary
                        </h3>
                        <p className="text-slate-600 leading-relaxed text-sm">
                            {data.executive_summary}
                        </p>
                    </div>

                    {/* Key Patterns */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                            Key Patterns
                        </h3>
                        <div className="space-y-3">
                            {data.key_patterns?.length ? (
                                data.key_patterns.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <LightBulbIcon className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <p className="text-slate-600 text-sm leading-relaxed">{item}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-slate-400 text-sm italic">No patterns identified.</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Hidden Risks */}
                {data.hidden_risks && data.hidden_risks.length > 0 && (
                    <div className="bg-amber-50 rounded-2xl border border-amber-100 p-6 mb-6">
                        <h3 className="text-sm font-semibold text-amber-900 uppercase tracking-wider mb-4">
                            ⚠️ Hidden Risks
                        </h3>
                        <div className="space-y-3">
                            {data.hidden_risks.map((item, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <ExclamationTriangleIcon className="w-4 h-4 text-amber-700" />
                                    </div>
                                    <p className="text-amber-900 text-sm leading-relaxed">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Priority Actions */}
                {data.next_week_actions && data.next_week_actions.must_do && data.next_week_actions.must_do.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                        <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                            Priority Actions
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            {data.next_week_actions.must_do.slice(0, 4).map((item, i) => (
                                <div key={i} className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl">
                                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-semibold">
                                        {i + 1}
                                    </span>
                                    <p className="text-slate-700 text-sm">{item}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Accountability Statement */}
                {data.accountability_statement && (
                    <div className="bg-slate-900 text-white rounded-2xl p-6 mb-6">
                        <p className="text-lg font-medium leading-relaxed text-center">
                            "{data.accountability_statement}"
                        </p>
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center text-xs text-slate-400 pt-4">
                    SpireTrack • Generated {format(new Date(), 'MMM d, yyyy')}
                </footer>
            </div>
        </div>
    );
};

// === Gauge Component ===

const GaugeCard: React.FC<{
    label: string;
    value: number;
    color: string;
    icon: string;
}> = ({ label, value, color, icon }) => {
    // Scores are 0-10, convert to percentage for gauge
    const percentage = Math.min(100, Math.max(0, value * 10));
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference * 0.5;
    
    return (
        <div className="flex flex-col items-center">
            {/* Gauge SVG */}
            <div className="relative w-24 h-14 mb-2">
                <svg 
                    className="w-24 h-24 absolute -top-5 left-0" 
                    viewBox="0 0 100 100"
                >
                    {/* Background arc */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={circumference * 0.5}
                        transform="rotate(180 50 50)"
                    />
                    {/* Colored arc */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={color}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset + circumference * 0.5}
                        transform="rotate(180 50 50)"
                    />
                </svg>
                {/* Icon */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-lg">
                    {icon}
                </div>
            </div>
            
            {/* Value */}
            <div className="text-center">
                <span className="text-2xl font-semibold text-slate-900">{value}</span>
                <span className="text-slate-400 text-sm ml-0.5">/ 10</span>
            </div>
            
            {/* Label */}
            <p className="text-xs text-slate-500 uppercase tracking-wider mt-1">{label}</p>
        </div>
    );
};

export default Report;
