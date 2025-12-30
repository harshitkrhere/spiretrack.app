/**
 * Executive Brief PDF Export
 * Generates professional, executive-grade PDF briefs from AI insights
 * Minimalist design: white background, clean typography, no gradients
 */

import jsPDF from 'jspdf';
import { format, getWeek } from 'date-fns';

// ========================================
// TYPES
// ========================================

type ContextType = 'weekly_report' | 'team_insight' | 'decision_analysis' | 'risk_flag';

interface ExecutiveBriefOptions {
  contextType: ContextType;
  aiOutput: Record<string, any>;
  generatedAt?: Date;
  entityName?: string; // Team name, user name, decision name
}

// ========================================
// DESIGN CONSTANTS
// ========================================

const COLORS = {
  primary: '#1E293B',     // Slate 800 - main text
  secondary: '#64748B',   // Slate 500 - secondary text
  accent: '#3B82F6',      // Blue 500 - subtle accent
  divider: '#E2E8F0',     // Slate 200 - thin lines
  background: '#FFFFFF',  // White
};

const FONTS = {
  title: 22,
  subtitle: 14,
  sectionHeader: 12,
  body: 10,
  small: 9,
};

const MARGINS = {
  left: 20,
  right: 20,
  top: 20,
  bottom: 20,
};

// ========================================
// TITLE MAPPINGS
// ========================================

const CONTEXT_TITLES: Record<ContextType, string> = {
  weekly_report: 'Weekly Executive Brief',
  team_insight: 'Team Performance Brief',
  decision_analysis: 'Decision Intelligence Brief',
  risk_flag: 'Risk Assessment Brief',
};

// ========================================
// MAIN EXPORT FUNCTION
// ========================================

export const exportExecutiveBriefToPdf = async ({
  contextType,
  aiOutput,
  generatedAt = new Date(),
  entityName = '',
}: ExecutiveBriefOptions): Promise<void> => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - MARGINS.left - MARGINS.right;
  
  let y = MARGINS.top;

  // === COVER SECTION ===
  y = addCoverSection(doc, y, contentWidth, contextType, entityName, generatedAt);
  y += 8;

  // === EXECUTIVE SUMMARY ===
  y = addExecutiveSummary(doc, y, contentWidth, aiOutput);
  y += 6;

  // === CORE INSIGHTS ===
  y = addCoreInsights(doc, y, contentWidth, contextType, aiOutput, pageHeight);
  y += 6;

  // === KEY RISKS ===
  y = addKeyRisks(doc, y, contentWidth, aiOutput, pageHeight);
  y += 6;

  // === RECOMMENDED FOCUS ===
  y = addRecommendedFocus(doc, y, contentWidth, aiOutput, pageHeight);
  y += 10;

  // === ACCOUNTABILITY FOOTER ===
  addFooter(doc, pageHeight, contentWidth);

  // Generate filename
  const weekNum = getWeek(generatedAt);
  const dateStr = format(generatedAt, 'yyyy-MM-dd');
  const safeName = entityName.replace(/[^a-zA-Z0-9]/g, '_') || 'Brief';
  const fileName = `Executive_Brief_${safeName}_${dateStr}.pdf`;

  doc.save(fileName);
};

// ========================================
// SECTION HELPERS
// ========================================

function addCoverSection(
  doc: jsPDF,
  y: number,
  contentWidth: number,
  contextType: ContextType,
  entityName: string,
  generatedAt: Date
): number {
  // Brand header (discrete)
  doc.setFontSize(FONTS.small);
  doc.setTextColor(COLORS.secondary);
  doc.text('SPIRETRACK', MARGINS.left, y);
  y += 12;

  // Main title
  doc.setFontSize(FONTS.title);
  doc.setTextColor(COLORS.primary);
  doc.setFont('helvetica', 'bold');
  const title = CONTEXT_TITLES[contextType] || 'Executive Brief';
  doc.text(title, MARGINS.left, y);
  y += 8;

  // Subtitle (entity name + date)
  doc.setFontSize(FONTS.subtitle);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.secondary);
  
  const weekNum = getWeek(generatedAt);
  const subtitle = entityName 
    ? `${entityName} — Week ${weekNum}, ${format(generatedAt, 'yyyy')}`
    : `Week ${weekNum}, ${format(generatedAt, 'yyyy')}`;
  doc.text(subtitle, MARGINS.left, y);
  y += 4;

  // Generated date (right aligned)
  const dateText = `Generated: ${format(generatedAt, 'MMM d, yyyy')}`;
  doc.setFontSize(FONTS.small);
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, MARGINS.left + contentWidth - dateWidth, y);
  y += 6;

  // Thin divider
  doc.setDrawColor(COLORS.accent);
  doc.setLineWidth(0.5);
  doc.line(MARGINS.left, y, MARGINS.left + contentWidth, y);
  y += 6;

  return y;
}

function addExecutiveSummary(
  doc: jsPDF,
  y: number,
  contentWidth: number,
  aiOutput: Record<string, any>
): number {
  // Extract summary from various possible fields
  const summary = aiOutput.executive_summary 
    || aiOutput.executive_brief 
    || aiOutput.summary 
    || aiOutput.team_health_status
    || 'No executive summary available.';

  // Section header
  doc.setFontSize(FONTS.sectionHeader);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary);
  doc.text('EXECUTIVE SUMMARY', MARGINS.left, y);
  y += 6;

  // Summary text
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.secondary);
  
  const lines = doc.splitTextToSize(String(summary), contentWidth);
  doc.text(lines, MARGINS.left, y);
  y += lines.length * 5;

  return y;
}

function addCoreInsights(
  doc: jsPDF,
  y: number,
  contentWidth: number,
  contextType: ContextType,
  aiOutput: Record<string, any>,
  pageHeight: number
): number {
  // Section header
  doc.setFontSize(FONTS.sectionHeader);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary);
  doc.text('CORE INSIGHTS', MARGINS.left, y);
  y += 6;

  // Get insights based on context type
  const insights = getInsightsForContext(contextType, aiOutput);
  
  for (const insight of insights) {
    // Check for page break
    if (y > pageHeight - 40) {
      doc.addPage();
      y = MARGINS.top;
    }

    // Label
    doc.setFontSize(FONTS.small);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(COLORS.primary);
    doc.text(insight.label.toUpperCase(), MARGINS.left, y);
    y += 4;

    // Content
    doc.setFontSize(FONTS.body);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(COLORS.secondary);
    
    const lines = doc.splitTextToSize(String(insight.value), contentWidth);
    doc.text(lines, MARGINS.left, y);
    y += lines.length * 5 + 4;
  }

  return y;
}

interface Insight {
  label: string;
  value: string;
}

function getInsightsForContext(
  contextType: ContextType,
  aiOutput: Record<string, any>
): Insight[] {
  const insights: Insight[] = [];

  switch (contextType) {
    case 'weekly_report':
      if (aiOutput.key_patterns?.length) {
        insights.push({ label: 'Key Patterns', value: aiOutput.key_patterns.slice(0, 3).join(' • ') });
      }
      if (aiOutput.root_causes?.length) {
        insights.push({ label: 'Root Causes', value: aiOutput.root_causes.slice(0, 2).join(' • ') });
      }
      if (aiOutput.leverage_points?.length) {
        insights.push({ label: 'Leverage Points', value: aiOutput.leverage_points.slice(0, 2).join(' • ') });
      }
      break;

    case 'team_insight':
      if (aiOutput.team_health_status) {
        insights.push({ label: 'Team Health', value: aiOutput.team_health_status });
      }
      if (aiOutput.primary_constraint) {
        insights.push({ label: 'Primary Constraint', value: aiOutput.primary_constraint });
      }
      if (aiOutput.execution_gap) {
        insights.push({ label: 'Execution Gap', value: aiOutput.execution_gap });
      }
      if (aiOutput.risk_next_30_days) {
        insights.push({ label: 'Risk (Next 30 Days)', value: aiOutput.risk_next_30_days });
      }
      break;

    case 'decision_analysis':
      if (aiOutput.decision_quality) {
        insights.push({ label: 'Decision Quality', value: aiOutput.decision_quality });
      }
      if (aiOutput.assumptions_detected) {
        insights.push({ label: 'Assumptions', value: aiOutput.assumptions_detected });
      }
      if (aiOutput.dependencies_created) {
        insights.push({ label: 'Dependencies', value: aiOutput.dependencies_created });
      }
      break;

    case 'risk_flag':
      if (aiOutput.risk_severity) {
        insights.push({ label: 'Severity', value: aiOutput.risk_severity });
      }
      if (aiOutput.risk_description) {
        insights.push({ label: 'Description', value: aiOutput.risk_description });
      }
      break;
  }

  // Fallback: show any available data
  if (insights.length === 0) {
    const keys = Object.keys(aiOutput).filter(k => 
      typeof aiOutput[k] === 'string' && aiOutput[k].length > 10
    ).slice(0, 4);
    
    for (const key of keys) {
      const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      insights.push({ label, value: aiOutput[key] });
    }
  }

  return insights;
}

function addKeyRisks(
  doc: jsPDF,
  y: number,
  contentWidth: number,
  aiOutput: Record<string, any>,
  pageHeight: number
): number {
  // Extract risks
  const risks = aiOutput.hidden_risks 
    || aiOutput.risks 
    || aiOutput.risk_next_30_days
    || aiOutput.warning_if_ignored;

  if (!risks) return y;

  // Check for page break
  if (y > pageHeight - 50) {
    doc.addPage();
    y = MARGINS.top;
  }

  // Section header
  doc.setFontSize(FONTS.sectionHeader);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary);
  doc.text('KEY RISKS', MARGINS.left, y);
  y += 6;

  // Render risks
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(COLORS.secondary);

  const riskArray = Array.isArray(risks) ? risks : [risks];
  for (const risk of riskArray.slice(0, 3)) {
    const lines = doc.splitTextToSize(`• ${risk}`, contentWidth);
    doc.text(lines, MARGINS.left, y);
    y += lines.length * 5 + 2;
  }

  return y;
}

function addRecommendedFocus(
  doc: jsPDF,
  y: number,
  contentWidth: number,
  aiOutput: Record<string, any>,
  pageHeight: number
): number {
  // Extract recommendation
  const focus = aiOutput.recommended_manager_action 
    || aiOutput.priority_intervention 
    || aiOutput.one_decision_to_make
    || aiOutput.next_week_actions?.must_do?.[0]
    || aiOutput.accountability_statement;

  if (!focus) return y;

  // Check for page break
  if (y > pageHeight - 50) {
    doc.addPage();
    y = MARGINS.top;
  }

  // Section header
  doc.setFontSize(FONTS.sectionHeader);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(COLORS.primary);
  doc.text('RECOMMENDED FOCUS', MARGINS.left, y);
  y += 6;

  // Focus text (emphasized)
  doc.setFontSize(FONTS.body);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(COLORS.primary);
  
  const focusText = Array.isArray(focus) ? focus[0] : focus;
  const lines = doc.splitTextToSize(String(focusText), contentWidth);
  doc.text(lines, MARGINS.left, y);
  y += lines.length * 5;

  return y;
}

function addFooter(
  doc: jsPDF,
  pageHeight: number,
  contentWidth: number
): void {
  const y = pageHeight - MARGINS.bottom;

  // Thin divider
  doc.setDrawColor(COLORS.divider);
  doc.setLineWidth(0.3);
  doc.line(MARGINS.left, y - 8, MARGINS.left + contentWidth, y - 8);

  // Accountability statement
  doc.setFontSize(FONTS.small - 1);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(COLORS.secondary);
  
  const statement = 'This brief reflects system-detected patterns based on submitted data. It is intended for operational review and decision support.';
  const lines = doc.splitTextToSize(statement, contentWidth);
  doc.text(lines, MARGINS.left, y - 4);
}

// ========================================
// CONVENIENCE EXPORTS FOR SPECIFIC TYPES
// ========================================

export const exportWeeklyBriefToPdf = (
  aiOutput: Record<string, any>,
  userName?: string,
  generatedAt?: Date
) => exportExecutiveBriefToPdf({
  contextType: 'weekly_report',
  aiOutput,
  entityName: userName,
  generatedAt: generatedAt || new Date(),
});

export const exportTeamInsightsToPdf = (
  aiOutput: Record<string, any>,
  teamName?: string,
  generatedAt?: Date
) => exportExecutiveBriefToPdf({
  contextType: 'team_insight',
  aiOutput,
  entityName: teamName,
  generatedAt: generatedAt || new Date(),
});
