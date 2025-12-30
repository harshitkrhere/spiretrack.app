/**
 * Data Export Utilities
 * Excel export for team reports, CSV export for activity logs
 */

// Re-export Excel export functions
export { exportReportToExcel, exportIndividualReviewToExcel } from './excelExport';

// Re-export Executive PDF functions
export { exportExecutiveBriefToPdf, exportWeeklyBriefToPdf, exportTeamInsightsToPdf } from './executivePdfExport';

// ========================================
// CSV EXPORT (for Activity Logs)
// ========================================

interface ExportColumn {
  key: string;
  header: string;
  formatter?: (value: any) => string;
}

/**
 * Convert array of objects to CSV string
 */
export function toCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[]
): string {
  if (data.length === 0) return '';

  // Header row
  const headerRow = columns.map(col => `"${col.header.replace(/"/g, '""')}"`).join(',');

  // Data rows
  const dataRows = data.map(row => {
    return columns.map(col => {
      let value = row[col.key];
      if (col.formatter) {
        value = col.formatter(value);
      }
      if (value === null || value === undefined) {
        return '""';
      }
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      return `"${String(value).replace(/"/g, '""')}"`;
    }).join(',');
  });

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Download a string as a file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data as CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn[],
  filename: string
): void {
  const csv = toCSV(data, columns);
  downloadFile(csv, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

// ========================================
// ACTIVITY LOG COLUMNS
// ========================================

export const activityLogColumns: ExportColumn[] = [
  { key: 'created_at', header: 'Date', formatter: (v) => v ? new Date(v).toLocaleString() : '' },
  { key: 'action', header: 'Action' },
  { key: 'actor_name', header: 'Actor' },
  { key: 'details_text', header: 'Details' },
];

/**
 * Format activity logs for CSV export
 */
export function formatActivityLogsForExport(logs: any[]): any[] {
  return logs.map(log => ({
    created_at: log.created_at,
    action: log.action,
    actor_name: log.actor?.full_name || log.actor?.email || 'System',
    details_text: log.details ? Object.entries(log.details).map(([k, v]) => `${k}: ${v}`).join(', ') : '',
  }));
}
