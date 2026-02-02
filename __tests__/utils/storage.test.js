import {
  safeGetItem,
  safeSetItem,
  safeRemoveItem,
  safeParseVibe,
  generateContactId,
  createEmptyContact,
  STORAGE_KEYS,
  EMPTY_FORM_VALUES,
  EMPTY_LINK_VALUES,
  MAX_CONTACTS
} from '../../utils/storage';

describe('storage utilities', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('safeGetItem', () => {
    it('should return parsed JSON for valid stored data', () => {
      const testData = { name: 'Test', value: 123 };
      localStorage.setItem('testKey', JSON.stringify(testData));
      
      const result = safeGetItem('testKey');
      
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent key', () => {
      const result = safeGetItem('nonExistentKey');
      
      expect(result).toBeNull();
    });

    it('should return null for corrupted JSON', () => {
      localStorage.setItem('corruptedKey', 'not valid json {{{');
      
      const result = safeGetItem('corruptedKey');
      
      expect(result).toBeNull();
    });

    it('should handle arrays correctly', () => {
      const testArray = [1, 2, 3, 'test'];
      localStorage.setItem('arrayKey', JSON.stringify(testArray));
      
      const result = safeGetItem('arrayKey');
      
      expect(result).toEqual(testArray);
    });

    it('should handle boolean values', () => {
      localStorage.setItem('boolKey', JSON.stringify(true));
      
      const result = safeGetItem('boolKey');
      
      expect(result).toBe(true);
    });
  });

  describe('safeSetItem', () => {
    it('should store JSON stringified data', () => {
      const testData = { name: 'Test' };
      
      const result = safeSetItem('testKey', testData);
      
      expect(result).toBe(true);
      expect(localStorage.getItem('testKey')).toBe(JSON.stringify(testData));
    });

    it('should return true on successful write', () => {
      const result = safeSetItem('key', 'value');
      
      expect(result).toBe(true);
    });

    it('should handle complex nested objects', () => {
      const complexData = {
        contacts: [
          { id: '1', formValues: { name: 'Test' } }
        ],
        settings: { theme: 'dark' }
      };
      
      const result = safeSetItem('complexKey', complexData);
      
      expect(result).toBe(true);
      expect(safeGetItem('complexKey')).toEqual(complexData);
    });

    it('should handle QuotaExceededError gracefully', () => {
      // Mock localStorage.setItem to throw QuotaExceededError
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = jest.fn(() => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      });

      const result = safeSetItem('key', 'value');

      expect(result).toBe(false);
      
      Storage.prototype.setItem = originalSetItem;
    });
  });

  describe('safeRemoveItem', () => {
    it('should remove item from localStorage', () => {
      localStorage.setItem('toRemove', 'value');
      
      const result = safeRemoveItem('toRemove');
      
      expect(result).toBe(true);
      expect(localStorage.getItem('toRemove')).toBeNull();
    });

    it('should return true even for non-existent keys', () => {
      const result = safeRemoveItem('nonExistent');
      
      expect(result).toBe(true);
    });
  });

  describe('safeParseVibe', () => {
    const ANON_VIBE = {
      label: 'Anon',
      emoji: '👤',
      group: ['#C9D4E1', '#20293B']
    };

    it('should parse valid vibe JSON string', () => {
      const vibe = {
        label: 'Hot',
        emoji: '🔥',
        group: ['#f9d423', '#ff4e50']
      };
      const vibeString = JSON.stringify(vibe);
      
      const result = safeParseVibe(vibeString);
      
      expect(result).toEqual(vibe);
    });

    it('should return ANON_VIBE for null input', () => {
      const result = safeParseVibe(null);
      
      expect(result).toEqual(ANON_VIBE);
    });

    it('should return ANON_VIBE for undefined input', () => {
      const result = safeParseVibe(undefined);
      
      expect(result).toEqual(ANON_VIBE);
    });

    it('should return ANON_VIBE for empty string', () => {
      const result = safeParseVibe('');
      
      expect(result).toEqual(ANON_VIBE);
    });

    it('should return ANON_VIBE for invalid JSON', () => {
      const result = safeParseVibe('not valid json');
      
      expect(result).toEqual(ANON_VIBE);
    });

    it('should return ANON_VIBE for vibe missing label', () => {
      const incompleteVibe = { emoji: '🔥', group: ['#fff'] };
      
      const result = safeParseVibe(JSON.stringify(incompleteVibe));
      
      expect(result).toEqual(ANON_VIBE);
    });

    it('should return ANON_VIBE for vibe missing emoji', () => {
      const incompleteVibe = { label: 'Hot', group: ['#fff'] };
      
      const result = safeParseVibe(JSON.stringify(incompleteVibe));
      
      expect(result).toEqual(ANON_VIBE);
    });

    it('should return ANON_VIBE for vibe with non-array group', () => {
      const invalidVibe = { label: 'Hot', emoji: '🔥', group: 'not an array' };
      
      const result = safeParseVibe(JSON.stringify(invalidVibe));
      
      expect(result).toEqual(ANON_VIBE);
    });
  });

  describe('generateContactId', () => {
    it('should generate unique IDs', () => {
      const id1 = generateContactId();
      const id2 = generateContactId();
      
      expect(id1).not.toBe(id2);
    });

    it('should start with "contact-" prefix', () => {
      const id = generateContactId();
      
      expect(id).toMatch(/^contact-/);
    });

    it('should contain timestamp', () => {
      const before = Date.now();
      const id = generateContactId();
      const after = Date.now();
      
      // Extract timestamp from ID (format: contact-{timestamp}-{random})
      const timestamp = parseInt(id.split('-')[1]);
      
      expect(timestamp).toBeGreaterThanOrEqual(before);
      expect(timestamp).toBeLessThanOrEqual(after);
    });
  });

  describe('createEmptyContact', () => {
    it('should create contact with unique ID', () => {
      const contact1 = createEmptyContact();
      const contact2 = createEmptyContact();
      
      expect(contact1.id).not.toBe(contact2.id);
    });

    it('should have empty formValues', () => {
      const contact = createEmptyContact();
      
      expect(contact.formValues).toEqual(EMPTY_FORM_VALUES);
    });

    it('should have empty linkValues', () => {
      const contact = createEmptyContact();
      
      expect(contact.linkValues).toEqual(EMPTY_LINK_VALUES);
    });

    it('should not share references between contacts', () => {
      const contact1 = createEmptyContact();
      const contact2 = createEmptyContact();
      
      contact1.formValues.name = 'Modified';
      
      expect(contact2.formValues.name).toBe('');
    });
  });

  describe('constants', () => {
    it('should have correct STORAGE_KEYS', () => {
      expect(STORAGE_KEYS.FORM_VALUES).toBe('formValues');
      expect(STORAGE_KEYS.LINK_VALUES).toBe('linkValues');
      expect(STORAGE_KEYS.CONTACTS).toBe('contacts');
      expect(STORAGE_KEYS.CONVERTED).toBe('converted');
      expect(STORAGE_KEYS.MIGRATION_COMPLETE).toBe('MIGRATION_COMPLETE');
      expect(STORAGE_KEYS.CONTACTS_MIGRATION_COMPLETE).toBe('CONTACTS_MIGRATION_COMPLETE');
    });

    it('should have correct EMPTY_FORM_VALUES structure', () => {
      expect(EMPTY_FORM_VALUES).toEqual({
        name: '',
        phone: '',
        email: '',
        url: '',
        vibe: '',
        photo: ''
      });
    });

    it('should have correct EMPTY_LINK_VALUES structure', () => {
      expect(EMPTY_LINK_VALUES).toEqual({
        instagram: '',
        tiktok: '',
        twitter: '',
        snapchat: '',
        facebook: '',
        whatsapp: '',
        telegram: '',
        discord: '',
        youtube: '',
        twitch: '',
        spotify: '',
        soundcloud: '',
        applemusic: '',
        linkedin: '',
        github: '',
        venmo: '',
        cashapp: '',
        paypal: '',
        custom: ''
      });
    });

    it('should have MAX_CONTACTS set to 3', () => {
      expect(MAX_CONTACTS).toBe(3);
    });
  });
});
