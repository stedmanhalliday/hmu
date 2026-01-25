import { StorageContext } from "./_app.js";
import Page from "../components/Page.js";
import Contact from "../components/Contact.js";
import EditPane from "../components/EditPane.js";
import ConfirmModal from "../components/ConfirmModal.js";
import SocialLink from "../components/SocialLink.js";
import TextButton from "../components/TextButton.js";
import styles from "../styles/Preview.module.css";
import { safeParseVibe } from "../utils/storage.js";
import logger from "../utils/logger.js";

import { useRouter } from 'next/router';
import { useContext, useEffect, useState, useRef } from "react";

const DEFAULT_LINK_ORDER = ['twitter', 'linkedin', 'github', 'telegram', 'instagram', 'venmo', 'custom'];
const ORDER_STORAGE_KEY = 'linkOrder';

export default function Preview() {
    const router = useRouter();
    const { id: contactId } = router.query;

    const { contacts, getContact, deleteContact, storageError } = useContext(StorageContext);

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
        const saved = localStorage.getItem(ORDER_STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const allKeys = new Set([...parsed, ...DEFAULT_LINK_ORDER]);
                setLinkOrder([...allKeys].filter(k => DEFAULT_LINK_ORDER.includes(k)));
            } catch {
                // Use default on parse error
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
        twitter: {
            label: "X (Twitter)",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://x.com/"
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
        telegram: {
            label: "Telegram",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://t.me/"
        },
        instagram: {
            label: "Instagram",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://instagram.com/"
        },
        venmo: {
            label: "Venmo",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://venmo.com/"
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

    // Current contact data
    const [currentContact, setCurrentContact] = useState(null);

    const vCardValues = (formValues) => {
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
    }

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

    const home = () => {
        router.push("/");
    }

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
        const displayName = e.target.getAttribute("data-displayName");
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
    }, [contacts, contactId, router]);

    const filteredLinks =
        <div className="flex flex-wrap justify-center">
            <SocialLink
                className={!activeLink ?
                    "transition-opacity duration-100 socialLink contactLink"
                    : "opacity-30 transition-opacity duration-100 socialLink contactLink"}
                onClick={showContact}
            />
            {linkOrder
                .filter(key => links[key] && links[key].url !== "")
                .map(key => (
                    <SocialLink key={key}
                        className={activeLink === key ?
                            `transition-opacity duration-100 socialLink ${key}`
                            : `opacity-30 transition-opacity duration-100 socialLink ${key}`}
                        type={key}
                        displayName={links[key].displayName}
                        label={links[key].label}
                        url={links[key].url}
                        onClick={toggleActiveLink} />
                ))}
        </div>;

    return (
        <Page className="pt-8 opacity-0"
            style={loading ? null : { "opacity": 1 }}>
            <nav className="fixed z-10 top-0 w-full p-4 flex justify-between"
                style={{ paddingTop: 'max(env(safe-area-inset-top), 1rem)' }}>
                <TextButton className={styles.home} onClick={home}>Home</TextButton>
                <TextButton className={editing ? `${styles.edit} ${styles.editing}` : styles.edit}
                    onClick={edit}>
                    {editing ? "Cancel" : "Edit"}
                </TextButton>
            </nav>
            <div className="flex-1 flex items-center justify-center pb-12">
                <Contact src={data.src || ""} displayName={data.displayName || ""} vibe={data.vibe || ""} label={data.label || ""}
                    style={editing ? { "opacity": 0 } : null}
                    activeLink={activeLink}
                    url={data.url || ""}
                    photo={data.photo || ""} />
            </div>
            <div className="z-10 mb-16 flex justify-center
            opacity-75 transition-all duration-300"
                style={editing ? { "opacity": 0 } : null}>
                {Object.values(links).every(value => value.url === "") ?
                    <TextButton className="px-8 py-5 rounded-full bg-black/10
                active:bg-black/[.15] !border-none"
                        onClick={editLinks}>Add links</TextButton> : filteredLinks}
            </div>
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
            <p className="absolute text-lg tracking-wide text-slate-600/50"
                style={{ bottom: 'max(env(safe-area-inset-bottom), 1rem)' }}>hmu.world</p>
        </Page>
    );
};
