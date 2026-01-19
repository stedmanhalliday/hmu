import { StorageContext } from "./_app.js";
import Page from "../components/Page.js";
import Contact from "../components/Contact.js";
import EditPane from "../components/EditPane.js";
import SocialLink from "../components/SocialLink.js";
import TextButton from "../components/TextButton.js";
import styles from "../styles/Preview.module.css";
import { safeParseVibe } from "../utils/storage.js";

import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from "react";
import QRCode from "qrcode";

export default function Preview() {
    const router = useRouter();
    const { id: contactId } = router.query;

    const { contacts, getContact } = useContext(StorageContext);

    const [data, setData] = useState({
        src: "",
        displayName: "",
        label: "",
        vibe: "",
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
        twitter: {
            label: "X (Twitter)",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://twitter.com/"
        },
        linkedin: {
            label: "LinkedIn",
            displayName: "",
            displayNamePrepend: "@",
            url: "",
            urlPrepend: "https://linkedin.com/in/"
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
            label: "Contact"
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

    const toggleActiveLink = (e) => {
        const type = e.target.getAttribute("data-type");
        const displayName = e.target.getAttribute("data-displayName");
        const label = e.target.getAttribute("data-label");
        const url = e.target.getAttribute("data-url");

        if (activeLink == type) {
            setActiveLink("");
            showContact()
        } else {
            setActiveLink(type);
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
                    }));
                }).catch((error) => {
                    console.error('[QR] Failed to generate QR code:', error);
                    setData((prevData) => ({
                        ...prevData,
                        src: "",
                        displayName: displayName,
                        label: label,
                    }));
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
            setLoading(false);
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
                });
                setContact({
                    name: name,
                    src: url
                });
            }).catch((error) => {
                console.error('[QR] Failed to generate contact QR code:', error);
                setData({
                    src: "",
                    displayName: name,
                    label: "Contact",
                    vibe: vibe,
                });
                setContact({
                    name: name,
                    src: ""
                });
            });

        if (linkValues) {
            setLinks(prevLinks => {
                const updatedLinks = { ...prevLinks };
                for (const key in linkValues) {
                    if (key == "custom") {
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
            {Object.entries(links)
                .filter(([key, value]) => value.url !== "")
                .map(([key, value]) => (
                    <SocialLink key={key}
                        className={activeLink == key ?
                            `transition-opacity duration-100 socialLink ${key}`
                            : `opacity-30 transition-opacity duration-100 socialLink ${key}`}
                        type={key}
                        displayName={value.displayName}
                        label={value.label}
                        url={value.url}
                        onClick={toggleActiveLink} />
                ))}
        </div>;

    return (
        <Page className="pt-24 opacity-0"
            style={loading ? null : { "opacity": 1 }}>
            <nav className="fixed z-10 top-0 w-full p-6 flex justify-between">
                <TextButton className={styles.home} onClick={home}>Home</TextButton>
                <TextButton className={editing ? `${styles.edit} ${styles.editing}` : styles.edit}
                    onClick={edit}>
                    {editing ? "Cancel" : "Edit"}
                </TextButton>
            </nav>
            <Contact src={data.src || ""} displayName={data.displayName || ""} vibe={data.vibe || ""} label={data.label || ""}
                style={editing ? { "opacity": 0 } : null}
                activeLink={activeLink} />
            <div className="z-10 mt-12 flex justify-center max-w-20
            opacity-75 transition-all duration-300"
                style={editing ? { "opacity": 0 } : null}>
                {Object.values(links).every(value => value.url === "") ?
                    <TextButton className="mt-8 px-8 py-5 rounded-full bg-black/10
                active:bg-black/[.15] !border-none"
                        onClick={editLinks}>Add links</TextButton> : filteredLinks}
            </div>
            {editing ? <EditPane editContact={editContact} editLinks={editLinks} /> : null}
            <p className="absolute bottom-6 text-lg tracking-wide text-slate-600/50">hmu.world</p>
        </Page>
    );
};
