import {
    DEFAULT_LINK_ORDER,
    LINK_ORDER_STORAGE_KEY,
    MAGIC_MESSAGE_PREVIEW_LENGTH,
    LINK_LABELS,
    LINK_PLACEHOLDERS,
    LINK_URL_PREPENDS,
    LINK_DISPLAY_NAME_PREPENDS,
} from '../../lib/constants';

describe('constants', () => {
    describe('DEFAULT_LINK_ORDER', () => {
        it('should contain all expected social platforms', () => {
            const expected = [
                'instagram', 'tiktok', 'twitter', 'snapchat', 'facebook',
                'whatsapp', 'telegram', 'discord', 'youtube', 'twitch',
                'spotify', 'soundcloud', 'applemusic',
                'linkedin', 'github', 'calendly', 'cal',
                'venmo', 'cashapp', 'paypal',
                'magicmessage', 'custom'
            ];
            expect(DEFAULT_LINK_ORDER).toEqual(expected);
        });

        it('should not have duplicates', () => {
            const unique = new Set(DEFAULT_LINK_ORDER);
            expect(unique.size).toBe(DEFAULT_LINK_ORDER.length);
        });
    });

    describe('LINK_LABELS', () => {
        it('should have a label for every key in DEFAULT_LINK_ORDER', () => {
            for (const key of DEFAULT_LINK_ORDER) {
                expect(LINK_LABELS[key]).toBeDefined();
                expect(typeof LINK_LABELS[key]).toBe('string');
                expect(LINK_LABELS[key].length).toBeGreaterThan(0);
            }
        });
    });

    describe('LINK_PLACEHOLDERS', () => {
        it('should have a placeholder for every key in DEFAULT_LINK_ORDER', () => {
            for (const key of DEFAULT_LINK_ORDER) {
                expect(LINK_PLACEHOLDERS).toHaveProperty(key);
            }
        });
    });

    describe('LINK_URL_PREPENDS', () => {
        it('should have valid URL prefixes', () => {
            for (const [key, url] of Object.entries(LINK_URL_PREPENDS)) {
                expect(url).toMatch(/^https:\/\//);
                expect(DEFAULT_LINK_ORDER).toContain(key);
            }
        });

        it('should not include magicmessage or custom', () => {
            expect(LINK_URL_PREPENDS).not.toHaveProperty('magicmessage');
            expect(LINK_URL_PREPENDS).not.toHaveProperty('custom');
        });
    });

    describe('LINK_DISPLAY_NAME_PREPENDS', () => {
        it('should only contain @ or $ prefixes', () => {
            for (const prepend of Object.values(LINK_DISPLAY_NAME_PREPENDS)) {
                expect(['@', '$']).toContain(prepend);
            }
        });

        it('should have $ prefix for cashapp', () => {
            expect(LINK_DISPLAY_NAME_PREPENDS.cashapp).toBe('$');
        });

        it('should have @ prefix for twitter', () => {
            expect(LINK_DISPLAY_NAME_PREPENDS.twitter).toBe('@');
        });
    });

    describe('other constants', () => {
        it('should have a link order storage key', () => {
            expect(LINK_ORDER_STORAGE_KEY).toBe('linkOrder');
        });

        it('should have a magic message preview length', () => {
            expect(typeof MAGIC_MESSAGE_PREVIEW_LENGTH).toBe('number');
            expect(MAGIC_MESSAGE_PREVIEW_LENGTH).toBeGreaterThan(0);
        });
    });
});
