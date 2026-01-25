import { StorageContext } from "../pages/_app.js";
import Button from "./Button.js";
import Input from "./Input.js";
import Modal from "./Modal.js";
import TextButton from "./TextButton.js";
import vibes from "../utils/vibes.json";
import { resizeImage } from "../utils/image.js";

import { useRouter } from "next/router";
import { useContext, useEffect, useState, useRef } from "react";
import { safeGetItem, safeSetItem, STORAGE_KEYS } from "../utils/storage.js";

export default function Form({ contactId, initialFormValues, handleChange: onVibeChange, onPhotoChange }) {
    const router = useRouter();
    const { editing } = router.query;

    const { setContact, getContact } = useContext(StorageContext);
    const fileInputRef = useRef(null);

    const [formfield, setFormfield] = useState({
        name: "",
        phone: "",
        email: "",
        url: "",
        vibe: "",
        photo: "",
    });

    const [modal, setModal] = useState(null);
    const [photoLoading, setPhotoLoading] = useState(false);

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

    const handlePhotoSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate it's an image
        if (!file.type.startsWith('image/')) {
            setModal(
                <Modal title="Invalid file" dismiss={dismiss}>
                    Please select an image file.
                </Modal>
            );
            return;
        }

        setPhotoLoading(true);
        try {
            const base64 = await resizeImage(file, 150, 0.8);
            setFormfield(prev => ({ ...prev, photo: base64 }));
            if (onPhotoChange) {
                onPhotoChange(base64);
            }
        } catch (error) {
            console.error('[Form] Failed to process image:', error);
            setModal(
                <Modal title="Error" dismiss={dismiss}>
                    Failed to process the image. Please try another.
                </Modal>
            );
        }
        setPhotoLoading(false);
    }

    const removePhoto = () => {
        setFormfield(prev => ({ ...prev, photo: "" }));
        if (onPhotoChange) {
            onPhotoChange("");
        }
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
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
                vibe: initialFormValues.vibe || "",
                photo: initialFormValues.photo || ""
            });
            // Notify parent of initial photo
            if (initialFormValues.photo && onPhotoChange) {
                onPhotoChange(initialFormValues.photo);
            }
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
            <label className="mb-4">
                <div className="mb-1 text-slate-600">Photo</div>
                <div className="flex items-center gap-3">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoSelect}
                        className="hidden"
                        id="photo-input"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={photoLoading}
                        className="px-4 py-2 text-sm rounded-md border border-slate-300 text-slate-600
                        hover:border-purple-400 hover:text-purple-600
                        disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors"
                    >
                        {photoLoading ? "Processing..." : formfield.photo ? "Change photo" : "Add photo"}
                    </button>
                    {formfield.photo && (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={formfield.photo}
                                alt="Preview"
                                className="w-10 h-10 rounded-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={removePhoto}
                                className="text-sm text-slate-400 hover:text-red-500 transition-colors"
                            >
                                Remove
                            </button>
                        </>
                    )}
                </div>
            </label>
            <Button type="submit" className="self-center my-4 shadow-none">Save contact</Button>
            <TextButton onClick={cancel} className="self-center">Cancel</TextButton>
            {modal}
        </form>
    );
}
