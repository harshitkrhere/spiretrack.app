import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Get first day of a month
function getMonthStart(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`;
}

// Format month for display
function formatMonth(monthStr: string): string {
  const date = new Date(monthStr);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

// Get all weeks in a month (Sunday-based, starting from day 1)
function getWeeksInMonth(monthStr: string): { week: number; weekStart: string }[] {
  const weeks: { week: number; weekStart: string }[] = [];
  const monthDate = new Date(monthStr);
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  
  // Always start from day 1 of the month
  let current = new Date(year, month, 1);
  let weekNum = 1;
  
  // First week starts on day 1 (regardless of day of week)
  weeks.push({
    week: weekNum,
    weekStart: current.toISOString().split('T')[0]
  });
  weekNum++;
  
  // Find the next Sunday after day 1 for subsequent weeks
  // Move to the next Sunday (day 0)
  current.setDate(current.getDate() + (7 - current.getDay()));
  
  // Continue adding weeks while still in the same month
  while (current.getMonth() === month && weekNum <= 6) {
    weeks.push({
      week: weekNum,
      weekStart: current.toISOString().split('T')[0]
    });
    current.setDate(current.getDate() + 7);
    weekNum++;
  }
  
  return weeks;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body for month parameter
    let selectedMonth: string;
    try {
      const body = await req.json();
      selectedMonth = body.month || getMonthStart(new Date());
    } catch {
      selectedMonth = getMonthStart(new Date());
    }

    console.log(`[generate-analytics] Fetching for month: ${selectedMonth}`);

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // 1. Get User ID
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    console.log(`[generate-analytics] User: ${user.id}`);

    // 2. Calculate month boundaries
    const monthDate = new Date(selectedMonth);
    const nextMonth = new Date(monthDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const monthEnd = nextMonth.toISOString().split('T')[0];

    console.log(`[generate-analytics] Date range: ${selectedMonth} to ${monthEnd}`);

    // 3. Fetch reviews for ONLY this specific month
    const { data: reviews, error: reviewsError } = await supabaseClient
      .from('weekly_reviews')
      .select('id, week_start_date, answers, ai_output, scores, status')
      .eq('user_id', user.id)
      .gte('week_start_date', selectedMonth)
      .lt('week_start_date', monthEnd)
      .order('week_start_date', { ascending: true });

    if (reviewsError) {
      console.error('[generate-analytics] Reviews query error:', reviewsError);
      throw reviewsError;
    }

    console.log(`[generate-analytics] Found ${reviews?.length || 0} reviews`);

    // 4. Build weeks structure
    const weeksInMonth = getWeeksInMonth(selectedMonth);
    console.log(`[generate-analytics] Weeks in month:`, weeksInMonth);

    // 5. Match reviews to weeks and extract scores
    const weeksWithData = weeksInMonth.map(w => {
      // Find review where week_start_date falls within this week (Monday to Sunday)
      const weekEnd = new Date(w.weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7); // Add 7 days to get next Monday
      const weekEndStr = weekEnd.toISOString().split('T')[0];
      
      const review = reviews?.find(r => 
        r.week_start_date >= w.weekStart && 
        r.week_start_date < weekEndStr && 
        r.status === 'completed'
      );
      
      return {
        week: w.week,
        weekStart: w.weekStart,
        hasData: !!review,
        scores: review?.scores || null,
        summary: review?.ai_output?.summary || null
      };
    });

    const actualWeeks = weeksWithData.filter(w => w.hasData);
    console.log(`[generate-analytics] Weeks with data:`, actualWeeks.length);

    // If no completed reviews for this month
    if (actualWeeks.length === 0) {
      console.log('[generate-analytics] No completed reviews, returning empty');
      const emptyAnalytics = {
        month: selectedMonth,
        month_display: formatMonth(selectedMonth),
        weeks_analyzed: 0,
        has_data: false,
        weeks: weeksWithData.map(w => ({
          week: w.week,
          week_start: w.weekStart,
          has_data: false
        })),
        focus_trend: [],
        deep_work_hours: [],
        emotional_load: [],
        slip_patterns: [],
        summary: null
      };

      return new Response(
        JSON.stringify(emptyAnalytics),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. Build REAL data from actual review scores and answers
    const focusTrend = actualWeeks.map(w => ({
      week: w.weekStart,
      score: (w.scores?.focus || 5) * 10 // Scale 1-10 to 0-100 for chart display
    }));

    const moodTrend = actualWeeks.map(w => ({
      week: w.weekStart,
      score: (w.scores?.mood || 5) * 10
    }));

    const stressTrend = actualWeeks.map(w => ({
      week: w.weekStart,
      score: (w.scores?.stress || 5) * 10
    }));

    const sleepTrend = actualWeeks.map(w => ({
      week: w.weekStart,
      score: (w.scores?.sleep || 5) * 10
    }));

    // Deep Work Hours - Estimate from focus score (focus 1-10 → 0-8 hours)
    const deepWorkHours = actualWeeks.map(w => ({
      week: w.weekStart,
      hours: Math.round((w.scores?.focus || 5) * 0.8) // 1→0.8hrs, 10→8hrs
    }));

    // Emotional Load - Calculate from stress and mood (higher stress + lower mood = higher load)
    const emotionalLoad = actualWeeks.map(w => ({
      week: w.weekStart,
      load: Math.min(100, Math.max(0, ((w.scores?.stress || 5) * 15) - ((w.scores?.mood || 5) * 5)))
    }));

    // 7. Extract Patterns from "learning" answers
    const allPatternsMap = new Map<string, number>();
    reviews?.forEach(review => {
      const learning = review.answers?.learning || '';
      if (learning && learning.length > 10) {
        // Extract key insights
        const insights = learning.split(/[,;.\n]/)
          .map(s => s.trim())
          .filter(s => s.length > 10 && s.length < 80);
        
        insights.forEach(insight => {
          if (insight) {
            allPatternsMap.set(insight, (allPatternsMap.get(insight) || 0) + 1);
          }
        });
      }
    });
    
    const slipPatterns = Array.from(allPatternsMap.entries())
      .map(([pattern, count]) => ({ 
        pattern: pattern.charAt(0).toUpperCase() + pattern.slice(1),
        severity: count > 1 ? 'high' : 'medium',
        frequency: count > 1 ? `${count}x` : 'once'
      }))
      .sort((a, b) => {
        const aCount = parseInt(a.frequency) || 1;
        const bCount = parseInt(b.frequency) || 1;
        return bCount - aCount;
      })
      .slice(0, 5);

    // 9. Calculate averages from REAL data
    const avgFocus = actualWeeks.reduce((sum, w) => sum + (w.scores?.focus || 5), 0) / actualWeeks.length;
    const avgMood = actualWeeks.reduce((sum, w) => sum + (w.scores?.mood || 5), 0) / actualWeeks.length;
    const avgStress = actualWeeks.reduce((sum, w) => sum + (w.scores?.stress || 5), 0) / actualWeeks.length;
    const avgSleep = actualWeeks.reduce((sum, w) => sum + (w.scores?.sleep || 5), 0) / actualWeeks.length;

    // 10. Determine trend (if more than 1 week)
    let trendDirection: 'improving' | 'declining' | 'stable' = 'stable';
    if (actualWeeks.length >= 2) {
      const firstFocus = actualWeeks[0].scores?.focus || 5;
      const lastFocus = actualWeeks[actualWeeks.length - 1].scores?.focus || 5;
      if (lastFocus > firstFocus + 1) trendDirection = 'improving';
      else if (lastFocus < firstFocus - 1) trendDirection = 'declining';
    }

    // 11. Build analytics response with REAL extracted data
    const analyticsData = {
      month: selectedMonth,
      month_display: formatMonth(selectedMonth),
      weeks_analyzed: actualWeeks.length,
      has_data: true,
      weeks: weeksWithData.map(w => ({
        week: w.week,
        week_start: w.weekStart,
        has_data: w.hasData
      })),
      focus_trend: focusTrend,
      mood_trend: moodTrend,
      stress_trend: stressTrend,
      sleep_trend: sleepTrend,
      deep_work_hours: deepWorkHours,
      emotional_load: emotionalLoad,
      slip_patterns: slipPatterns,
      summary: {
        avg_focus: Math.round(avgFocus * 10) / 10,
        avg_mood: Math.round(avgMood * 10) / 10,
        avg_stress: Math.round(avgStress * 10) / 10,
        avg_sleep: Math.round(avgSleep * 10) / 10,
        trend_direction: trendDirection,
        key_insight: `${actualWeeks.length} week${actualWeeks.length > 1 ? 's' : ''} of real data in ${formatMonth(selectedMonth)}`
      }
    };

    console.log(`[generate-analytics] Success - returning REAL extracted data for ${actualWeeks.length} weeks`);

    return new Response(
      JSON.stringify(analyticsData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('[generate-analytics] Error:', error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
