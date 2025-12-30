import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { FocusTrendChart } from '../components/analytics/FocusTrendChart';
import { DeepWorkChart } from '../components/analytics/DeepWorkChart';
import { EmotionalLoadChart } from '../components/analytics/EmotionalLoadChart';
import { 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  MinusIcon,
  ArrowPathIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CalendarDaysIcon,
  ChevronDownIcon,
  DocumentTextIcon,
  FireIcon,
  HeartIcon,
  MoonIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface WeekInfo {
  week: number;
  week_start: string;
  has_data: boolean;
}

interface AnalyticsData {
  month: string;
  month_display: string;
  weeks_analyzed: number;
  has_data: boolean;
  weeks: WeekInfo[];
  focus_trend: { week: string; score: number }[];
  deep_work_hours: { week: string; hours: number }[];
  distractions: { name: string; severity: number; frequency: string }[];
  emotional_load: { week: string; load: number }[];
  slip_patterns: { pattern: string; severity: string; frequency: string }[];
  summary?: {
    avg_focus: number;
    avg_mood: number;
    avg_stress: number;
    avg_sleep: number;
    trend_direction: 'improving' | 'declining' | 'stable';
    key_insight?: string;
  };
}

function getMonthOptions(count: number): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  
  for (let i = 0; i < count; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
    const label = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    options.push({ value, label });
  }
  
  return options;
}

// Score indicator with circular progress
const MetricCard: React.FC<{
  label: string;
  value: number | null;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  color: string;
  isInverted?: boolean;
}> = ({ label, value, icon, trend, color, isInverted = false }) => {
  const displayValue = value !== null ? value.toFixed(1) : '—';
  const percentage = value !== null ? (isInverted ? (10 - value) : value) * 10 : 0;
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:border-gray-200 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend && value !== null && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' :
            trend === 'down' ? 'bg-red-50 text-red-600' :
            'bg-gray-50 text-gray-500'
          }`}>
            {trend === 'up' && <ArrowTrendingUpIcon className="w-3 h-3" />}
            {trend === 'down' && <ArrowTrendingDownIcon className="w-3 h-3" />}
            {trend === 'stable' && <MinusIcon className="w-3 h-3" />}
            {trend === 'up' ? 'Up' : trend === 'down' ? 'Down' : 'Stable'}
          </div>
        )}
      </div>
      
      <div className="mb-3">
        <span className="text-3xl font-semibold text-gray-900">{displayValue}</span>
        {value !== null && <span className="text-gray-400 text-lg ml-1">/10</span>}
      </div>
      
      <p className="text-sm text-gray-500 mb-3">{label}</p>
      
      {/* Progress bar */}
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full transition-all duration-500 ${
            percentage >= 70 ? 'bg-emerald-500' :
            percentage >= 40 ? 'bg-amber-500' :
            'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

const ChartCard: React.FC<{
  title: string;
  children: React.ReactNode;
  className?: string;
  hasData?: boolean;
}> = ({ title, children, className = '', hasData = true }) => (
  <div className={`bg-white rounded-2xl border border-gray-100 p-6 ${className}`}>
    <h3 className="text-base font-semibold text-gray-900 mb-6">{title}</h3>
    <div className="h-64">
      {hasData ? children : (
        <div className="h-full flex flex-col items-center justify-center text-gray-400">
          <ChartBarIcon className="w-10 h-10 mb-2 text-gray-300" />
          <p className="text-sm">No data available</p>
        </div>
      )}
    </div>
  </div>
);

export const Analytics: React.FC = () => {
  const monthOptions = useMemo(() => getMonthOptions(6), []);
  const [selectedMonth, setSelectedMonth] = useState(monthOptions[0].value);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [selectedMonth]);

  const fetchAnalytics = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      
      const { data: responseData, error: apiError } = await supabase.functions.invoke('generate-analytics', {
        body: { month: selectedMonth }
      });
      
      if (apiError) {
        setError('Unable to generate analytics. Please try again later.');
        setData(null);
      } else if (!responseData) {
        setError('No response from analytics service.');
        setData(null);
      } else if (responseData.error) {
        setError(responseData.error);
        setData(null);
      } else {
        setData(responseData);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    setSelectedWeek(null);
  };

  const handleWeekClick = (weekStart: string | null) => {
    setSelectedWeek(selectedWeek === weekStart ? null : weekStart);
  };

  const currentMonthLabel = monthOptions.find(m => m.value === selectedMonth)?.label || 'Select Month';
  const summary = data?.summary || null;
  const hasData = data?.has_data ?? false;

  const filteredFocusTrend = selectedWeek 
    ? data?.focus_trend?.filter(d => d.week === selectedWeek) || []
    : data?.focus_trend || [];
  
  const filteredDeepWork = selectedWeek
    ? data?.deep_work_hours?.filter(d => d.week === selectedWeek) || []
    : data?.deep_work_hours || [];
  
  const filteredEmotionalLoad = selectedWeek
    ? data?.emotional_load?.filter(d => d.week === selectedWeek) || []
    : data?.emotional_load || [];

  const displaySummary = useMemo(() => {
    if (!selectedWeek || !data) return summary;
    const weekData = data.focus_trend?.find(d => d.week === selectedWeek);
    const emotional = data.emotional_load?.find(d => d.week === selectedWeek);
    if (!weekData) return summary;
    
    return {
      avg_focus: (weekData.score ?? 50) / 10,
      avg_mood: summary?.avg_mood ?? 5,
      avg_stress: emotional ? (emotional.load ?? 50) / 10 : summary?.avg_stress ?? 5,
      avg_sleep: summary?.avg_sleep ?? 5,
      trend_direction: 'stable' as const,
      key_insight: `Week of ${new Date(selectedWeek).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    };
  }, [selectedWeek, data, summary]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-48 bg-gray-200 rounded-lg animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-40 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-80 bg-white rounded-2xl border border-gray-100 animate-pulse" />
            <div className="h-80 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
            <ExclamationTriangleIcon className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <button 
            onClick={() => fetchAnalytics(true)} 
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Retrying...' : 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 
                className="text-2xl font-semibold text-gray-900 tracking-tight"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
              >
                Analytics
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {hasData 
                  ? `${data?.weeks_analyzed} week${data?.weeks_analyzed !== 1 ? 's' : ''} of insights`
                  : 'No data yet'
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Month Selector */}
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="appearance-none pl-10 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium hover:border-gray-300 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  {monthOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button 
                onClick={() => fetchAnalytics(true)}
                disabled={refreshing}
                className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Empty State */}
        {!hasData && (
          <div className="mb-10">
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <ChartBarIcon className="w-8 h-8 text-gray-400" />
              </div>
              
              <h2 
                className="text-2xl font-semibold text-gray-900 mb-2"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}
              >
                No data yet.
              </h2>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Submit your first weekly review to unlock insights about your focus, mood, and productivity.
              </p>
              
              <a
                href="/app/review"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all"
              >
                <DocumentTextIcon className="w-5 h-5" />
                Submit Review
              </a>
            </div>
          </div>
        )}

        {/* Week Pills */}
        {data?.weeks && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">
                {selectedWeek ? 'Selected Week' : 'All Weeks'}
              </h3>
              {selectedWeek && (
                <button
                  onClick={() => setSelectedWeek(null)}
                  className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {data.weeks.map(week => (
                <button 
                  key={week.week}
                  onClick={() => week.has_data && handleWeekClick(week.week_start)}
                  disabled={!week.has_data}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedWeek === week.week_start
                      ? 'bg-gray-900 text-white'
                      : week.has_data 
                        ? 'bg-white border border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50' 
                        : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Week {week.week}
                  <span className="ml-1.5 opacity-60">
                    {new Date(week.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Focus Score"
            value={displaySummary?.avg_focus ?? null}
            icon={<BoltIcon className="w-5 h-5 text-white" />}
            color="bg-blue-500"
            trend={!selectedWeek && displaySummary?.trend_direction === 'improving' ? 'up' : 
                   !selectedWeek && displaySummary?.trend_direction === 'declining' ? 'down' : undefined}
          />
          <MetricCard
            label="Mood Score"
            value={displaySummary?.avg_mood ?? null}
            icon={<HeartIcon className="w-5 h-5 text-white" />}
            color="bg-rose-500"
          />
          <MetricCard
            label="Stress Level"
            value={displaySummary?.avg_stress ?? null}
            icon={<FireIcon className="w-5 h-5 text-white" />}
            color="bg-amber-500"
            isInverted={true}
          />
          <MetricCard
            label="Sleep Quality"
            value={displaySummary?.avg_sleep ?? null}
            icon={<MoonIcon className="w-5 h-5 text-white" />}
            color="bg-indigo-500"
          />
        </div>

        {/* Key Insight */}
        {displaySummary?.key_insight && (
          <div className="mb-8 p-4 bg-white rounded-xl border border-gray-100">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">{selectedWeek ? 'Viewing:' : 'Insight:'}</span>{' '}
              {displaySummary.key_insight}
            </p>
          </div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <ChartCard title="Focus Trend" hasData={filteredFocusTrend.length > 0}>
            <FocusTrendChart data={filteredFocusTrend} />
          </ChartCard>
          <ChartCard title="Deep Work Hours" hasData={filteredDeepWork.length > 0}>
            <DeepWorkChart data={filteredDeepWork} />
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <ChartCard title="Emotional Load" hasData={filteredEmotionalLoad.length > 0}>
            <EmotionalLoadChart data={filteredEmotionalLoad} />
          </ChartCard>
        </div>

        {/* Patterns */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-6">Recurring Patterns</h3>
          {hasData && (data?.slip_patterns?.length ?? 0) > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data?.slip_patterns.map((pattern, index) => (
                <div 
                  key={index} 
                  className="p-4 rounded-xl bg-gray-50 border border-gray-100 hover:border-gray-200 transition-all"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="font-medium text-gray-900 text-sm line-clamp-2">{pattern.pattern}</h4>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full flex-shrink-0 ${
                      pattern.severity === 'high' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-600'
                    }`}>
                      {pattern.frequency}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">
                    {pattern.severity === 'high' ? 'High impact' : 'Moderate impact'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">
                {hasData ? 'No recurring patterns detected' : 'No data available'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
