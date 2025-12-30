/**
 * Production-safe logger utility
 * Only logs in development mode, never in production
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: unknown[]) => {
    // Errors are always logged, but without sensitive data in production
    if (isDev) {
      console.error(...args);
    } else {
      // In production, log a generic error message
      console.error('[Error]', args[0] instanceof Error ? args[0].message : 'An error occurred');
    }
  },
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  }
};
