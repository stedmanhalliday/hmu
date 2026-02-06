import { processURL } from '../../utils/url';

describe('processURL', () => {
  describe('domain extraction', () => {
    it('should extract domain from full URL with https', () => {
      expect(processURL('https://www.example.com/path')).toBe('example.com');
    });

    it('should extract domain from URL with http', () => {
      expect(processURL('http://example.com/path')).toBe('example.com');
    });

    it('should extract domain without protocol', () => {
      expect(processURL('example.com/path')).toBe('example.com');
    });

    it('should strip www prefix', () => {
      expect(processURL('https://www.github.com')).toBe('github.com');
    });

    it('should handle URL with port number', () => {
      expect(processURL('https://example.com:8080/path')).toBe('example.com');
    });

    it('should handle URL with query string', () => {
      expect(processURL('https://example.com/path?query=1')).toBe('example.com');
    });

    it('should handle URL with auth info', () => {
      expect(processURL('https://user@example.com/path')).toBe('example.com');
    });

    it('should handle subdomain URLs', () => {
      expect(processURL('https://blog.example.com/post')).toBe('blog.example.com');
    });
  });

  describe('edge cases', () => {
    it('should return empty string for empty input', () => {
      expect(processURL('')).toBe('');
    });

    it('should return empty string for null input', () => {
      expect(processURL(null)).toBe('');
    });

    it('should return empty string for undefined input', () => {
      expect(processURL(undefined)).toBe('');
    });

    it('should return original string for non-URL input', () => {
      expect(processURL('not-a-url')).toBe('not-a-url');
    });

    it('should handle URL with trailing slash', () => {
      expect(processURL('https://example.com/')).toBe('example.com');
    });
  });
});
