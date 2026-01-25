/**
 * Migration utility to move data from react-secure-storage to plain localStorage.
 *
 * WHY THIS IS NECESSARY:
 * react-secure-storage encrypts data using a browser fingerprint. When the fingerprint
 * changes (Chrome updates, OS updates, WebView rotation on Android), the encryption key
 * becomes invalid and all data becomes undecryptable. This causes data loss.
 *
 * MIGRATION STRATEGY:
 * - Try to read existing secure storage keys
 * - If readable: copy to plain localStorage, then remove secure storage copy
 * - If not readable: accept data loss (unavoidable - encryption key is lost)
 * - Set MIGRATION_COMPLETE flag to prevent running multiple times
 * - Idempotent: safe to run multiple times
 *
 * MENTAL MODEL FOR TESTING:
 * User states we need to handle:
 * 1. Fresh install: no data anywhere → migration skips, no-op
 * 2. Existing user, fingerprint unchanged: secure storage readable → migrate successfully
 * 3. Existing user, fingerprint changed: secure storage unreadable → accept loss, start fresh
 * 4. Already migrated: MIGRATION_COMPLETE flag set → skip immediately
 * 5. Partial plain storage: some keys exist in plain localStorage → merge, prefer plain
 */

import { safeGetItem, safeSetItem, safeRemoveItem, STORAGE_KEYS } from './storage.js';
import logger from './logger.js';

/**
 * Attempt to migrate data from react-secure-storage to plain localStorage.
 *
 * @returns {Object} Migration result with migrated/failed/skipped arrays
 */
export function migrateFromSecureStorage() {
  logger.log('[Migration] Starting storage migration check');

  // Check if already migrated - avoid running multiple times
  if (safeGetItem(STORAGE_KEYS.MIGRATION_COMPLETE)) {
    logger.log('[Migration] Already completed, skipping');
    return { migrated: [], failed: [], skipped: true };
  }

  // Check if plain localStorage already has data - if so, user already using new system
  const hasPlainData =
    safeGetItem(STORAGE_KEYS.FORM_VALUES) !== null ||
    safeGetItem(STORAGE_KEYS.LINK_VALUES) !== null;

  if (hasPlainData) {
    logger.log('[Migration] Plain localStorage data exists, skipping secure storage read');
    safeSetItem(STORAGE_KEYS.MIGRATION_COMPLETE, true);
    return { migrated: [], failed: [], skipped: true };
  }

  // Keys to attempt migration for
  const keysToMigrate = [
    STORAGE_KEYS.FORM_VALUES,
    STORAGE_KEYS.LINK_VALUES,
    STORAGE_KEYS.CONVERTED
  ];

  const migrated = [];
  const failed = [];

  // Attempt to import secureLocalStorage - may fail if already uninstalled
  let secureLocalStorage;
  try {
    secureLocalStorage = require('react-secure-storage').default;
  } catch (error) {
    logger.log('[Migration] react-secure-storage not available, skipping migration');
    safeSetItem(STORAGE_KEYS.MIGRATION_COMPLETE, true);
    return { migrated: [], failed: [], skipped: true };
  }

  // Try migrating each key independently - failures shouldn't block others
  for (const key of keysToMigrate) {
    try {
      // Attempt to read from secure storage
      const secureValue = secureLocalStorage.getItem(key);

      if (secureValue === null || secureValue === undefined) {
        logger.log(`[Migration] Key "${key}" not found in secure storage`);
        continue;
      }

      // Successfully read - migrate to plain storage
      // Note: secureLocalStorage already returns parsed JSON, but we need to
      // check if it's a string that needs parsing (old double-stringify bug)
      let valueToStore;
      if (typeof secureValue === 'string') {
        // Try parsing to see if it's double-stringified
        try {
          valueToStore = JSON.parse(secureValue);
        } catch {
          // Not JSON, store as-is
          valueToStore = secureValue;
        }
      } else {
        valueToStore = secureValue;
      }

      // Write to plain localStorage
      const writeSuccess = safeSetItem(key, valueToStore);

      if (writeSuccess) {
        // Successfully migrated - remove from secure storage to save space
        try {
          secureLocalStorage.removeItem(key);
          logger.log(`[Migration] Successfully migrated "${key}"`);
          migrated.push(key);
        } catch (removeError) {
          logger.warn(`[Migration] Migrated "${key}" but couldn't remove old copy:`, removeError.message);
          migrated.push(key);
        }
      } else {
        logger.error(`[Migration] Failed to write "${key}" to plain storage`);
        failed.push(key);
      }

    } catch (error) {
      // Read failed - likely fingerprint changed, data is undecryptable
      logger.error(`[Migration] Could not read "${key}" from secure storage:`, error.message);
      failed.push(key);
    }
  }

  // Mark migration as complete regardless of outcome
  // This prevents infinite retry loops
  safeSetItem(STORAGE_KEYS.MIGRATION_COMPLETE, true);

  logger.log('[Migration] Completed:', { migrated, failed });
  return { migrated, failed, skipped: false };
}
