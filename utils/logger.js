/**
 * Logger utility that gates console output to development mode.
 *
 * WHY: Production builds shouldn't spam the console with debug logs.
 * This wrapper ensures logs only appear during development.
 */

const isDev = process.env.NODE_ENV !== 'production';

export const logger = {
  log: (...args) => {
    if (isDev) console.log(...args);
  },
  warn: (...args) => {
    if (isDev) console.warn(...args);
  },
  error: (...args) => {
    // Errors are always logged (helpful for debugging production issues)
    console.error(...args);
  },
  info: (...args) => {
    if (isDev) console.info(...args);
  }
};

export default logger;
