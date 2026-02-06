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
    'whatsapp', 'signal', 'telegram', 'discord',
    // Video
    'youtube', 'twitch',
    // Music
    'spotify', 'soundcloud', 'applemusic',
    // Professional
    'linkedin', 'github',
    // Booking
    'calendly', 'cal',
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

// Minimum time between donation prompts (24 hours)
export const DONATE_PROMPT_COOLDOWN_MS = 24 * 60 * 60 * 1000;

// Labels for each link type
export const LINK_LABELS = {
    instagram: 'Instagram',
    tiktok: 'TikTok',
    twitter: 'X (Twitter)',
    snapchat: 'Snapchat',
    facebook: 'Facebook',
    whatsapp: 'WhatsApp',
    signal: 'Signal',
    telegram: 'Telegram',
    discord: 'Discord',
    youtube: 'YouTube',
    twitch: 'Twitch',
    spotify: 'Spotify',
    soundcloud: 'SoundCloud',
    applemusic: 'Apple Music',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    calendly: 'Calendly',
    cal: 'Cal.com',
    venmo: 'Venmo',
    cashapp: 'Cash App',
    paypal: 'PayPal',
    magicmessage: 'Magic Message',
    custom: 'Custom Link'
};

// URL prefixes for generating full URLs from usernames
export const LINK_URL_PREPENDS = {
    instagram: 'https://instagram.com/',
    tiktok: 'https://tiktok.com/@',
    twitter: 'https://x.com/',
    snapchat: 'https://snapchat.com/add/',
    facebook: 'https://facebook.com/',
    whatsapp: 'https://wa.me/',
    signal: 'https://signal.me/#eu/',
    telegram: 'https://t.me/',
    discord: 'https://discord.gg/',
    youtube: 'https://youtube.com/@',
    twitch: 'https://twitch.tv/',
    spotify: 'https://open.spotify.com/artist/',
    soundcloud: 'https://soundcloud.com/',
    applemusic: 'https://music.apple.com/artist/',
    linkedin: 'https://linkedin.com/in/',
    github: 'https://github.com/',
    calendly: 'https://calendly.com/',
    cal: 'https://cal.com/',
    venmo: 'https://venmo.com/',
    cashapp: 'https://cash.app/$',
    paypal: 'https://paypal.me/',
};

// Display name prefixes (e.g. @ for Twitter, $ for Cash App)
export const LINK_DISPLAY_NAME_PREPENDS = {
    instagram: '@',
    tiktok: '@',
    twitter: '@',
    snapchat: '@',
    telegram: '@',
    youtube: '@',
    linkedin: '@',
    github: '@',
    venmo: '@',
    cashapp: '$',
    paypal: '@',
};

// Placeholders for each link type
export const LINK_PLACEHOLDERS = {
    instagram: 'champagnepapi',
    tiktok: 'duolingo',
    twitter: 'tylerthecreator',
    snapchat: 'djkhaled305',
    facebook: 'yourauntie',
    whatsapp: '+16789998212',
    signal: '+16789998212',
    telegram: 'satoshi',
    discord: 'invite / user ID',
    youtube: 'MrBeast / channel ID',
    twitch: 'kaicenat',
    spotify: 'artist ID / username',
    soundcloud: 'lilb',
    applemusic: 'artist ID',
    linkedin: 'garyvee',
    github: 'torvalds',
    calendly: 'timcook/30',
    cal: 'timcook/30',
    venmo: 'kevinhart4real',
    cashapp: '$travisscott',
    paypal: 'elonmusk',
    magicmessage: '',
    custom: 'https://hmu.world'
};
