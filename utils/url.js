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
