import '../styles/reset.css';
import '../dist/main.css';
import Analytics from '../components/Analytics';
import ErrorBoundary from '../components/ErrorBoundary';
import logger from '../utils/logger.js';

import { createContext, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { 
  safeGetItem, 
  safeSetItem, 
  STORAGE_KEYS, 
  generateContactId,
  createEmptyContact,
  MAX_CONTACTS,
  EMPTY_LINK_VALUES
} from '../utils/storage.js';
import { migrateFromSecureStorage } from '../utils/migration.js';

export const StorageContext = createContext(null);

/**
 * Migrate from old single-contact structure to new multi-contact array.
 * 
 * WHY: Existing users have data in formValues/linkValues keys. We need to
 * preserve their data while moving to the new contacts array structure.
 * 
 * Safe to run multiple times (idempotent) - checks migration flag first.
 */
function migrateToMultiContact() {
  // Skip if already migrated
  if (safeGetItem(STORAGE_KEYS.CONTACTS_MIGRATION_COMPLETE)) {
    logger.log('[Migration] Multi-contact migration already complete');
    return;
  }

  // Skip if contacts array already exists (shouldn't happen, but be safe)
  const existingContacts = safeGetItem(STORAGE_KEYS.CONTACTS);
  if (existingContacts && Array.isArray(existingContacts) && existingContacts.length > 0) {
    logger.log('[Migration] Contacts array already exists, skipping migration');
    safeSetItem(STORAGE_KEYS.CONTACTS_MIGRATION_COMPLETE, true);
    return;
  }

  // Check for old single-contact data
  const oldFormValues = safeGetItem(STORAGE_KEYS.FORM_VALUES);
  const oldLinkValues = safeGetItem(STORAGE_KEYS.LINK_VALUES);

  // If no old data, nothing to migrate - start fresh
  if (!oldFormValues || oldFormValues === "") {
    logger.log('[Migration] No existing contact data to migrate');
    safeSetItem(STORAGE_KEYS.CONTACTS, []);
    safeSetItem(STORAGE_KEYS.CONTACTS_MIGRATION_COMPLETE, true);
    return;
  }

  // Create new contacts array with migrated data
  const migratedContact = {
    id: generateContactId(),
    formValues: oldFormValues,
    linkValues: oldLinkValues || { ...EMPTY_LINK_VALUES }
  };

  const contacts = [migratedContact];
  
  const success = safeSetItem(STORAGE_KEYS.CONTACTS, contacts);
  if (success) {
    logger.log('[Migration] Successfully migrated to multi-contact structure');
    safeSetItem(STORAGE_KEYS.CONTACTS_MIGRATION_COMPLETE, true);
    // Note: We keep old keys for now in case rollback is needed
  } else {
    logger.error('[Migration] Failed to save migrated contacts');
  }
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [contacts, _setContacts] = useState([]);
  const [storageError, setStorageError] = useState(false);

  /**
   * Save contacts to storage and update state.
   * WHY: Centralized save ensures storage and state stay in sync.
   */
  const setContacts = useCallback((newContacts) => {
    const success = safeSetItem(STORAGE_KEYS.CONTACTS, newContacts);
    if (!success) {
      setStorageError(true);
      setTimeout(() => setStorageError(false), 10000);
    }
    _setContacts(newContacts);
  }, []);

  /**
   * Get a specific contact by ID.
   * Returns null if not found.
   */
  const getContact = useCallback((id) => {
    return contacts.find(c => c.id === id) || null;
  }, [contacts]);

  /**
   * Update a specific contact's data.
   * Creates contact if ID is 'new'.
   * 
   * @param {string} id - Contact ID or 'new' for new contact
   * @param {object} data - { formValues?, linkValues? } - partial update
   * @returns {string} The contact ID (useful when creating new)
   */
  const setContact = useCallback((id, data) => {
    let contactId = id;
    let updatedContacts;

    if (id === 'new') {
      // Create new contact
      if (contacts.length >= MAX_CONTACTS) {
        logger.warn('[Contacts] Max contacts reached, cannot add more');
        return null;
      }
      const newContact = createEmptyContact();
      if (data.formValues) newContact.formValues = data.formValues;
      if (data.linkValues) newContact.linkValues = data.linkValues;
      updatedContacts = [...contacts, newContact];
      contactId = newContact.id;
      logger.log(`[Contacts] Created new contact: ${contactId}`);
    } else {
      // Update existing contact
      updatedContacts = contacts.map(contact => {
        if (contact.id === id) {
          return {
            ...contact,
            formValues: data.formValues !== undefined ? data.formValues : contact.formValues,
            linkValues: data.linkValues !== undefined ? data.linkValues : contact.linkValues
          };
        }
        return contact;
      });
      logger.log(`[Contacts] Updated contact: ${id}`);
    }

    setContacts(updatedContacts);
    return contactId;
  }, [contacts, setContacts]);

  /**
   * Delete a contact by ID.
   * WHY: Allow users to remove contacts (future feature, wired up now).
   */
  const deleteContact = useCallback((id) => {
    const updatedContacts = contacts.filter(c => c.id !== id);
    setContacts(updatedContacts);
    logger.log(`[Contacts] Deleted contact: ${id}`);
  }, [contacts, setContacts]);

  /**
   * Reorder contacts array.
   * WHY: Allow drag-and-drop reordering of contacts on the index page.
   */
  const reorderContacts = useCallback((newContacts) => {
    setContacts(newContacts);
    logger.log(`[Contacts] Reordered contacts`);
  }, [setContacts]);

  /**
   * Check if user can add more contacts.
   */
  const canAddContact = contacts.length < MAX_CONTACTS;

  // Load storage and set state once on mount
  useEffect(() => {
    // Run legacy migration first (react-secure-storage → plain localStorage)
    migrateFromSecureStorage();
    
    // Run multi-contact migration (single contact → array)
    migrateToMultiContact();

    // Load contacts from storage
    const loadedContacts = safeGetItem(STORAGE_KEYS.CONTACTS);
    _setContacts(loadedContacts || []);

    // Request persistent storage to reduce eviction risk on Android
    if (navigator.storage?.persist) {
      navigator.storage.persist().then(granted => {
        logger.log(`[Storage] Persistence ${granted ? 'granted' : 'denied'}`);
      });
    }

    // Log storage quota and usage for diagnostics
    if (navigator.storage?.estimate) {
      navigator.storage.estimate().then(estimate => {
        const usedMB = (estimate.usage / 1024 / 1024).toFixed(2);
        const quotaMB = (estimate.quota / 1024 / 1024).toFixed(2);
        const percentUsed = ((estimate.usage / estimate.quota) * 100).toFixed(1);
        logger.log(`[Storage] Quota: ${quotaMB}MB, Used: ${usedMB}MB (${percentUsed}%)`);
      });
    }

    setLoading(false);
  }, []);

  // Context value with all contact operations
  const contextValue = {
    // Data
    contacts,
    // Operations
    getContact,
    setContact,
    deleteContact,
    reorderContacts,
    canAddContact,
    // Error state
    storageError,
    setStorageError
  };

  return (
    loading ? null :
      <StorageContext.Provider value={contextValue}>
        <Analytics />
        {storageError && (
          <div style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#EF4444',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            maxWidth: '90%',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '500'
          }}>
            Unable to save your data. Check browser storage settings.
            <button
              onClick={() => setStorageError(false)}
              style={{
                marginLeft: '12px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Dismiss
            </button>
          </div>
        )}
        <ErrorBoundary>
          <div key={router.pathname} className="page-enter">
            <Component {...pageProps} />
          </div>
        </ErrorBoundary>
      </StorageContext.Provider>
  )
}

export default MyApp;
