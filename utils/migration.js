/**
 * Migration utility - legacy react-secure-storage migration.
 *
 * HISTORICAL CONTEXT:
 * react-secure-storage encrypted data using a browser fingerprint. When the fingerprint
 * changed (Chrome updates, OS updates, WebView rotation on Android), the encryption key
 * became invalid and all data was lost.
 *
 * The package has been removed and this migration is now a no-op that marks migration
 * as complete to prevent any future migration attempts.
 */

import { safeGetItem, safeSetItem, STORAGE_KEYS } from './storage.js';
import logger from './logger.js';

/**
 * Legacy migration function - now a no-op.
 * Kept for backwards compatibility with _app.js import.
 *
 * @returns {Object} Migration result (always skipped)
 */
export function migrateFromSecureStorage() {
  // Check if already migrated - avoid running multiple times
  if (safeGetItem(STORAGE_KEYS.MIGRATION_COMPLETE)) {
    logger.log('[Migration] Already completed, skipping');
    return { migrated: [], failed: [], skipped: true };
  }

  // react-secure-storage has been removed from dependencies.
  // Mark migration as complete and skip.
  logger.log('[Migration] Legacy migration no longer needed, marking complete');
  safeSetItem(STORAGE_KEYS.MIGRATION_COMPLETE, true);
  return { migrated: [], failed: [], skipped: true };
}
