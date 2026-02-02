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
    // Custom
    'custom'
];

// localStorage key for persisting link order preference
export const LINK_ORDER_STORAGE_KEY = 'linkOrder';

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
    custom: 'Link'
};

// Placeholders for each link type
export const LINK_PLACEHOLDERS = {
    instagram: 'snoopdogg',
    tiktok: 'snoopdogg',
    twitter: 'snoopdogg',
    snapchat: 'snoopdogg',
    facebook: 'snoopdogg',
    whatsapp: 'phone number',
    telegram: 'snoopdogg',
    discord: 'invite or user ID',
    youtube: '@snoopdogg or channel ID',
    twitch: 'snoopdogg',
    spotify: 'artist ID or username',
    soundcloud: 'snoopdogg',
    applemusic: 'artist ID',
    linkedin: 'snoopdogg',
    github: 'snoopdogg',
    venmo: 'snoopdogg',
    cashapp: '$snoopdogg',
    paypal: 'snoopdogg',
    custom: 'https://hmu.world'
};
