/**
 * Professional Excel Export for Team Weekly Reports
 * Creates executive-ready, styled Excel documents using ExcelJS
 */

import ExcelJS from 'exceljs';
import { format, getWeek } from 'date-fns';

interface ExcelExportOptions {
  report: any;
  teamName: string;
  weekStart: string;
}

// Color palette - subtle, professional
const COLORS = {
  primary: '1E293B',      // Slate 800
  secondary: '64748B',    // Slate 500
  accent: '3B82F6',       // Blue 500
  success: '22C55E',      // Green 500
  warning: 'EAB308',      // Yellow 500
  danger: 'EF4444',       // Red 500
  purple: 'A855F7',       // Purple 500
  lightBg: 'F8FAFC',      // Slate 50
  border: 'E2E8F0',       // Slate 200
  headerBg: 'F1F5F9',     // Slate 100
};

/**
 * Export Team Weekly Report to professionally styled Excel file
 */
export const exportReportToExcel = async ({ 
  report, 
  teamName, 
  weekStart 
}: ExcelExportOptions): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  
  // Workbook properties
  workbook.creator = 'SpireTrack';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('Weekly Report', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      margins: {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      }
    }
  });

  // Set column widths
  worksheet.columns = [
    { width: 3 },   // A - Spacer
    { width: 22 },  // B - Labels
    { width: 15 },  // C - Values
    { width: 12 },  // D - Status
    { width: 40 },  // E - Extended content
    { width: 3 },   // F - Spacer
  ];

  let currentRow = 1;

  // === HEADER SECTION ===
  currentRow = addHeader(worksheet, currentRow, teamName, weekStart);
  currentRow += 1;

  // === KEY METRICS ===
  currentRow = addMetricsSection(worksheet, currentRow, report);
  currentRow += 1;

  // === EXECUTIVE SUMMARY ===
  if (report.summary_text) {
    currentRow = addTextSection(
      worksheet, 
      currentRow, 
      'Executive Summary', 
      report.summary_text
    );
    currentRow += 1;
  }

  // === ACHIEVEMENTS & WINS ===
  if (report.collective_wins?.length > 0) {
    currentRow = addListSection(
      worksheet, 
      currentRow, 
      'Achievements & Wins', 
      report.collective_wins,
      '✓'
    );
    currentRow += 1;
  }

  // === BLOCKERS & RISKS ===
  if (report.collective_blockers?.length > 0) {
    currentRow = addListSection(
      worksheet, 
      currentRow, 
      'Blockers & Challenges', 
      report.collective_blockers,
      '!'
    );
    currentRow += 1;
  }

  // === PRIORITY ACTIONS ===
  if (report.critical_path?.length > 0) {
    currentRow = addListSection(
      worksheet, 
      currentRow, 
      'Priority Actions', 
      report.critical_path,
      '→'
    );
    currentRow += 1;
  }

  // === FOOTER ===
  addFooter(worksheet, currentRow);

  // Generate filename
  const startDate = new Date(weekStart);
  const weekNumber = getWeek(startDate);
  const sanitizedTeamName = teamName.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Team_Weekly_Report_${sanitizedTeamName}_Week_${weekNumber}.xlsx`;

  // Download file
  const buffer = await workbook.xlsx.writeBuffer();
  downloadBuffer(buffer, fileName);
};

/**
 * Add header section with title, team info, and date
 */
function addHeader(
  ws: ExcelJS.Worksheet, 
  startRow: number, 
  teamName: string, 
  weekStart: string
): number {
  let row = startRow;

  // Spacer row
  row++;

  // Main title
  const titleCell = ws.getCell(`B${row}`);
  titleCell.value = 'Team Weekly Report';
  titleCell.font = {
    name: 'Calibri',
    size: 20,
    bold: true,
    color: { argb: COLORS.primary }
  };
  ws.mergeCells(`B${row}:D${row}`);

  // Export date on the right
  const dateCell = ws.getCell(`E${row}`);
  dateCell.value = `Exported: ${format(new Date(), 'MMM d, yyyy')}`;
  dateCell.font = {
    name: 'Calibri',
    size: 10,
    color: { argb: COLORS.secondary }
  };
  dateCell.alignment = { horizontal: 'right' };
  row++;

  // Team and period info
  const startDate = new Date(weekStart);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 6);

  const subtitleCell = ws.getCell(`B${row}`);
  subtitleCell.value = `${teamName}  •  ${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`;
  subtitleCell.font = {
    name: 'Calibri',
    size: 12,
    color: { argb: COLORS.secondary }
  };
  ws.mergeCells(`B${row}:E${row}`);
  row++;

  // Accent line
  row++;
  for (let col = 2; col <= 5; col++) {
    const cell = ws.getCell(row, col);
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.accent } }
    };
  }
  row++;

  return row;
}

/**
 * Add key metrics section with scores
 */
function addMetricsSection(
  ws: ExcelJS.Worksheet, 
  startRow: number, 
  report: any
): number {
  let row = startRow;

  // Section header
  const headerCell = ws.getCell(`B${row}`);
  headerCell.value = 'KEY METRICS';
  headerCell.font = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: COLORS.primary }
  };
  row++;

  // Spacer
  row++;

  // Metrics table header
  const headers = ['Metric', 'Score', 'Rating'];
  headers.forEach((header, idx) => {
    const cell = ws.getCell(row, idx + 2);
    cell.value = header;
    cell.font = {
      name: 'Calibri',
      size: 10,
      bold: true,
      color: { argb: COLORS.primary }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.headerBg }
    };
    cell.border = {
      bottom: { style: 'thin', color: { argb: COLORS.border } }
    };
    cell.alignment = { vertical: 'middle' };
  });
  ws.getRow(row).height = 22;
  row++;

  // Metrics data
  const metrics = [
    { label: 'Morale', value: report.morale_score || 0, color: COLORS.success },
    { label: 'Productivity', value: report.productivity_score || 0, color: COLORS.accent },
    { label: 'Stress Level', value: report.stress_score || 0, color: COLORS.warning },
    { label: 'Risk Factor', value: report.risk_score || 0, color: COLORS.danger },
    { label: 'Alignment', value: report.alignment_score || 0, color: COLORS.purple },
  ];

  metrics.forEach((metric, idx) => {
    const isEven = idx % 2 === 0;
    
    // Metric name
    const labelCell = ws.getCell(row, 2);
    labelCell.value = metric.label;
    labelCell.font = { name: 'Calibri', size: 11 };
    if (isEven) {
      labelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.lightBg }
      };
    }

    // Score
    const scoreCell = ws.getCell(row, 3);
    scoreCell.value = `${metric.value} / 100`;
    scoreCell.font = { 
      name: 'Calibri', 
      size: 11, 
      bold: true,
      color: { argb: metric.color }
    };
    scoreCell.alignment = { horizontal: 'center' };
    if (isEven) {
      scoreCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.lightBg }
      };
    }

    // Rating
    const ratingCell = ws.getCell(row, 4);
    ratingCell.value = getRating(metric.value);
    ratingCell.font = { 
      name: 'Calibri', 
      size: 10,
      color: { argb: COLORS.secondary }
    };
    ratingCell.alignment = { horizontal: 'center' };
    if (isEven) {
      ratingCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.lightBg }
      };
    }

    ws.getRow(row).height = 20;
    row++;
  });

  // Bottom border
  for (let col = 2; col <= 4; col++) {
    const cell = ws.getCell(row - 1, col);
    cell.border = {
      ...cell.border,
      bottom: { style: 'thin', color: { argb: COLORS.border } }
    };
  }

  return row;
}

/**
 * Add a text section (like Executive Summary)
 */
function addTextSection(
  ws: ExcelJS.Worksheet, 
  startRow: number, 
  title: string, 
  content: string
): number {
  let row = startRow;

  // Section header
  const headerCell = ws.getCell(`B${row}`);
  headerCell.value = title.toUpperCase();
  headerCell.font = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: COLORS.primary }
  };
  row++;
  row++;

  // Content
  const contentCell = ws.getCell(`B${row}`);
  contentCell.value = content;
  contentCell.font = {
    name: 'Calibri',
    size: 11,
    color: { argb: '374151' }
  };
  contentCell.alignment = { 
    wrapText: true, 
    vertical: 'top' 
  };
  ws.mergeCells(`B${row}:E${row}`);
  
  // Calculate row height based on content length
  const lineCount = Math.ceil(content.length / 80);
  ws.getRow(row).height = Math.max(20, lineCount * 16);
  row++;

  return row;
}

/**
 * Add a list section (wins, blockers, actions)
 */
function addListSection(
  ws: ExcelJS.Worksheet, 
  startRow: number, 
  title: string, 
  items: string[],
  bullet: string = '•'
): number {
  let row = startRow;

  // Section header
  const headerCell = ws.getCell(`B${row}`);
  headerCell.value = title.toUpperCase();
  headerCell.font = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: COLORS.primary }
  };
  row++;
  row++;

  // List items
  items.forEach((item, idx) => {
    const isEven = idx % 2 === 0;
    
    // Bullet/number
    const bulletCell = ws.getCell(row, 2);
    bulletCell.value = `${bullet}`;
    bulletCell.font = {
      name: 'Calibri',
      size: 11,
      bold: true,
      color: { argb: COLORS.accent }
    };
    bulletCell.alignment = { horizontal: 'right', vertical: 'top' };
    if (isEven) {
      bulletCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.lightBg }
      };
    }

    // Content
    const contentCell = ws.getCell(row, 3);
    contentCell.value = item;
    contentCell.font = {
      name: 'Calibri',
      size: 11,
      color: { argb: '374151' }
    };
    contentCell.alignment = { wrapText: true, vertical: 'top' };
    ws.mergeCells(`C${row}:E${row}`);
    
    // Apply fill to merged cells
    if (isEven) {
      for (let col = 3; col <= 5; col++) {
        ws.getCell(row, col).fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: COLORS.lightBg }
        };
      }
    }

    // Calculate row height
    const lineCount = Math.ceil(item.length / 60);
    ws.getRow(row).height = Math.max(18, lineCount * 16);
    row++;
  });

  return row;
}

/**
 * Add footer with SpireTrack branding
 */
function addFooter(ws: ExcelJS.Worksheet, row: number): void {
  row += 2;
  
  const footerCell = ws.getCell(`B${row}`);
  footerCell.value = `Generated by SpireTrack  •  ${format(new Date(), 'MMMM d, yyyy \'at\' h:mm a')}`;
  footerCell.font = {
    name: 'Calibri',
    size: 9,
    italic: true,
    color: { argb: COLORS.secondary }
  };
  ws.mergeCells(`B${row}:E${row}`);
}

/**
 * Get human-readable rating from score
 */
function getRating(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Low';
  return 'Critical';
}

/**
 * Download buffer as file
 */
function downloadBuffer(buffer: ExcelJS.Buffer, filename: string): void {
  const blob = new Blob([buffer], { 
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ========================================
// INDIVIDUAL REVIEW EXPORT
// ========================================

interface IndividualReviewExportOptions {
  report: {
    executive_summary?: string;
    key_patterns?: string[];
    root_causes?: string[];
    hidden_risks?: string[];
    leverage_points?: string[];
    next_week_actions?: {
      must_do: string[];
      stop_doing: string[];
      experiment: string;
    };
    accountability_statement?: string;
    focus_score: number;
    mood_score: number;
    stress_score: number;
    sleep_score: number;
  };
  weekStart: Date;
}

/**
 * Export Individual Weekly Review to professionally styled Excel file
 */
export const exportIndividualReviewToExcel = async ({ 
  report, 
  weekStart 
}: IndividualReviewExportOptions): Promise<void> => {
  const workbook = new ExcelJS.Workbook();
  
  workbook.creator = 'SpireTrack';
  workbook.created = new Date();
  
  const worksheet = workbook.addWorksheet('Personal Review', {
    pageSetup: {
      paperSize: 9,
      orientation: 'portrait',
      fitToPage: true,
      margins: {
        left: 0.7,
        right: 0.7,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3
      }
    }
  });

  worksheet.columns = [
    { width: 3 },
    { width: 22 },
    { width: 15 },
    { width: 12 },
    { width: 40 },
    { width: 3 },
  ];

  let currentRow = 1;

  // === HEADER ===
  currentRow = addIndividualHeader(worksheet, currentRow, weekStart);
  currentRow += 1;

  // === METRICS ===
  currentRow = addIndividualMetricsSection(worksheet, currentRow, report);
  currentRow += 1;

  // === EXECUTIVE SUMMARY ===
  if (report.executive_summary) {
    currentRow = addTextSection(
      worksheet, 
      currentRow, 
      'Executive Summary', 
      report.executive_summary
    );
    currentRow += 1;
  }

  // === KEY PATTERNS ===
  if (report.key_patterns && report.key_patterns.length > 0) {
    currentRow = addListSection(
      worksheet, 
      currentRow, 
      'Key Patterns', 
      report.key_patterns,
      '◆'
    );
    currentRow += 1;
  }

  // === HIDDEN RISKS ===
  if (report.hidden_risks && report.hidden_risks.length > 0) {
    currentRow = addListSection(
      worksheet, 
      currentRow, 
      'Hidden Risks', 
      report.hidden_risks,
      '⚠'
    );
    currentRow += 1;
  }

  // === PRIORITY ACTIONS ===
  if (report.next_week_actions?.must_do && report.next_week_actions.must_do.length > 0) {
    currentRow = addListSection(
      worksheet, 
      currentRow, 
      'Priority Actions', 
      report.next_week_actions.must_do,
      '→'
    );
    currentRow += 1;
  }

  // === ACCOUNTABILITY ===
  if (report.accountability_statement) {
    currentRow = addAccountabilitySection(worksheet, currentRow, report.accountability_statement);
    currentRow += 1;
  }

  // === FOOTER ===
  addFooter(worksheet, currentRow);

  // Generate filename
  const weekNumber = getWeek(weekStart);
  const fileName = `Personal_Weekly_Review_Week_${weekNumber}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBuffer(buffer, fileName);
};

/**
 * Add header for individual review
 */
function addIndividualHeader(
  ws: ExcelJS.Worksheet, 
  startRow: number, 
  weekStart: Date
): number {
  let row = startRow;
  row++;

  const titleCell = ws.getCell(`B${row}`);
  titleCell.value = 'Personal Weekly Review';
  titleCell.font = {
    name: 'Calibri',
    size: 20,
    bold: true,
    color: { argb: COLORS.primary }
  };
  ws.mergeCells(`B${row}:D${row}`);

  const dateCell = ws.getCell(`E${row}`);
  dateCell.value = `Exported: ${format(new Date(), 'MMM d, yyyy')}`;
  dateCell.font = {
    name: 'Calibri',
    size: 10,
    color: { argb: COLORS.secondary }
  };
  dateCell.alignment = { horizontal: 'right' };
  row++;

  const endDate = new Date(weekStart);
  endDate.setDate(endDate.getDate() + 6);

  const subtitleCell = ws.getCell(`B${row}`);
  subtitleCell.value = `Week of ${format(weekStart, 'MMM d')} – ${format(endDate, 'MMM d, yyyy')}`;
  subtitleCell.font = {
    name: 'Calibri',
    size: 12,
    color: { argb: COLORS.secondary }
  };
  ws.mergeCells(`B${row}:E${row}`);
  row++;

  row++;
  for (let col = 2; col <= 5; col++) {
    const cell = ws.getCell(row, col);
    cell.border = {
      top: { style: 'medium', color: { argb: COLORS.purple } }
    };
  }
  row++;

  return row;
}

/**
 * Add metrics section for individual review (0-10 scale)
 */
function addIndividualMetricsSection(
  ws: ExcelJS.Worksheet, 
  startRow: number, 
  report: IndividualReviewExportOptions['report']
): number {
  let row = startRow;

  const headerCell = ws.getCell(`B${row}`);
  headerCell.value = 'WELLNESS METRICS';
  headerCell.font = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: COLORS.primary }
  };
  row++;
  row++;

  const headers = ['Metric', 'Score', 'Rating'];
  headers.forEach((header, idx) => {
    const cell = ws.getCell(row, idx + 2);
    cell.value = header;
    cell.font = {
      name: 'Calibri',
      size: 10,
      bold: true,
      color: { argb: COLORS.primary }
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.headerBg }
    };
    cell.border = {
      bottom: { style: 'thin', color: { argb: COLORS.border } }
    };
    cell.alignment = { vertical: 'middle' };
  });
  ws.getRow(row).height = 22;
  row++;

  const metrics = [
    { label: 'Focus', value: report.focus_score || 0, color: COLORS.accent },
    { label: 'Mood', value: report.mood_score || 0, color: COLORS.success },
    { label: 'Stress', value: report.stress_score || 0, color: COLORS.warning },
    { label: 'Sleep', value: report.sleep_score || 0, color: COLORS.purple },
  ];

  metrics.forEach((metric, idx) => {
    const isEven = idx % 2 === 0;
    
    const labelCell = ws.getCell(row, 2);
    labelCell.value = metric.label;
    labelCell.font = { name: 'Calibri', size: 11 };
    if (isEven) {
      labelCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.lightBg }
      };
    }

    const scoreCell = ws.getCell(row, 3);
    scoreCell.value = `${metric.value} / 10`;
    scoreCell.font = { 
      name: 'Calibri', 
      size: 11, 
      bold: true,
      color: { argb: metric.color }
    };
    scoreCell.alignment = { horizontal: 'center' };
    if (isEven) {
      scoreCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.lightBg }
      };
    }

    const ratingCell = ws.getCell(row, 4);
    ratingCell.value = getIndividualRating(metric.value);
    ratingCell.font = { 
      name: 'Calibri', 
      size: 10,
      color: { argb: COLORS.secondary }
    };
    ratingCell.alignment = { horizontal: 'center' };
    if (isEven) {
      ratingCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: COLORS.lightBg }
      };
    }

    ws.getRow(row).height = 20;
    row++;
  });

  for (let col = 2; col <= 4; col++) {
    const cell = ws.getCell(row - 1, col);
    cell.border = {
      ...cell.border,
      bottom: { style: 'thin', color: { argb: COLORS.border } }
    };
  }

  return row;
}

/**
 * Add accountability statement section
 */
function addAccountabilitySection(
  ws: ExcelJS.Worksheet, 
  startRow: number, 
  statement: string
): number {
  let row = startRow;

  const headerCell = ws.getCell(`B${row}`);
  headerCell.value = 'COMMITMENT';
  headerCell.font = {
    name: 'Calibri',
    size: 11,
    bold: true,
    color: { argb: COLORS.primary }
  };
  row++;
  row++;

  const contentCell = ws.getCell(`B${row}`);
  contentCell.value = `"${statement}"`;
  contentCell.font = {
    name: 'Calibri',
    size: 12,
    italic: true,
    color: { argb: COLORS.primary }
  };
  contentCell.alignment = { 
    wrapText: true, 
    vertical: 'middle',
    horizontal: 'center'
  };
  ws.mergeCells(`B${row}:E${row}`);
  
  // Background
  for (let col = 2; col <= 5; col++) {
    ws.getCell(row, col).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: COLORS.headerBg }
    };
  }
  
  const lineCount = Math.ceil(statement.length / 60);
  ws.getRow(row).height = Math.max(30, lineCount * 18);
  row++;

  return row;
}

/**
 * Get rating for 0-10 scale
 */
function getIndividualRating(score: number): string {
  if (score >= 8) return 'Excellent';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Fair';
  if (score >= 2) return 'Low';
  return 'Critical';
}

