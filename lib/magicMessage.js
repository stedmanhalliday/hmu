const DEFAULT_MAGIC_MESSAGE = { type: 'email', recipient: '', body: '' };

/**
 * Parse a magic message JSON string into a structured object.
 * Returns a default object on invalid input.
 */
export function parseMagicMessage(jsonString) {
    if (!jsonString) return null;
    try {
        const parsed = JSON.parse(jsonString);
        return {
            type: parsed.type === 'sms' ? 'sms' : 'email',
            recipient: parsed.recipient || '',
            subject: parsed.subject || '',
            body: parsed.body || '',
        };
    } catch {
        return { ...DEFAULT_MAGIC_MESSAGE };
    }
}

/**
 * Build a mailto: or sms: URL from a parsed magic message object.
 */
export function buildMagicMessageUrl(parsed) {
    if (!parsed || !parsed.recipient) return '';

    if (parsed.type === 'email') {
        const params = new URLSearchParams();
        if (parsed.subject) params.set('subject', parsed.subject);
        if (parsed.body) params.set('body', parsed.body);
        const query = params.toString();
        return `mailto:${parsed.recipient}${query ? '?' + query : ''}`;
    }

    const encodedBody = encodeURIComponent(parsed.body || '');
    return `sms:${parsed.recipient}${encodedBody ? '?body=' + encodedBody : ''}`;
}

/**
 * Build a display label like "Magic Message (Email)" or "Magic Message (SMS)".
 */
export function magicMessageLabel(parsed) {
    if (!parsed) return 'Magic Message';
    return `Magic Message (${parsed.type === 'sms' ? 'SMS' : 'Email'})`;
}
