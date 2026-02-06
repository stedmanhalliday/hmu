import { StorageContext } from "../pages/_app.js";
import Button from './Button.js';
import Modal from './Modal.js';
import TextButton from './TextButton.js';
import ActiveLinkRow from './ActiveLinkRow.js';
import PlatformPicker from './PlatformPicker.js';
import MagicMessageForm from './MagicMessageForm.js';

import { useRouter } from 'next/router';
import { useContext, useEffect, useState, useRef, useCallback } from 'react';
import logger from '../utils/logger.js';
import { EMPTY_LINK_VALUES } from '../utils/storage.js';
import { DEFAULT_LINK_ORDER, LINK_ORDER_STORAGE_KEY } from '../lib/constants.js';
import { parseMagicMessage, magicMessageLabel } from '../lib/magicMessage.js';

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
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';

export default function LinkForm({ contactId, initialLinkValues, showMagicForm, setShowMagicForm }) {
    const router = useRouter();

    const { setContact, getContact } = useContext(StorageContext);

    const [formfield, setFormfield] = useState({ ...EMPTY_LINK_VALUES });

    const [modal, setModal] = useState(null);
    const [linkOrder, setLinkOrder] = useState(DEFAULT_LINK_ORDER);
    const [addedKeys, setAddedKeys] = useState(new Set());
    const [focusKey, setFocusKey] = useState(null);
    const focusRef = useRef(null);

    // Auto-focus newly added link input
    useEffect(() => {
        if (focusKey && focusRef.current) {
            focusRef.current.focus();
            setFocusKey(null);
        }
    }, [focusKey]);

    // Load saved order from localStorage
    useEffect(() => {
        const saved = localStorage.getItem(LINK_ORDER_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                // Ensure all keys are present (in case new links were added)
                const allKeys = new Set([...parsed, ...DEFAULT_LINK_ORDER]);
                setLinkOrder([...allKeys].filter(k => DEFAULT_LINK_ORDER.includes(k)));
            } catch {
                // Intentionally empty - use default order on parse error
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

    // Derive active keys (populated or explicitly added) and available platforms
    const activeKeys = linkOrder.filter(k => formfield[k] || addedKeys.has(k));
    const availablePlatforms = DEFAULT_LINK_ORDER.filter(k => !activeKeys.includes(k));

    const handleAdd = useCallback((key) => {
        setAddedKeys(prev => new Set([...prev, key]));
        // Move key to end of linkOrder
        setLinkOrder(prev => {
            const without = prev.filter(k => k !== key);
            const newOrder = [...without, key];
            localStorage.setItem(LINK_ORDER_STORAGE_KEY, JSON.stringify(newOrder));
            return newOrder;
        });
        setFocusKey(key);
    }, []);

    const handleRemove = useCallback((key) => {
        setFormfield(prev => ({ ...prev, [key]: "" }));
        setAddedKeys(prev => {
            const next = new Set(prev);
            next.delete(key);
            return next;
        });
    }, []);

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setLinkOrder((items) => {
                const oldIndex = items.indexOf(active.id);
                const newIndex = items.indexOf(over.id);
                const newOrder = arrayMove(items, oldIndex, newIndex);
                // Persist order to localStorage
                localStorage.setItem(LINK_ORDER_STORAGE_KEY, JSON.stringify(newOrder));
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
            logger.error('[LinkForm] Cannot save - invalid contact ID:', contactId);
            router.push('/');
            return;
        }

        // Process form values to yield display names
        const processedLinks = Object.fromEntries(
            Object.entries(formfield).map(([key, value]) => {
                if (key === "custom" || key === "magicmessage" || /^https?:\/\//.test(value)) {
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

    const openMagicForm = useCallback(() => {
        setShowMagicForm(true);
    }, [setShowMagicForm]);

    const handleMagicSubmit = useCallback((data) => {
        const jsonValue = JSON.stringify(data);
        setFormfield(prev => ({ ...prev, magicmessage: jsonValue }));
        setAddedKeys(prev => new Set([...prev, 'magicmessage']));
        setLinkOrder(prev => {
            const without = prev.filter(k => k !== 'magicmessage');
            const newOrder = [...without, 'magicmessage'];
            localStorage.setItem(LINK_ORDER_STORAGE_KEY, JSON.stringify(newOrder));
            return newOrder;
        });
        setShowMagicForm(false);
    }, [setShowMagicForm]);

    const handleMagicCancel = useCallback(() => {
        setShowMagicForm(false);
    }, [setShowMagicForm]);

    // Load initial link values when provided (for editing existing contact)
    useEffect(() => {
        if (initialLinkValues) {
            const values = {};
            const populated = new Set();
            for (const key of DEFAULT_LINK_ORDER) {
                values[key] = initialLinkValues[key] || "";
                if (initialLinkValues[key]) {
                    populated.add(key);
                }
            }
            setFormfield(values);
            setAddedKeys(populated);
        }
    }, [initialLinkValues]);

    if (showMagicForm) {
        const initialValues = parseMagicMessage(formfield.magicmessage);
        return (
            <MagicMessageForm
                initialValues={initialValues}
                onSubmit={handleMagicSubmit}
                onCancel={handleMagicCancel}
            />
        );
    }

    return (
        <form id="linkForm" name="Link form" className="w-full max-w-md flex flex-col px-2"
            onSubmit={handleSubmit}>
            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={activeKeys}
                    strategy={verticalListSortingStrategy}
                >
                    {activeKeys.length > 0 ? (
                        activeKeys.map((key) => {
                            if (key === 'magicmessage' && formfield[key]) {
                                const parsed = parseMagicMessage(formfield[key]);
                                return (
                                    <ActiveLinkRow
                                        key={key}
                                        id={key}
                                        label={magicMessageLabel(parsed)}
                                        value={(parsed.type === 'email' && parsed.subject) ? parsed.subject : parsed.body}
                                        onChange={handleChange}
                                        onRemove={handleRemove}
                                        readOnly
                                        onEdit={openMagicForm}
                                    />
                                );
                            }
                            return (
                                <ActiveLinkRow
                                    key={key}
                                    id={key}
                                    value={formfield[key]}
                                    onChange={handleChange}
                                    onRemove={handleRemove}
                                    inputRef={focusKey === key ? focusRef : undefined}
                                />
                            );
                        })
                    ) : (
                        <p className="text-center text-slate-400 text-xl py-6">
                            Add the links you want to share
                        </p>
                    )}
                </SortableContext>
            </DndContext>

            <PlatformPicker
                availablePlatforms={availablePlatforms}
                onAdd={handleAdd}
                onAddMagicMessage={openMagicForm}
            />

            <Button type="submit" className="self-center my-4 shadow-none">Save links</Button>
            <TextButton onClick={cancel} className="self-center">Cancel</TextButton>
            {modal}
        </form>
    );
}
