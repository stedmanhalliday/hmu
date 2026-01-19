import { StorageContext } from "../pages/_app.js";
import Button from './Button.js';
import Input from './Input.js';
import Modal from './Modal.js';
import TextButton from './TextButton.js';

import { useRouter } from 'next/router';
import { useContext, useEffect, useState } from 'react';

export default function LinkForm({ contactId, initialLinkValues }) {
    const router = useRouter();

    const { setContact, getContact } = useContext(StorageContext);

    const [formfield, setFormfield] = useState({
        instagram: "",
        twitter: "",
        linkedin: "",
        venmo: "",
        custom: ""
    });

    const [modal, setModal] = useState(null);

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
                instagram: initialLinkValues.instagram || "",
                twitter: initialLinkValues.twitter || "",
                linkedin: initialLinkValues.linkedin || "",
                venmo: initialLinkValues.venmo || "",
                custom: initialLinkValues.custom || ""
            });
        }
    }, [initialLinkValues]);

    return (
        <form id="linkForm" name="Link form" className="w-full max-w-md flex flex-col px-2"
            onSubmit={handleSubmit}>
            <Input name="instagram" label="Instagram" type="text" value={formfield.instagram} placeholder="snoopdogg" onChange={handleChange} />
            <Input name="twitter" label="X (Twitter)" type="text" value={formfield.twitter} placeholder="snoopdogg" onChange={handleChange} />
            <Input name="linkedin" label="LinkedIn" type="text" value={formfield.linkedin} placeholder="snoopdogg" onChange={handleChange} />
            <Input name="venmo" label="Venmo" type="text" value={formfield.venmo} placeholder="snoopdogg" onChange={handleChange} />
            <Input name="custom" label="Link" type="text" value={formfield.custom} placeholder="https://hmu.world" onChange={handleChange} />
            <Button type="submit" className="self-center my-4 shadow-none">Save links</Button>
            <TextButton onClick={cancel} className="self-center">Cancel</TextButton>
            {modal}
        </form>
    );
}
