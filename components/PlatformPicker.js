import { SOCIAL_ICONS } from '../lib/socialIcons.js';
import { LINK_LABELS } from '../lib/constants.js';

export default function PlatformPicker({ availablePlatforms, onAdd }) {
    const platformKeys = availablePlatforms.filter(k => k !== 'custom');
    const showCustom = availablePlatforms.includes('custom');

    if (platformKeys.length === 0 && !showCustom) {
        return null;
    }

    return (
        <div className="mt-6 mb-4">
            <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">Add a link</p>

            {platformKeys.length > 0 && (
                <div className="grid grid-cols-6 gap-2 justify-items-center">
                    {platformKeys.map(key => {
                        const icon = SOCIAL_ICONS[key];
                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => onAdd(key)}
                                aria-label={`Add ${LINK_LABELS[key]}`}
                                className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200
                                    flex items-center justify-center
                                    active:scale-95 transition-transform"
                            >
                                <img src={icon.src} alt="" className="w-[46%] h-[46%] pointer-events-none" aria-hidden="true" />
                            </button>
                        );
                    })}
                </div>
            )}

            {showCustom && (
                <button
                    type="button"
                    onClick={() => onAdd('custom')}
                    className="mt-3 w-full py-3 rounded-lg border border-dashed border-slate-300
                        text-sm text-slate-500 flex items-center justify-center gap-2
                        active:bg-slate-50 transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                    <span className="uppercase tracking-widest">Custom Link</span>
                </button>
            )}
        </div>
    );
}
