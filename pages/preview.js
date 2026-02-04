import { StorageContext } from "./_app.js";
import Page from "../components/Page.js";
import Contact from "../components/Contact.js";
import EditPane from "../components/EditPane.js";
import ConfirmModal from "../components/ConfirmModal.js";
import SocialLink from "../components/SocialLink.js";
import TextButton from "../components/TextButton.js";
import LinksCarousel, { ITEMS_PER_PAGE } from "../components/LinksCarousel.js";
import styles from "../styles/Preview.module.css";
import { safeParseVibe } from "../utils/storage.js";
import logger from "../utils/logger.js";

import { useRouter } from 'next/router';
import { useContext, useEffect, useState, useRef, useCallback } from "react";
import { DEFAULT_LINK_ORDER, LINK_ORDER_STORAGE_KEY } from '../lib/constants.js';

export default function Preview() {
    const router = useRouter();
    const { id: contactId } = router.query;

    const { contacts, getContact, deleteContact } = useContext(StorageContext);

    // Lazy-loaded QRCode reference
    const qrCodeRef = useRef(null);
    const getQRCode = async () => {
        if (!qrCodeRef.current) {
            const qrModule = await import('qrcode');
            qrCodeRef.current = qrModule.default;
        }
        return qrCodeRef.current;
    };

    // Load link order from localStorage
    const [linkOrder, setLinkOrder] = useState(DEFAULT_LINK_ORDER);

    useEffect(() => {
        const saved = localStorage.getItem(LINK_ORDER_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const allKeys = new Set([...parsed, ...DEFAULT_LINK_ORDER]);
                setLinkOrder([...allKeys].filter(k => DEFAULT_LINK_ORDER.includes(k)));
            } catch {
                // Intentionally empty - use default order on parse error
            }
        }
    }, []);

    const [data, setData] = useState({
        src: "",
        displayName: "",
        label: "",
        vibe: "",
        url: "",
        photo: "",
    });

    const [contact, setContact] = useState({
        name: "",
        src: ""
    });

    const [links, setLinks] = useState({
        instagram: {
            label: "Instagram",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://instagram.com/"
        },
        tiktok: {
            label: "TikTok",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://tiktok.com/@"
        },
        twitter: {
            label: "X (Twitter)",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://x.com/"
        },
        snapchat: {
            label: "Snapchat",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://snapchat.com/add/"
        },
        facebook: {
            label: "Facebook",
            displayName: "",
            displayNamePrepend: "",
            url: "",
            urlPrepend: "https://facebook.com/"
        },
        whatsapp: {
            label: "WhatsApp",
            displayName: "",
            displayNamePrepend: "",
            url: "",
            urlPrepend: "https://wa.me/"
        },
        telegram: {
            label: "Telegram",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://t.me/"
        },
        discord: {
            label: "Discord",
            displayName: "",
            displayNamePrepend: "",
            url: "",
            // URL is dynamically determined based on input (user ID vs invite code)
            urlPrepend: "https://discord.gg/"
        },
        youtube: {
            label: "YouTube",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            // URL is dynamically determined based on input (channel ID vs username)
            urlPrepend: "https://youtube.com/@"
        },
        twitch: {
            label: "Twitch",
            displayName: "",
            displayNamePrepend: "",
            url: "",
            urlPrepend: "https://twitch.tv/"
        },
        spotify: {
            label: "Spotify",
            displayName: "",
            displayNamePrepend: "",
            url: "",
            urlPrepend: "https://open.spotify.com/artist/"
        },
        soundcloud: {
            label: "SoundCloud",
            displayName: "",
            displayNamePrepend: "",
            url: "",
            urlPrepend: "https://soundcloud.com/"
        },
        applemusic: {
            label: "Apple Music",
            displayName: "",
            displayNamePrepend: "",
            url: "",
            urlPrepend: "https://music.apple.com/artist/"
        },
        linkedin: {
            label: "LinkedIn",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://linkedin.com/in/"
        },
        github: {
            label: "GitHub",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://github.com/"
        },
        venmo: {
            label: "Venmo",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://venmo.com/"
        },
        cashapp: {
            label: "Cash App",
            displayName: "",
            displayNamePrepend: "$",
            url: "",
            urlPrepend: "https://cash.app/$"
        },
        paypal: {
            label: "PayPal",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://paypal.me/"
        },
        custom: {
            label: "Link",
            displayName: "",
            url: ""
        }
    });

    const [activeLink, setActiveLink] = useState("");

    const [loading, setLoading] = useState(true);

    const [editing, setEditing] = useState(false);

    // Delete confirmation modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Current contact data (used in useEffect for data loading)
    const [, setCurrentContact] = useState(null);

    const vCardValues = useCallback((formValues) => {
        // Include contact-specific URL in NOTE field so scanned contacts can return to this preview
        const noteUrl = contactId ? `https://hmu.world/preview?id=${contactId}` : 'https://hmu.world';
        let vCard =
            "BEGIN:VCARD\nVERSION:4.0" +
            "\nFN:" + formValues.name +
            "\nTEL:" + formValues.phone +
            "\nEMAIL:" + formValues.email +
            "\nURL:" + formValues.url +
            "\nNOTE:" + noteUrl +
            "\nEND:VCARD";
        return vCard;
    }, [contactId]);

    // Show the edit pane
    const edit = () => {
        setEditing(!editing);
    }

    // Show default contact
    const showContact = () => {
        setActiveLink("");
        setData((prevData) => ({
            ...prevData,
            displayName: contact.name,
            src: contact.src,
            label: "Contact",
            url: "",
        }));
    }

    const home = useCallback(() => {
        router.push("/");
    }, [router]);

    const editContact = () => {
        router.push(`/create?id=${contactId}&editing=true`);
    }

    const editLinks = () => {
        router.push(`/links?id=${contactId}`);
    }

    const handleDeleteClick = () => {
        setShowDeleteModal(true);
    }

    const handleDeleteCancel = () => {
        setShowDeleteModal(false);
    }

    const handleDeleteConfirm = () => {
        if (!contactId) return;

        setIsDeleting(true);

        // Perform deletion
        deleteContact(contactId);

        // Check if there are remaining contacts after deletion
        const remainingContacts = contacts.filter(c => c.id !== contactId);

        setIsDeleting(false);
        setShowDeleteModal(false);
        setEditing(false);

        // Navigate appropriately
        if (remainingContacts.length > 0) {
            // Go to the first remaining contact
            router.push(`/preview?id=${remainingContacts[0].id}`);
        } else {
            // No contacts left, go to home (empty state)
            router.push('/');
        }
    }

    const toggleActiveLink = (e) => {
        const type = e.target.getAttribute("data-type");
        const displayName = e.target.getAttribute("data-displayname");
        const label = e.target.getAttribute("data-label");
        const url = e.target.getAttribute("data-url");

        if (activeLink === type) {
            setActiveLink("");
            showContact()
        } else {
            setActiveLink(type);
            getQRCode().then((QRCode) => {
                QRCode.toDataURL(url,
                    {
                        width: 168,
                        errorCorrectionLevel: 'L',
                    }).then((dataUrl) => {
                        setData((prevData) => ({
                            ...prevData,
                            src: dataUrl,
                            displayName: displayName,
                            label: label,
                            url: url,
                        }));
                    }).catch((error) => {
                        logger.error('[QR] Failed to generate QR code:', error);
                        setData((prevData) => ({
                            ...prevData,
                            src: "",
                            displayName: displayName,
                            label: label,
                            url: url,
                        }));
                    });
            });
        }
    }

    // get domain from URL
    function processURL(url) {
        if (!url) return "";

        // Use a regex pattern to match the domain
        const domainRegex = /^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:/\n?]+)(?:[^/\n]*)(?:\/.*)?$/i;
        const matches = url.match(domainRegex);

        if (matches && matches.length >= 2) {
            // The domain is captured in the second group (index 1) of the matches array
            return matches[1];
        } else {
            // Fallback to original URL if parsing fails
            return url;
        }
    }

    // Load contact data when contacts or contactId changes
    useEffect(() => {
        if (!contacts || contacts.length === 0) {
            router.push('/');
            return;
        }

        // Find the contact - use contactId from query, or first contact as default
        let contactData = null;
        if (contactId) {
            contactData = getContact(contactId);
        }
        // Fallback to first contact if no ID specified or not found
        if (!contactData && contacts.length > 0) {
            contactData = contacts[0];
            // Update URL to reflect actual contact being shown
            if (contactData && !contactId) {
                router.replace(`/preview?id=${contactData.id}`, undefined, { shallow: true });
            }
        }

        if (!contactData) {
            home();
            return;
        }

        setCurrentContact(contactData);
        const formValues = contactData.formValues;
        const linkValues = contactData.linkValues;

        // Check if contact has required data
        if (!formValues || formValues === "" || !formValues.name) {
            home();
            return;
        }

        setLoading(false);

        const name = formValues.name;
        const vibe = safeParseVibe(formValues.vibe);
        const photo = formValues.photo || "";

        getQRCode().then((QRCode) => {
            QRCode.toDataURL(vCardValues(formValues),
                {
                    width: 168,
                    errorCorrectionLevel: 'L',
                }).then((url) => {
                    setData({
                        src: url,
                        displayName: name,
                        label: "Contact",
                        vibe: vibe,
                        photo: photo,
                    });
                    setContact({
                        name: name,
                        src: url
                    });
                }).catch((error) => {
                    logger.error('[QR] Failed to generate contact QR code:', error);
                    setData({
                        src: "",
                        displayName: name,
                        label: "Contact",
                        vibe: vibe,
                        photo: photo,
                    });
                    setContact({
                        name: name,
                        src: ""
                    });
                });
        });

        if (linkValues) {
            setLinks(prevLinks => {
                const updatedLinks = { ...prevLinks };
                for (const key in linkValues) {
                    if (key === "custom") {
                        updatedLinks[key].displayName = processURL(linkValues[key]);
                        updatedLinks[key].url = linkValues[key];
                    }
                    else if (key === "youtube" && linkValues[key]) {
                        // Smart YouTube URL handling: detect channel ID vs username
                        const value = linkValues[key].replace(/^@/, '');
                        const isChannelId = value.startsWith('UC') && value.length === 24;
                        if (isChannelId) {
                            updatedLinks[key].displayName = value;
                            updatedLinks[key].url = `https://youtube.com/channel/${value}`;
                        } else {
                            updatedLinks[key].displayName = "@" + value;
                            updatedLinks[key].url = `https://youtube.com/@${value}`;
                        }
                    }
                    else if (key === "discord" && linkValues[key]) {
                        // Smart Discord URL handling: detect user ID vs invite code
                        const value = linkValues[key];
                        const isUserId = /^\d{17,19}$/.test(value);
                        if (isUserId) {
                            // Show friendlier display for long user IDs
                            updatedLinks[key].displayName = `User ...${value.slice(-4)}`;
                            updatedLinks[key].url = `https://discord.com/users/${value}`;
                        } else {
                            updatedLinks[key].displayName = value;
                            updatedLinks[key].url = `https://discord.gg/${value}`;
                        }
                    }
                    else if (key === "whatsapp" && linkValues[key]) {
                        // Strip non-digits for wa.me URL, keep original for display
                        const value = linkValues[key];
                        const digitsOnly = value.replace(/\D/g, '');
                        updatedLinks[key].displayName = value;
                        updatedLinks[key].url = `https://wa.me/${digitsOnly}`;
                    }
                    else if (key === "cashapp" && linkValues[key]) {
                        // Ensure $ prefix for Cash App
                        const value = linkValues[key].replace(/^\$/, '');
                        updatedLinks[key].displayName = `$${value}`;
                        updatedLinks[key].url = `https://cash.app/$${value}`;
                    }
                    else if (linkValues[key]) {
                        updatedLinks[key].displayName = prevLinks[key].displayNamePrepend + linkValues[key];
                        updatedLinks[key].url = prevLinks[key].urlPrepend + linkValues[key];
                    } else {
                        updatedLinks[key].displayName = "";
                        updatedLinks[key].url = "";
                    }
                }
                return updatedLinks;
            });
        }
    }, [contacts, contactId, router, getContact, home, vCardValues]);

    // Build array of link components (contact + social links)
    const linkComponents = [
        <SocialLink
            key="contact"
            className={!activeLink ?
                "transition-opacity duration-100"
                : "opacity-30 transition-opacity duration-100"}
            type="contact"
            onClick={showContact}
        />,
        ...linkOrder
            .filter(key => links[key] && links[key].url !== "")
            .map(key => (
                <SocialLink key={key}
                    className={activeLink === key ?
                        "transition-opacity duration-100"
                        : "opacity-30 transition-opacity duration-100"}
                    type={key}
                    displayName={links[key].displayName}
                    label={links[key].label}
                    url={links[key].url}
                    onClick={toggleActiveLink} />
            ))
    ];

    const useCarousel = linkComponents.length > ITEMS_PER_PAGE;

    const filteredLinks = useCarousel ? (
        <LinksCarousel>
            {linkComponents}
        </LinksCarousel>
    ) : (
        <div className="flex flex-wrap justify-center">
            {linkComponents}
        </div>
    );

    return (
        <Page className="!p-0 overflow-hidden overscroll-none opacity-0"
            style={loading ? null : { opacity: 1 }}>
            {/* Fixed nav */}
            <nav className="fixed z-20 top-0 left-0 right-0 p-4 flex justify-between"
                style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
                <TextButton className={styles.home} onClick={home}>Home</TextButton>
                <TextButton className={editing ? `${styles.edit} ${styles.editing}` : styles.edit}
                    onClick={edit}>
                    {editing ? "Cancel" : "Edit"}
                </TextButton>
            </nav>

            {/* Main content - top section + centered bottom section */}
            <div className="h-screen w-full flex flex-col items-center"
                style={{
                    paddingTop: 'calc(max(env(safe-area-inset-top), 1rem) + 3rem)',
                    paddingBottom: 'calc(max(env(safe-area-inset-bottom), 1rem) + 2rem)'
                }}>
                {/* Top section - avatar, header, QR */}
                <div className="pt-4">
                    <Contact
                        src={data.src || ""}
                        displayName={data.displayName || ""}
                        vibe={data.vibe || ""}
                        label={data.label || ""}
                        style={editing ? { opacity: 0 } : null}
                        activeLink={activeLink}
                        url={data.url || ""}
                        photo={data.photo || ""} />
                </div>

                {/* Bottom section - speed dial centered */}
                <div className="flex-1 w-full flex items-center justify-center">
                    <div className="z-10 w-full flex justify-center opacity-75 transition-all duration-300"
                        style={editing ? { opacity: 0 } : null}>
                        {Object.values(links).every(value => value.url === "") ?
                            <TextButton className="px-8 py-5 rounded-full bg-black/10
                                active:bg-black/[.15] !border-none"
                                onClick={editLinks}>+ Add links</TextButton> : filteredLinks}
                    </div>
                </div>
            </div>

            {/* Fixed footer */}
            <p className="fixed left-0 right-0 text-center text-lg tracking-wide text-slate-600/50"
                style={{ bottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>hmu.world</p>

            {editing ? <EditPane editContact={editContact} editLinks={editLinks} deleteContact={handleDeleteClick} /> : null}
            {showDeleteModal && (
                <ConfirmModal
                    title="Delete Contact"
                    confirmLabel="Delete"
                    cancelLabel="Cancel"
                    onConfirm={handleDeleteConfirm}
                    onCancel={handleDeleteCancel}
                    isLoading={isDeleting}
                    confirmDestructive={true}
                >
                    <p className="text-slate-600 mb-2">
                        Are you sure you want to delete this contact?
                    </p>
                    <p className="text-slate-500 text-sm">
                        This action cannot be undone.
                    </p>
                </ConfirmModal>
            )}
        </Page>
    );
};
