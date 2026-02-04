/**
 * Shared constants used across the application.
 * Centralizing these prevents duplication and ensures consistency.
 */

// Order of social links in forms and preview
// Grouped logically: Social → Messaging → Video → Music → Professional → Payment → Custom
export const DEFAULT_LINK_ORDER = [
    // Social
    'instagram', 'tiktok', 'twitter', 'snapchat', 'facebook',
    // Messaging
    'whatsapp', 'telegram', 'discord',
    // Video
    'youtube', 'twitch',
    // Music
    'spotify', 'soundcloud', 'applemusic',
    // Professional
    'linkedin', 'github',
    // Payment
    'venmo', 'cashapp', 'paypal',
    // Magic Message
    'magicmessage',
    // Custom
    'custom'
];

// localStorage key for persisting link order preference
export const LINK_ORDER_STORAGE_KEY = 'linkOrder';

// Max characters to show for magic message body in preview
export const MAGIC_MESSAGE_PREVIEW_LENGTH = 20;

// Labels for each link type
export const LINK_LABELS = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    twitter: 'X (Twitter)',
    snapchat: 'Snapchat',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    discord: 'Discord',
    youtube: 'YouTube',
    twitch: 'Twitch',
    spotify: 'Spotify',
    soundcloud: 'SoundCloud',
    applemusic: 'Apple Music',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    venmo: 'Venmo',
    cashapp: 'Cash App',
    paypal: 'PayPal',
    magicmessage: 'Magic Message',
    custom: 'Custom Link'
};

// Placeholders for each link type
export const LINK_PLACEHOLDERS = {
    instagram: 'champagnepapi',
    tiktok: 'duolingo',
    twitter: 'tylerthecreator',
    snapchat: 'djkhaled305',
    facebook: 'yourauntie',
    whatsapp: '+16789998212',
    telegram: 'satoshi',
    discord: 'invite or user ID',
    youtube: '@MrBeast or channel ID',
    twitch: 'kaicenat',
    spotify: 'artist ID or username',
    soundcloud: 'lilb',
    applemusic: 'artist ID',
    linkedin: 'garyvee',
    github: 'torvalds',
    venmo: 'kevinhart4real',
    cashapp: '$travisscott',
    paypal: 'elonmusk',
    magicmessage: '',
    custom: 'https://hmu.world'
};
