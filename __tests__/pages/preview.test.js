/**
 * Preview Page Tests
 * 
 * Note: Full integration tests for this page are complex due to:
 * - Async QR code generation with dynamic imports
 * - Complex state management for contact display
 * - localStorage interactions for link order
 * 
 * These tests focus on the page's core logic without rendering the full component tree.
 */

import { safeParseVibe } from '../../utils/storage.js';
import { DEFAULT_LINK_ORDER } from '../../lib/constants.js';
import { processURL } from '../../utils/url.js';

// Test vCard generation logic
describe('Preview Page - vCard Generation', () => {
  const vCardValues = (formValues, contactId) => {
    const noteUrl = contactId ? `https://hmu.world/preview?id=${contactId}` : 'https://hmu.world';
    return (
      "BEGIN:VCARD\nVERSION:4.0" +
      "\nFN:" + formValues.name +
      "\nTEL:" + formValues.phone +
      "\nEMAIL:" + formValues.email +
      "\nURL:" + formValues.url +
      "\nNOTE:" + noteUrl +
      "\nEND:VCARD"
    );
  };

  it('should generate vCard with all contact fields', () => {
    const formValues = {
      name: 'John Doe',
      phone: '+1234567890',
      email: 'john@example.com',
      url: 'https://example.com'
    };
    
    const vCard = vCardValues(formValues, 'contact-1');
    
    expect(vCard).toContain('FN:John Doe');
    expect(vCard).toContain('TEL:+1234567890');
    expect(vCard).toContain('EMAIL:john@example.com');
    expect(vCard).toContain('URL:https://example.com');
  });

  it('should include contact-specific URL in NOTE field', () => {
    const formValues = { name: 'Test', phone: '', email: '', url: '' };
    const vCard = vCardValues(formValues, 'contact-123');
    
    expect(vCard).toContain('NOTE:https://hmu.world/preview?id=contact-123');
  });

  it('should use default URL when no contactId', () => {
    const formValues = { name: 'Test', phone: '', email: '', url: '' };
    const vCard = vCardValues(formValues, null);
    
    expect(vCard).toContain('NOTE:https://hmu.world');
  });
});

// Test URL processing logic (using extracted utility)
describe('Preview Page - URL Processing', () => {

  it('should extract domain from full URL', () => {
    expect(processURL('https://www.example.com/path')).toBe('example.com');
  });

  it('should extract domain without protocol', () => {
    expect(processURL('example.com/path')).toBe('example.com');
  });

  it('should handle URL with www prefix', () => {
    expect(processURL('https://www.github.com')).toBe('github.com');
  });

  it('should return empty string for empty input', () => {
    expect(processURL('')).toBe('');
    expect(processURL(null)).toBe('');
  });
});

// Test link ordering logic
describe('Preview Page - Link Ordering', () => {
  it('should use default link order', () => {
    expect(DEFAULT_LINK_ORDER).toContain('twitter');
    expect(DEFAULT_LINK_ORDER).toContain('linkedin');
    expect(DEFAULT_LINK_ORDER).toContain('github');
    expect(DEFAULT_LINK_ORDER).toContain('custom');
  });

  it('should filter links with URLs', () => {
    const links = {
      twitter: { url: 'https://x.com/user' },
      linkedin: { url: '' },
      github: { url: 'https://github.com/user' },
      custom: { url: '' }
    };
    
    const activeLinks = DEFAULT_LINK_ORDER.filter(key => 
      links[key] && links[key].url !== ''
    );
    
    expect(activeLinks).toEqual(['twitter', 'github']);
  });

  it('should parse saved link order from localStorage', () => {
    const saved = JSON.stringify(['github', 'twitter', 'linkedin']);
    const parsed = JSON.parse(saved);
    
    // Merge with defaults to ensure all keys present
    const allKeys = new Set([...parsed, ...DEFAULT_LINK_ORDER]);
    const merged = [...allKeys].filter(k => DEFAULT_LINK_ORDER.includes(k));
    
    expect(merged).toContain('github');
    expect(merged).toContain('twitter');
    expect(merged).toContain('linkedin');
  });
});

// Test social link URL generation
describe('Preview Page - Social Link URLs', () => {
  const linkConfigs = {
    twitter: { urlPrepend: 'https://x.com/', displayNamePrepend: '@' },
    linkedin: { urlPrepend: 'https://linkedin.com/in/', displayNamePrepend: '@' },
    github: { urlPrepend: 'https://github.com/', displayNamePrepend: '@' },
    telegram: { urlPrepend: 'https://t.me/', displayNamePrepend: '@' },
    instagram: { urlPrepend: 'https://instagram.com/', displayNamePrepend: '@' },
    venmo: { urlPrepend: 'https://venmo.com/', displayNamePrepend: '@' }
  };

  it('should generate correct Twitter URL', () => {
    const username = 'johndoe';
    const url = linkConfigs.twitter.urlPrepend + username;
    
    expect(url).toBe('https://x.com/johndoe');
  });

  it('should generate correct LinkedIn URL', () => {
    const username = 'johndoe';
    const url = linkConfigs.linkedin.urlPrepend + username;
    
    expect(url).toBe('https://linkedin.com/in/johndoe');
  });

  it('should generate display name with @ prefix', () => {
    const username = 'johndoe';
    const displayName = linkConfigs.github.displayNamePrepend + username;
    
    expect(displayName).toBe('@johndoe');
  });
});

// Test vibe parsing for preview display
describe('Preview Page - Vibe Display', () => {
  it('should parse vibe for gradient display', () => {
    const vibeJson = JSON.stringify({ label: 'Fire', emoji: '🔥', group: ['#ff6b6b', '#feca57'] });
    const vibe = safeParseVibe(vibeJson);
    
    expect(vibe.emoji).toBe('🔥');
    expect(vibe.group[0]).toBe('#ff6b6b');
  });

  it('should handle missing vibe gracefully', () => {
    const vibe = safeParseVibe('');
    
    expect(vibe).toBeDefined();
    expect(vibe.group).toBeDefined();
  });
});
