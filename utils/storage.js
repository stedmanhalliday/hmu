/**
 * Safe localStorage wrapper with error handling and logging.
 *
 * WHY: react-secure-storage encrypts data using browser fingerprints, which become
 * invalid when the fingerprint changes (Chrome updates, OS updates, WebView rotation).
 * This causes data loss on Android PWAs. Plain localStorage is MORE reliable because
 * it doesn't depend on unstable encryption keys.
 *
 * SECURITY: The data is user-controlled personal info on their own device. The device
 * lock screen is the security boundary. Encryption adds fragility without security benefit.
 */

// Storage keys used throughout the app
export const STORAGE_KEYS = {
  // Legacy keys (single contact) - kept for migration
  FORM_VALUES: 'formValues',
  LINK_VALUES: 'linkValues',
  // New key (multiple contacts)
  CONTACTS: 'contacts',
  // Other keys
  CONVERTED: 'converted',
  MIGRATION_COMPLETE: 'MIGRATION_COMPLETE',
  CONTACTS_MIGRATION_COMPLETE: 'CONTACTS_MIGRATION_COMPLETE'
};

/**
 * Generate a unique contact ID.
 * Uses timestamp + random suffix for uniqueness without external dependencies.
 */
export function generateContactId() {
  return `contact-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Safely retrieve and parse JSON from localStorage.
 *
 * WHY: Corrupted storage (from failed migrations, browser bugs, or manual editing)
 * can crash the app if we don't protect JSON.parse calls.
 *
 * @param {string} key - Storage key to retrieve
 * @returns {any|null} Parsed JSON value or null if missing/invalid
 */
export function safeGetItem(key) {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      console.log(`[Storage] Key "${key}" not found`);
      return null;
    }

    // Parse the JSON - will throw if corrupted
    const parsed = JSON.parse(item);
    console.log(`[Storage] Successfully read "${key}"`);
    return parsed;
  } catch (error) {
    console.error(`[Storage] Failed to read "${key}":`, error.message);
    return null;
  }
}

/**
 * Safely stringify and write JSON to localStorage.
 *
 * WHY: Write failures (quota exceeded, permission issues, browser bugs) should be
 * detectable rather than silently failing.
 *
 * @param {string} key - Storage key to set
 * @param {any} value - Value to store (will be JSON stringified once)
 * @returns {boolean} True if write succeeded, false otherwise
 */
export function safeSetItem(key, value) {
  try {
    // Stringify once - avoids double-stringify bug from previous implementation
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    console.log(`[Storage] Successfully wrote "${key}"`, `(${serialized.length} bytes)`);
    return true;
  } catch (error) {
    // Detect quota exceeded specifically
    if (error.name === 'QuotaExceededError') {
      console.error(`[Storage] Quota exceeded writing "${key}"`);
    } else {
      console.error(`[Storage] Failed to write "${key}":`, error.message);
    }
    return false;
  }
}

/**
 * Safely remove a key from localStorage.
 *
 * @param {string} key - Storage key to remove
 * @returns {boolean} True if removal succeeded, false otherwise
 */
export function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
    console.log(`[Storage] Removed "${key}"`);
    return true;
  } catch (error) {
    console.error(`[Storage] Failed to remove "${key}":`, error.message);
    return false;
  }
}

/**
 * Default vibe to use when parsing fails or vibe is missing.
 *
 * WHY: Corrupted vibe data would crash the app. This provides a safe fallback
 * that renders correctly in all UI contexts (Contacts, preview, create).
 */
const ANON_VIBE = {
  label: "Anon",
  emoji: "👤",
  group: ["#C9D4E1", "#20293B"]
};

/**
 * Safely parse a vibe string into a vibe object.
 *
 * WHY: formValues.vibe is stored as a JSON string. If storage is corrupted
 * (failed migration, browser bug, manual editing), JSON.parse will throw and
 * crash the app. This wrapper catches that and returns a safe fallback.
 *
 * @param {string} vibeString - JSON string containing vibe data
 * @returns {object} Parsed vibe object or ANON_VIBE fallback
 */
export function safeParseVibe(vibeString) {
  // Handle null/undefined/empty string
  if (!vibeString) {
    console.log('[Storage] Vibe string is empty, using Anon fallback');
    return ANON_VIBE;
  }

  try {
    const vibe = JSON.parse(vibeString);
    // Validate structure to catch partial corruption
    if (!vibe.label || !vibe.emoji || !Array.isArray(vibe.group)) {
      console.warn('[Storage] Vibe missing required fields, using Anon fallback');
      return ANON_VIBE;
    }
    return vibe;
  } catch (error) {
    console.error('[Storage] Failed to parse vibe:', error.message);
    return ANON_VIBE;
  }
}

/**
 * Empty contact template.
 * WHY: Provides consistent structure for new contacts and null checks.
 */
export const EMPTY_FORM_VALUES = {
  name: "",
  phone: "",
  email: "",
  url: "",
  vibe: "",
  photo: ""
};

export const EMPTY_LINK_VALUES = {
  twitter: "",
  linkedin: "",
  github: "",
  telegram: "",
  instagram: "",
  venmo: "",
  custom: ""
};

/**
 * Create a new empty contact with a unique ID.
 */
export function createEmptyContact() {
  return {
    id: generateContactId(),
    formValues: { ...EMPTY_FORM_VALUES },
    linkValues: { ...EMPTY_LINK_VALUES }
  };
}

/**
 * Maximum number of contacts allowed.
 * WHY: Keep initial implementation simple. Can increase later.
 */
export const MAX_CONTACTS = 2;
