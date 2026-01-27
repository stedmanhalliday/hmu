/**
 * Shared constants used across the application.
 * Centralizing these prevents duplication and ensures consistency.
 */

// Order of social links in forms and preview
export const DEFAULT_LINK_ORDER = ['twitter', 'linkedin', 'github', 'telegram', 'instagram', 'venmo', 'custom'];

// localStorage key for persisting link order preference
export const LINK_ORDER_STORAGE_KEY = 'linkOrder';

// Labels for each link type
export const LINK_LABELS = {
    twitter: 'X (Twitter)',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    telegram: 'Telegram',
    instagram: 'Instagram',
    venmo: 'Venmo',
    custom: 'Link'
};

// Placeholders for each link type
export const LINK_PLACEHOLDERS = {
    twitter: 'snoopdogg',
    linkedin: 'snoopdogg',
    github: 'snoopdogg',
    telegram: 'snoopdogg',
    instagram: 'snoopdogg',
    venmo: 'snoopdogg',
    custom: 'https://hmu.world'
};
