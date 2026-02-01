/**
 * Shared constants used across the application.
 * Centralizing these prevents duplication and ensures consistency.
 */

// Order of social links in forms and preview
// Grouped logically: Professional/Tech → Social Media → Video/Streaming → Community/Utility
export const DEFAULT_LINK_ORDER = [
    // Professional / Tech-Forward
    'twitter', 'linkedin', 'github',
    // Social Media
    'instagram', 'facebook', 'snapchat', 'tiktok',
    // Video / Streaming
    'youtube', 'twitch',
    // Community / Utility
    'telegram', 'discord', 'venmo', 'custom'
];

// localStorage key for persisting link order preference
export const LINK_ORDER_STORAGE_KEY = 'linkOrder';

// Labels for each link type
export const LINK_LABELS = {
    twitter: 'X (Twitter)',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    instagram: 'Instagram',
    facebook: 'Facebook',
    snapchat: 'Snapchat',
    tiktok: 'TikTok',
    youtube: 'YouTube',
    twitch: 'Twitch',
    telegram: 'Telegram',
    discord: 'Discord',
    venmo: 'Venmo',
    custom: 'Link'
};

// Placeholders for each link type
export const LINK_PLACEHOLDERS = {
    twitter: 'snoopdogg',
    linkedin: 'snoopdogg',
    github: 'snoopdogg',
    instagram: 'snoopdogg',
    facebook: 'snoopdogg',
    snapchat: 'snoopdogg',
    tiktok: 'snoopdogg',
    youtube: '@snoopdogg or channel ID',
    twitch: 'snoopdogg',
    telegram: 'snoopdogg',
    discord: 'invite or user ID',
    venmo: 'snoopdogg',
    custom: 'https://hmu.world'
};
