import { memo, useCallback } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SOCIAL_ICONS } from '../lib/socialIcons.js';
import { LINK_LABELS, LINK_PLACEHOLDERS } from '../lib/constants.js';

const ActiveLinkRow = memo(function ActiveLinkRow({ id, value, onChange, onRemove, inputRef }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition?.replace(/(\d+)ms/, '150ms'),
        opacity: isDragging ? 0.5 : 1,
    };

    const icon = SOCIAL_ICONS[id] || SOCIAL_ICONS.custom;
    const label = LINK_LABELS[id] || 'Link';
    const placeholder = LINK_PLACEHOLDERS[id] || '';

    const handleRemove = useCallback(() => {
        onRemove(id);
    }, [id, onRemove]);

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 mb-2 bg-white rounded-lg border border-slate-200 shadow-sm py-2 px-2">
            {/* Drag handle */}
            <button
                type="button"
                className="p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 touch-none shrink-0"
                aria-label="Reorder"
                aria-roledescription="sortable"
                {...attributes}
                {...listeners}
            >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="4" cy="3" r="1.5" />
                    <circle cx="12" cy="3" r="1.5" />
                    <circle cx="4" cy="8" r="1.5" />
                    <circle cx="12" cy="8" r="1.5" />
                    <circle cx="4" cy="13" r="1.5" />
                    <circle cx="12" cy="13" r="1.5" />
                </svg>
            </button>

            {/* Platform icon */}
            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                <img src={icon.src} alt="" className="w-[46%] h-[46%] pointer-events-none" aria-hidden="true" />
            </div>

            {/* Label + input stack */}
            <div className="flex-1 min-w-0">
                <span className="text-xs text-slate-500 leading-none">{label}</span>
                <input
                    type="text"
                    name={id}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                    ref={inputRef}
                    aria-label={label}
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="block w-full text-base text-slate-800 bg-transparent outline-none placeholder:text-slate-400 leading-tight"
                />
            </div>

            {/* Remove button */}
            <button
                type="button"
                onClick={handleRemove}
                aria-label={`Remove ${label}`}
                className="p-1 text-slate-300 hover:text-red-500 active:text-red-600 shrink-0"
            >
                <svg width="20" height="20" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
            </button>
        </div>
    );
});

export default ActiveLinkRow;
