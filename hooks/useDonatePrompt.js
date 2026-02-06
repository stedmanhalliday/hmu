import { useState, useEffect, useRef } from 'react';
import { safeGetItem, safeSetItem, STORAGE_KEYS } from '../utils/storage.js';
import { DONATE_PROMPT_COOLDOWN_MS } from '../lib/constants.js';

/**
 * Hook for auto-triggering donation prompts based on user engagement signals.
 *
 * @param {{ loading: boolean, contacts: Array, tapCount: number }} params
 * @returns {{ donateModal: string|null, dismissDonateModal: Function }}
 */
export function useDonatePrompt({ loading, contacts, tapCount }) {
    const [donateModal, setDonateModal] = useState(null);
    const timerRef = useRef(null);

    useEffect(() => {
        if (loading || !contacts || contacts.length === 0) return;
        if (timerRef.current) return;

        const lastShown = safeGetItem(STORAGE_KEYS.DONATE_PROMPT_LAST_SHOWN_AT);
        if (lastShown && Date.now() - lastShown < DONATE_PROMPT_COOLDOWN_MS) return;

        const prompt1Seen = safeGetItem(STORAGE_KEYS.DONATE_PROMPT_1_SEEN);
        const prompt2Seen = safeGetItem(STORAGE_KEYS.DONATE_PROMPT_2_SEEN);

        if (prompt1Seen && prompt2Seen) return;

        const anyContactHasLinks = (min) => contacts.some(c => {
            if (!c.linkValues) return false;
            return Object.values(c.linkValues).filter(v => v && v !== "").length >= min;
        });

        const anyPowerFeature = contacts.some(c =>
            c.linkValues && (c.linkValues.custom || c.linkValues.magicmessage)
        );

        if (!prompt1Seen) {
            if (anyContactHasLinks(1) && tapCount >= 2) {
                timerRef.current = setTimeout(() => {
                    setDonateModal("contribute");
                    safeSetItem(STORAGE_KEYS.DONATE_PROMPT_1_SEEN, true);
                    safeSetItem(STORAGE_KEYS.DONATE_PROMPT_LAST_SHOWN_AT, Date.now());
                    timerRef.current = null;
                }, 2000);
            }
            return;
        }

        const qualifies = contacts.length >= 2
            || anyContactHasLinks(4)
            || anyPowerFeature
            || tapCount >= 8;
        if (qualifies) {
            timerRef.current = setTimeout(() => {
                setDonateModal("donate");
                safeSetItem(STORAGE_KEYS.DONATE_PROMPT_2_SEEN, true);
                safeSetItem(STORAGE_KEYS.DONATE_PROMPT_LAST_SHOWN_AT, Date.now());
                timerRef.current = null;
            }, 2000);
        }
    }, [loading, contacts, tapCount]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const dismissDonateModal = () => setDonateModal(null);

    return { donateModal, dismissDonateModal };
}
