import { StorageContext } from "../pages/_app.js";
import Button from './Button.js';
import Input from './Input.js';
import Modal from './Modal.js';
import TextButton from './TextButton.js';

import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const DEFAULT_ORDER = ['twitter', 'linkedin', 'github', 'telegram', 'instagram', 'venmo', 'custom'];
const ORDER_STORAGE_KEY = 'linkOrder';

// Labels for each link type
const LINK_LABELS = {
    twitter: 'X (Twitter)',
    linkedin: 'LinkedIn',
    github: 'GitHub',
    telegram: 'Telegram',
    instagram: 'Instagram',
    venmo: 'Venmo',
    custom: 'Link'
};

// Placeholders for each link type
const LINK_PLACEHOLDERS = {
    twitter: 'snoopdogg',
    linkedin: 'snoopdogg',
    github: 'snoopdogg',
    telegram: 'snoopdogg',
    instagram: 'snoopdogg',
    venmo: 'snoopdogg',
    custom: 'https://hmu.world'
};

// Sortable input wrapper component
function SortableInput({ id, name, label, type, value, placeholder, onChange }) {
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
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-start gap-2 mb-4">
            {/* Drag handle */}
            <button
                type="button"
                className="mt-8 p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 touch-none"
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
            <div className="flex-1">
                <Input
                    name={name}
                    label={label}
                    type={type}
                    value={value}
                    placeholder={placeholder}
                    onChange={onChange}
                />
            </div>
        </div>
    );
}

export default function LinkForm({ contactId, initialLinkValues }) {
    const router = useRouter();

    const { setContact, getContact } = useContext(StorageContext);

    const [formfield, setFormfield] = useState({
        twitter: "",
        linkedin: "",
        github: "",
        telegram: "",
        instagram: "",
        venmo: "",
        custom: ""
    });

    const [modal, setModal] = useState(null);
    const [linkOrder, setLinkOrder] = useState(DEFAULT_ORDER);

    // Load saved order from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(ORDER_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Ensure all keys are present (in case new links were added)
                const allKeys = new Set([...parsed, ...DEFAULT_ORDER]);
                setLinkOrder([...allKeys].filter(k => DEFAULT_ORDER.includes(k)));
            } catch {
                // Use default on parse error
            }
        }
    }, []);

    // Configure sensors for drag-and-drop
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 200,
                tolerance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLinkOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                // Persist order to localStorage
                localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(newOrder));
                return newOrder;
            });
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormfield(prevState => ({
            ...prevState,
            [name]: value,
        }));
    }

    // get usernames from links
    // Iterative approach to prevent stack overflow on malformed URLs
    const processDisplayName = (inputString) => {
        let current = inputString;
        const maxIterations = 10; // Safety limit to prevent infinite loops

        // Iteratively extract text after last slash until no more matches
        for (let i = 0; i < maxIterations; i++) {
            const matchResult = current.match(/\/([^/?]+)(?:\?.*)?$/);
            if (matchResult) {
                current = matchResult[1];
            } else {
                break;
            }
        }

        // Remove query strings
        const textBeforeQuery = current.split('?')[0];
        // Remove "@" if present
        const textAfterAt = textBeforeQuery.replace(/^@/, '');
        return textAfterAt;
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        // Validate that contact exists before saving
        if (contactId !== 'new' && !getContact(contactId)) {
            console.error('[LinkForm] Cannot save - invalid contact ID:', contactId);
            router.push('/');
            return;
        }

        // Process form values to yield display names
        const processedLinks = Object.fromEntries(
            Object.entries(formfield).map(([key, value]) => {
                if (key == "custom") {
                    return [key, value];
                } else {
                    return [key, processDisplayName(value)];
                }
            })
        );

        // Save links to specific contact using new API
        const savedId = setContact(contactId, { linkValues: processedLinks });

        // Check if save failed (returns null when at max contacts or storage error)
        if (savedId === null) {
            setModal(
                <Modal title="Save failed" dismiss={dismiss}>
                    Unable to save links. Please try again.
                </Modal>
            );
            return;
        }

        // Log form submission
        gtag("event", "form_submit", {
            "form_id": "linkForm",
            "form_name": "Link form",
            "destination": "/links",
            "contact_id": savedId
        });

        router.push(`/preview?id=${savedId}`);
    }

    const dismiss = () => {
        setModal(null);
    }

    const cancel = () => {
        router.push(`/preview?id=${contactId}`);
    }

    // Load initial link values when provided (for editing existing contact)
    useEffect(() => {
        if (initialLinkValues) {
            setFormfield({
                twitter: initialLinkValues.twitter || "",
                linkedin: initialLinkValues.linkedin || "",
                github: initialLinkValues.github || "",
                telegram: initialLinkValues.telegram || "",
                instagram: initialLinkValues.instagram || "",
                venmo: initialLinkValues.venmo || "",
                custom: initialLinkValues.custom || ""
            });
        }
    }, [initialLinkValues]);

    return (
        <form id="linkForm" name="Link form" className="w-full max-w-md flex flex-col px-2"
            onSubmit={handleSubmit}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={linkOrder}
                    strategy={verticalListSortingStrategy}
                >
                    {linkOrder.map((key) => (
                        <SortableInput
                            key={key}
                            id={key}
                            name={key}
                            label={LINK_LABELS[key]}
                            type="text"
                            value={formfield[key]}
                            placeholder={LINK_PLACEHOLDERS[key]}
                            onChange={handleChange}
                        />
                    ))}
                </SortableContext>
            </DndContext>
            <Button type="submit" className="self-center my-4 shadow-none">Save links</Button>
            <TextButton onClick={cancel} className="self-center">Cancel</TextButton>
            {modal}
        </form>
    );
}
