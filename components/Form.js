import { StorageContext } from "../pages/_app.js";
import Button from "./Button.js";
import Input from "./Input.js";
import Modal from "./Modal.js";
import TextButton from "./TextButton.js";
import vibes from "../utils/vibes.json";

import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { safeGetItem, safeSetItem, STORAGE_KEYS } from "../utils/storage.js";

export default function Form({ contactId, initialFormValues, handleChange: onVibeChange }) {
    const router = useRouter();
    const { editing } = router.query;

    const { setContact, getContact } = useContext(StorageContext);

    const [formfield, setFormfield] = useState({
        name: "",
        phone: "",
        email: "",
        url: "",
        vibe: "",
    });

    const [modal, setModal] = useState(null);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormfield(prevState => ({
            ...prevState,
            [name]: value,
        }));
        if (event.target.name == "vibe" && onVibeChange) {
            onVibeChange(event.target.value);
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        // Check for name
        if (formfield.name == "") {
            setModal(
                <Modal title="No name" dismiss={dismiss}>
                    Please enter your name.
                </Modal>
            );
            return;
        }

        //Check for contact info
        if (formfield.phone == "" && formfield.email == "" && formfield.url == "") {
            setModal(
                <Modal title="No contact info" dismiss={dismiss}>
                    Please enter your contact info.
                </Modal>
            );
            return;
        }

        // Anon vibe if not set
        let finalFormValues = { ...formfield };
        if (finalFormValues.vibe == "") {
            finalFormValues.vibe = JSON.stringify(vibes.filter(vibe => vibe.label === "Anon")[0]);
        }
        
        // Save contact using new API
        // If contactId is 'new', this creates a new contact and returns the new ID
        // Otherwise it updates the existing contact
        const savedId = setContact(contactId, { formValues: finalFormValues });

        // Check if save failed (returns null when at max contacts)
        if (savedId === null) {
            setModal(
                <Modal title="Contact limit reached" dismiss={dismiss}>
                    You&apos;ve reached the maximum number of contacts. Please edit an existing contact instead.
                </Modal>
            );
            return;
        }

        // Log first time code creation
        if (!safeGetItem(STORAGE_KEYS.CONVERTED)) {
            safeSetItem(STORAGE_KEYS.CONVERTED, true);
            gtag("event", "first_form_submit");
        }

        // Log form submission
        gtag("event", "form_submit", {
            "form_id": "contactForm",
            "form_name": "Contact form",
            "destination": "/create",
            "contact_id": savedId
        });

        // Navigate to preview for this contact
        router.push(`/preview?id=${savedId}`);
    }

    const dismiss = () => {
        setModal(null);
    }

    const cancel = () => {
        if (editing && contactId && contactId !== 'new') {
            router.push(`/preview?id=${contactId}`);
        } else {
            router.push("/");
        }
    }

    // Load initial form values when provided (for editing existing contact)
    useEffect(() => {
        if (initialFormValues) {
            setFormfield({
                name: initialFormValues.name || "",
                phone: initialFormValues.phone || "",
                email: initialFormValues.email || "",
                url: initialFormValues.url || "",
                vibe: initialFormValues.vibe || ""
            });
        }
    }, [initialFormValues]);

    return (
        <form id="contactForm" className="w-full max-w-md flex flex-col px-2"
            onSubmit={handleSubmit}>
            <Input name="name" label="Name" type="text" required={true} value={formfield.name} placeholder="Soulja Boy" onChange={handleChange} />
            <Input name="phone" label="Phone" type="tel" value={formfield.phone} placeholder="+16789998212" onChange={handleChange} />
            <Input name="email" label="Email" type="email" value={formfield.email} placeholder="swag@hmu.world" onChange={handleChange} />
            <Input name="url" label="Website" type="text" value={formfield.url} placeholder="https://hmu.world" onChange={handleChange} />
            <label className="mb-4">
                <div className="mb-1 text-slate-600">Theme</div>
                <select className="select" value={formfield.vibe} onChange={handleChange} name="vibe">
                    <option value="" disabled>Choose a vibe</option>
                    {vibes.sort((a, b) => (
                        a.label.localeCompare(b.label)
                    )).map((option) => (
                        <option key={option.label} value={JSON.stringify(option)}>{option.emoji + " " + option.label}</option>
                    ))}
                </select>
            </label>
            <Button type="submit" className="self-center my-4 shadow-none">Save contact</Button>
            <TextButton onClick={cancel} className="self-center">Cancel</TextButton>
            {modal}
        </form>
    );
}
