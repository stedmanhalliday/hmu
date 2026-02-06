import { processURL, resolvePhoneUrl } from '../../utils/url';

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

describe('resolvePhoneUrl', () => {
  const config = {
    fullUrlPattern: /^https?:\/\/example\.com/,
    phoneBase: 'https://example.com/phone/+',
    usernameFallback: { displayNamePrepend: '@', urlPrepend: 'https://example.com/' }
  };

  it('should return full URL as-is when matching fullUrlPattern', () => {
    const result = resolvePhoneUrl('https://example.com/user/123', config);
    expect(result.url).toBe('https://example.com/user/123');
    expect(result.displayName).toBe('example.com');
  });

  it('should detect phone number with + prefix', () => {
    const result = resolvePhoneUrl('+16789998212', config);
    expect(result.url).toBe('https://example.com/phone/+16789998212');
    expect(result.displayName).toBe('+16789998212');
  });

  it('should detect plain digit phone number', () => {
    const result = resolvePhoneUrl('16789998212', config);
    expect(result.url).toBe('https://example.com/phone/+16789998212');
    expect(result.displayName).toBe('16789998212');
  });

  it('should strip formatting from phone numbers', () => {
    const result = resolvePhoneUrl('+1 (678) 999-8212', config);
    expect(result.url).toBe('https://example.com/phone/+16789998212');
    expect(result.displayName).toBe('+1 (678) 999-8212');
  });

  it('should strip dots from phone numbers', () => {
    const result = resolvePhoneUrl('+1.678.999.8212', config);
    expect(result.url).toBe('https://example.com/phone/+16789998212');
    expect(result.displayName).toBe('+1.678.999.8212');
  });

  it('should fall back to username for non-phone strings', () => {
    const result = resolvePhoneUrl('myusername', config);
    expect(result.url).toBe('https://example.com/myusername');
    expect(result.displayName).toBe('@myusername');
  });

  it('should treat short digit strings as usernames', () => {
    const result = resolvePhoneUrl('123456', config);
    expect(result.url).toBe('https://example.com/123456');
    expect(result.displayName).toBe('@123456');
  });

  it('should treat 7 digits as a phone number', () => {
    const result = resolvePhoneUrl('5551234', config);
    expect(result.url).toBe('https://example.com/phone/+5551234');
    expect(result.displayName).toBe('5551234');
  });

  it('should use empty displayNamePrepend when configured', () => {
    const noPrefix = {
      ...config,
      usernameFallback: { displayNamePrepend: '', urlPrepend: 'https://example.com/u/' }
    };
    const result = resolvePhoneUrl('myuser', noPrefix);
    expect(result.displayName).toBe('myuser');
    expect(result.url).toBe('https://example.com/u/myuser');
  });
});
