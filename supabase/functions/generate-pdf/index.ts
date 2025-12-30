import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { jsPDF } from "https://esm.sh/jspdf@2.5.1"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const { review_id } = await req.json()

        if (!review_id) {
            throw new Error('Review ID is required')
        }

        // 1. Fetch review data
        const { data: review, error: fetchError } = await supabaseClient
            .from('weekly_reviews')
            .select('*, users(full_name)')
            .eq('id', review_id)
            .single()

        if (fetchError || !review) {
            throw new Error('Review not found')
        }

        const report = review.ai_output

        // 2. Generate PDF using jsPDF
        // Note: In a real production app with complex layout, we might use Puppeteer
        // or a dedicated PDF service (like DocRaptor or api2pdf).
        // For this MVP running on Edge, we'll use jsPDF to generate a simple text report.

        const doc = new jsPDF()

        // Title
        doc.setFontSize(20)
        doc.text("Weekly Review Report", 20, 20)

        doc.setFontSize(12)
        doc.text(`User: ${review.users?.full_name || 'User'}`, 20, 30)
        doc.text(`Date: ${new Date(review.week_start_date).toLocaleDateString()}`, 20, 35)

        // Summary
        doc.setFontSize(16)
        doc.text("Summary", 20, 50)
        doc.setFontSize(12)
        const splitSummary = doc.splitTextToSize(report.summary || '', 170)
        doc.text(splitSummary, 20, 60)

        // Scores
        let y = 80 + (splitSummary.length * 5)
        doc.text(`Focus: ${report.focus_score}/10`, 20, y)
        doc.text(`Mood: ${report.mood_score}/10`, 70, y)
        doc.text(`Stress: ${report.stress_score}/10`, 120, y)

        // Fix Plan
        y += 20
        doc.setFontSize(16)
        doc.text("Fix Plan", 20, y)
        doc.setFontSize(12)
        y += 10
        report.fix_plan?.forEach((item: string) => {
            doc.text(`• ${item}`, 20, y)
            y += 7
        })

        // 3. Return Base64 directly (Simpler for MVP, avoids Storage bucket setup)
        const pdfBase64 = doc.output('datauristring').split(',')[1]

        return new Response(
            JSON.stringify({ pdf: pdfBase64 }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
