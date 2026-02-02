import { StorageContext } from "./_app.js";
import Page from "../components/Page.js";
import Button from "../components/Button.js";
import Contacts from "../components/Contacts.js";
import InstallModal from "../components/InstallModal.js";
import Modal from "../components/Modal.js";
import TextButton from "../components/TextButton";
import styles from "../styles/Home.module.css";
import { safeParseVibe } from "../utils/storage.js";

import { useContext, useEffect, useRef, useState, memo } from "react";
import { useRouter } from "next/router";

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

// Sortable contact wrapper component - memoized to prevent unnecessary re-renders
const SortableContact = memo(function SortableContact({ contact }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: contact.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-2 -ml-2">
            {/* Drag handle */}
            <button
                type="button"
                className="p-1 cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 touch-none"
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
            <Contacts
                id={contact.id}
                name={contact.formValues.name}
                vibe={safeParseVibe(contact.formValues.vibe)}
                photo={contact.formValues.photo}
            />
        </div>
    );
});

export default function Home() {
    const { contacts, canAddContact, reorderContacts } = useContext(StorageContext);

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
            const oldIndex = contacts.findIndex(c => c.id === active.id);
            const newIndex = contacts.findIndex(c => c.id === over.id);
            const newContacts = arrayMove(contacts, oldIndex, newIndex);
            reorderContacts(newContacts);
        }
    };

    const [loading, setLoading] = useState(true);
    const [hasMounted, setHasMounted] = useState(false);

    const [isStandalone, setIsStandalone] = useState(false);
    const [os, setOs] = useState(null);
    const [, setIsPromptable] = useState(false);
    const [installPrompt, setInstallPrompt] = useState(null);
    const [installModal, setInstallModal] = useState(false);
    const [privacyModal, setPrivacyModal] = useState(false);
    const [feedbackModal, setFeedbackModal] = useState(false);

    // Create reference to store the DOM element containing the animation
    const el = useRef(null);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (contacts !== null) {
            setLoading(false);
        }
    }, [contacts])

    useEffect(() => {
        // Initialize headline shuffle (lazy loaded)
        let typed = null;
        import('typed.js').then((Typed) => {
            typed = new Typed.default(el.current, {
                strings: ["instantly.", "flexibly.", "tactfully."],
                startDelay: 5000,
                backDelay: 5000,
                typeSpeed: 20,
                backSpeed: 20,
                showCursor: false
            });
        });

        // Capture the install prompt event when it fires
        const handleBeforeInstallPrompt = (e) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later
            setInstallPrompt(e);
            // Only set promptable when event actually fires (not just API support)
            setIsPromptable(true);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        const handleAppInstalled = () => {
            // Install analytics
            gtag("event", "android_install");
        };
        window.addEventListener('appinstalled', handleAppInstalled);

        // Standalone mode media query
        if (window.matchMedia("(display-mode: standalone)").matches) {
            setIsStandalone(true);
        } else {
            const userAgentString = window.navigator.userAgent.toLowerCase();
            // iOS check
            if (/iphone|ipad|ipod/.test(userAgentString)) {
                setOs("ios");
                // Android check
            } else if (/android/.test(userAgentString)) {
                setOs("android");
                // Note: isPromptable is set by beforeinstallprompt event handler, not API detection
            }
        }

        return () => {
            // Destroy Typed instance during cleanup to stop animation
            if (typed) typed.destroy();
            // Clean up PWA event listeners
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('appinstalled', handleAppInstalled);
        };
    }, [])

    // App install prompt flow
    const showPrompt = async () => {
        // Show install prompt
        installPrompt.prompt();
        // Wait for the user to respond to the prompt ("accepted" | "dismissed")
        const { outcome } = await installPrompt.userChoice;
        // Log install prompt outcome as separate metrics
        if (outcome === 'accepted') {
            gtag("event", "install_prompt_accepted");
        } else if (outcome === 'dismissed') {
            gtag("event", "install_prompt_dismissed");
        }
        // Discard used prompt
        setInstallPrompt(null);
    }

    // Initialize router
    const router = useRouter();

    // Navigate to contact form for new contact
    const create = () => {
        router.push("/create?id=new");
    }

    const pressInstallButton = () => {
        // Log install button press
        gtag("event", "install_button");
        // Use installPrompt directly as the source of truth (defense-in-depth)
        if (installPrompt) {
            showPrompt();
        } else {
            toggleInstallModal();
        }
    }

    const toggleInstallModal = () => { setInstallModal(!installModal) }
    const togglePrivacyModal = () => { setPrivacyModal(!privacyModal) }
    const toggleFeedbackModal = () => { setFeedbackModal(!feedbackModal) }

    // Check if user has any contacts with data
    const hasContacts = contacts && contacts.length > 0 && contacts.some(c => c.formValues?.name && c.formValues?.vibe);

    return (
        <>
        <Page className="!py-0 overflow-hidden overscroll-none bg-slate-100"
            style={{ visibility: loading ? 'hidden' : 'visible' }}>

            {/* Main content - 2 groups evenly spaced */}
            <div className="h-screen w-full flex flex-col justify-evenly items-center"
                style={{
                    paddingTop: hasMounted ? 'max(env(safe-area-inset-top), 1rem)' : '1rem',
                    paddingBottom: hasMounted ? 'calc(max(env(safe-area-inset-bottom), 1rem) + 2rem)' : '3rem'
                }}>

                {/* Group 1: Header section (QR + headline + subheader) */}
                <div className="flex flex-col items-center">
                    <div className={styles.siteCode}></div>
                    <header className="text-center text-slate-600">
                        <p className="mt-8 mb-6 leading-tight"
                            style={{ fontSize: 'clamp(1.5rem, 8vw, 2.25rem)' }}>Share what matters
                            <span ref={el} id="shuffle" className="block h-10 text-purple-600 textGlow">tactfully.</span>
                        </p>
                        <p className="text-xl max-w-md leading-normal">Connect faster IRL with personal QR codes for what matters to you.</p>
                    </header>
                </div>

                {/* Group 2: Content (contacts or install) */}
                <div className="flex flex-col items-center">
                    {isStandalone ?
                        hasContacts ?
                            <div className="flex flex-col items-center space-y-4">
                                {/* Render all contacts that have data with drag-and-drop */}
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={contacts.filter(c => c.formValues?.name && c.formValues?.vibe).map(c => c.id)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <div className="flex flex-col items-center space-y-4">
                                            {contacts
                                                .filter(c => c.formValues?.name && c.formValues?.vibe)
                                                .map(contact => (
                                                    <SortableContact
                                                        key={contact.id}
                                                        contact={contact}
                                                    />
                                                ))
                                            }
                                        </div>
                                    </SortableContext>
                                </DndContext>
                                {/* Show add button if under max contacts */}
                                {canAddContact && (
                                    <Button className="!mt-8" onClick={create}>+ New contact</Button>
                                )}
                            </div>
                            : canAddContact ? <Button onClick={create}>+ New contact</Button> : null
                        : <div className="flex flex-col items-center">
                            <Button className="mb-4" onClick={pressInstallButton}>Install app</Button>
                            <TextButton onClick={togglePrivacyModal}>Privacy</TextButton>
                        </div>
                    }
                </div>
            </div>

            {installModal ? <InstallModal os={os} dismiss={toggleInstallModal} /> : null}
            {privacyModal ?
                <Modal title="Privacy" dismiss={togglePrivacyModal}>
                    <div className="text-base text-slate-600 space-y-3">
                        <p>{`hmu.world doesn't keep your personal information. Basic metrics are tracked with Google Analytics. Any personal data that the app uses is stored locally on your mobile device.`}</p>
                        <p>{`If you'd like to delete your data:`}</p>
                        <ol className="ml-5 list-decimal space-y-3">
                            <li>Open the site settings for <span className="text-purple-600">hmu.world</span> on your mobile device.</li>
                            <li>Delete the site data.</li>
                            <li>Quit and reopen the app.</li>
                        </ol>
                    </div>
                </Modal>
                : null}
            {feedbackModal ?
                <Modal title="Contribute" dismiss={toggleFeedbackModal}>
                    <div className="text-base text-slate-600 space-y-3">
                        <p>Help improve hmu.world by submitting feedback or contributing code.</p>
                        <ol>
                            <li>Email: <a href="mailto:sup@hmu.world?subject=hmu.world%20Feedback" target="_blank" rel="noreferrer"
                                className="text-purple-600 transition-all duration-150
                            hover:text-purple-400 focus:text-purple-400 active:text-purple-400">sup@hmu.world</a></li>
                            <li>X (Twitter): <a href="https://x.com/stedmanhalliday" target="_blank" rel="noreferrer"
                                className="text-purple-600 transition-all duration-150
                            hover:text-purple-400 focus:text-purple-400 active:text-purple-400">@stedmanhalliday</a></li>
                            <li>GitHub: <a href="https://github.com/stedmanhalliday/hmu" target="_blank" rel="noreferrer"
                                className="text-purple-600 transition-all duration-150
                            hover:text-purple-400 focus:text-purple-400 active:text-purple-400">stedmanhalliday/hmu</a></li>
                        </ol>
                        <p>Support me with a <a href="https://buy.stripe.com/9B6aEX3vwcfr1cxbeS9R604" target="_blank" rel="noreferrer"
                            className="text-purple-600 transition-all duration-150
                            hover:text-purple-400 focus:text-purple-400 active:text-purple-400">donation.</a></p>
                    </div>
                </Modal>
                : null}
        </Page>

        {/* Fixed question mark - bottom right (outside Page to fix iOS hit target) */}
        <a className="fixed z-10 bottom-4 right-4 w-14 h-14 flex items-center justify-center cursor-pointer"
            onClick={toggleFeedbackModal}>
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-purple-200 text-purple-400">?</span>
        </a>
        </>
    );
};
