/**
 * Extract the domain from a URL string.
 *
 * @param {string} url - URL to extract domain from
 * @returns {string} Domain name or original URL as fallback
 */
export function processURL(url) {
    if (!url) return "";

    const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)(?:[^/\n]*)(?:\/.*)?$/i;
    const matches = url.match(domainRegex);

    if (matches && matches.length >= 2) {
        return matches[1];
    }
    return url;
}

/**
 * Resolve a user input value to a display name and URL, handling full URLs,
 * phone numbers, and plain usernames.
 *
 * @param {string} value - Raw user input (URL, phone number, or username)
 * @param {{ fullUrlPattern: RegExp, phoneBase: string, usernameFallback: { displayNamePrepend: string, urlPrepend: string } }} config
 * @returns {{ displayName: string, url: string }}
 */
export function resolvePhoneUrl(value, { fullUrlPattern, phoneBase, usernameFallback }) {
    if (fullUrlPattern.test(value)) {
        return { displayName: processURL(value), url: value };
    }
    const stripped = value.replace(/[\s\-().]/g, '');
    if (/^\+?\d{7,15}$/.test(stripped)) {
        const digits = stripped.replace(/\D/g, '');
        return { displayName: value, url: `${phoneBase}${digits}` };
    }
    return {
        displayName: usernameFallback.displayNamePrepend + value,
        url: usernameFallback.urlPrepend + value
    };
}
