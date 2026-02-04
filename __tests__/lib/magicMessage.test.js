import { parseMagicMessage, buildMagicMessageUrl, magicMessageLabel } from '../../lib/magicMessage.js';

describe('parseMagicMessage', () => {
    it('returns null for empty input', () => {
        expect(parseMagicMessage('')).toBeNull();
        expect(parseMagicMessage(null)).toBeNull();
        expect(parseMagicMessage(undefined)).toBeNull();
    });

    it('parses valid email JSON', () => {
        const json = JSON.stringify({ type: 'email', recipient: 'a@b.com', subject: 'Hi', body: 'Hello' });
        expect(parseMagicMessage(json)).toEqual({
            type: 'email',
            recipient: 'a@b.com',
            subject: 'Hi',
            body: 'Hello',
        });
    });

    it('parses valid sms JSON', () => {
        const json = JSON.stringify({ type: 'sms', recipient: '+16789998212', body: 'Hey' });
        expect(parseMagicMessage(json)).toEqual({
            type: 'sms',
            recipient: '+16789998212',
            subject: '',
            body: 'Hey',
        });
    });

    it('defaults unknown type to email', () => {
        const json = JSON.stringify({ type: 'fax', recipient: 'x', body: 'y' });
        expect(parseMagicMessage(json).type).toBe('email');
    });

    it('returns default object for invalid JSON', () => {
        const result = parseMagicMessage('not-json');
        expect(result).toEqual({ type: 'email', recipient: '', body: '' });
    });

    it('fills missing fields with empty strings', () => {
        const json = JSON.stringify({ type: 'sms' });
        expect(parseMagicMessage(json)).toEqual({
            type: 'sms',
            recipient: '',
            subject: '',
            body: '',
        });
    });
});

describe('buildMagicMessageUrl', () => {
    it('returns empty string for null input', () => {
        expect(buildMagicMessageUrl(null)).toBe('');
    });

    it('returns empty string when recipient is missing', () => {
        expect(buildMagicMessageUrl({ type: 'email', recipient: '', body: 'hi' })).toBe('');
    });

    it('builds mailto URL with subject and body', () => {
        const url = buildMagicMessageUrl({
            type: 'email',
            recipient: 'friend@example.com',
            subject: 'Hello',
            body: 'How are you?',
        });
        expect(url).toBe('mailto:friend@example.com?subject=Hello&body=How+are+you%3F');
    });

    it('builds mailto URL without subject', () => {
        const url = buildMagicMessageUrl({
            type: 'email',
            recipient: 'friend@example.com',
            subject: '',
            body: 'Hey',
        });
        expect(url).toBe('mailto:friend@example.com?body=Hey');
    });

    it('builds mailto URL with no body or subject', () => {
        const url = buildMagicMessageUrl({
            type: 'email',
            recipient: 'friend@example.com',
            subject: '',
            body: '',
        });
        expect(url).toBe('mailto:friend@example.com');
    });

    it('builds sms URL with query separator', () => {
        const url = buildMagicMessageUrl({
            type: 'sms',
            recipient: '+16789998212',
            body: 'Hey there',
        });
        expect(url).toBe('sms:+16789998212?body=Hey%20there');
    });

    it('builds sms URL without body', () => {
        const url = buildMagicMessageUrl({
            type: 'sms',
            recipient: '+16789998212',
            body: '',
        });
        expect(url).toBe('sms:+16789998212');
    });

    it('encodes special characters in email body', () => {
        const url = buildMagicMessageUrl({
            type: 'email',
            recipient: 'a@b.com',
            subject: 'Re: Meeting & Agenda',
            body: 'Line 1\nLine 2',
        });
        expect(url).toContain('subject=Re');
        expect(url).toContain('body=Line');
        // Ensure it's a valid URL structure
        expect(url.startsWith('mailto:a@b.com?')).toBe(true);
    });

    it('encodes special characters in sms body', () => {
        const url = buildMagicMessageUrl({
            type: 'sms',
            recipient: '+1234',
            body: 'Hello & goodbye!',
        });
        expect(url).toBe('sms:+1234?body=Hello%20%26%20goodbye!');
    });
});

describe('magicMessageLabel', () => {
    it('returns default label for null', () => {
        expect(magicMessageLabel(null)).toBe('Magic Message');
    });

    it('returns Email label', () => {
        expect(magicMessageLabel({ type: 'email' })).toBe('Magic Message (Email)');
    });

    it('returns SMS label', () => {
        expect(magicMessageLabel({ type: 'sms' })).toBe('Magic Message (SMS)');
    });
});
