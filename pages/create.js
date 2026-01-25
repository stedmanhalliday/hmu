import { StorageContext } from "./_app.js";
import Page from "../components/Page.js";
import Form from "../components/Form.js";
import { safeParseVibe } from "../utils/storage.js";

import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

export default function Create() {
    const router = useRouter();
    const { id: contactId } = router.query;

    const { getContact, canAddContact } = useContext(StorageContext);

    const [emoji, setEmoji] = useState(null);
    const [photo, setPhoto] = useState(null);

    const [stops, setStops] = useState({
        start: "",
        end: ""
    });

    const [angle, setAngle] = useState(180);

    // Current contact data for editing
    const [currentFormValues, setCurrentFormValues] = useState(null);

    // Increment gradient angle
    const updateGradientAngle = () => {
        setAngle((prevAngle) => (prevAngle + 1) % 360);
    };

    // Change vibe preview on selection
    const handleVibeChange = (selectedVibe) => {
        const vibe = safeParseVibe(selectedVibe);
        setEmoji(vibe.emoji);
        setStops({
            start: vibe.group[0],
            end: vibe.group[vibe.group.length - 1],
        });
    }

    // Handle photo change from form
    const handlePhotoChange = (photoData) => {
        setPhoto(photoData);
    }

    // Load contact data when contactId is available
    useEffect(() => {
        if (!contactId) return;

        // Prevent creating new contact when at max limit
        if (contactId === 'new' && !canAddContact) {
            router.replace('/');
            return;
        }

        if (contactId === 'new') {
            // New contact - no data to load
            setCurrentFormValues(null);
            return;
        }

        const contact = getContact(contactId);
        if (contact && contact.formValues) {
            setCurrentFormValues(contact.formValues);
            // Update preview if vibe exists
            if (contact.formValues.vibe) {
                handleVibeChange(contact.formValues.vibe);
            }
            // Update photo preview if exists
            if (contact.formValues.photo) {
                setPhoto(contact.formValues.photo);
            }
        }
    }, [contactId, getContact, canAddContact, router]);

    useEffect(() => {
        const interval = setInterval(updateGradientAngle, 15);
        return () => clearInterval(interval);
    }, []);

    return (
        <Page className={stops.start != "" ? "justify-center z-0" : "justify-center bg-slate-100"}>
            <div className="-z-10 fixed top-0 right-0 bottom-0 left-0 opacity-20"
                style={{ "background": `linear-gradient(-${angle}deg, ${stops.start}, ${stops.end})` }}></div>
            <header className="flex flex-col items-center space-y-6 mb-6">
                <div className="w-20 h-20 rounded-full
                flex justify-center items-center shrink-0
                bg-white shadow-md overflow-hidden
                text-5xl">
                    {photo ? (
                        <img src={photo}
                            className="w-full h-full object-cover"
                            alt="Profile" />
                    ) : (
                        <img src={emoji ? `/emoji/${emoji}.png` : "/emoji/👤.png"}
                            width={48} height={48}
                            alt={emoji || "👤"} />
                    )}
                </div>
                <h1 className="text-center text-4xl leading-tight text-slate-600">
                    {contactId === 'new' ? 'Create a new contact' : 'Edit your contact'}
                </h1>
            </header>
            <Form
                contactId={contactId}
                initialFormValues={currentFormValues}
                handleChange={handleVibeChange}
                onPhotoChange={handlePhotoChange}
            />
        </Page>
    );
};
