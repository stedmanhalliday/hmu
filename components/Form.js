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
import logger from "../utils/logger.js";

export default function Form({ contactId, initialFormValues, handleChange: onVibeChange, onPhotoChange }) {
    const router = useRouter();
    const { editing } = router.query;

    const { setContact } = useContext(StorageContext);
    const fileInputRef = useRef(null);
    
    // Use ref to track onPhotoChange callback to avoid useEffect dependency issues
    const onPhotoChangeRef = useRef(onPhotoChange);
    useEffect(() => {
        onPhotoChangeRef.current = onPhotoChange;
    }, [onPhotoChange]);

    const [formfield, setFormfield] = useState({
        name: "",
        phone: "",
        email: "",
        url: "",
        vibe: "",
        photo: "",
    });

    const [errors, setErrors] = useState({});
    const [modal, setModal] = useState(null);
    const [photoLoading, setPhotoLoading] = useState(false);

    // Validation helpers
    const validators = {
        name: (value) => {
            if (!value.trim()) return "Name is required";
            return "";
        },
        phone: (value) => {
            if (!value) return "";
            // Allow digits, spaces, dashes, parentheses, plus sign, dots
            // Must start with +, digit, or opening paren
            const phoneRegex = /^[+\d(][\d\s().-]*$/;
            const digitCount = value.replace(/\D/g, '').length;
            if (!phoneRegex.test(value) || digitCount < 7 || digitCount > 15) {
                return "Enter a valid phone number";
            }
            return "";
        },
        email: (value) => {
            if (!value) return "";
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                return "Enter a valid email address";
            }
            return "";
        },
        url: (value) => {
            if (!value) return "";
            // Accept URLs with or without protocol
            const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i;
            if (!urlRegex.test(value)) {
                return "Enter a valid URL";
            }
            return "";
        }
    };

    const validateField = (name, value) => {
        const validator = validators[name];
        return validator ? validator(value) : "";
    };

    const handleBlur = (event) => {
        const { name, value } = event.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormfield(prevState => ({
            ...prevState,
            [name]: value,
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: "" }));
        }
        if (event.target.name === "vibe" && onVibeChange) {
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
            logger.error('[Form] Failed to process image:', error);
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

        // Validate all fields
        const newErrors = {};
        for (const field of ['name', 'phone', 'email', 'url']) {
            const error = validateField(field, formfield[field]);
            if (error) {
                newErrors[field] = error;
            }
        }

        // Check for name
        if (!formfield.name.trim()) {
            newErrors.name = "Name is required";
        }

        // Check for contact info
        if (!formfield.phone && !formfield.email && !formfield.url) {
            setModal(
                <Modal title="No contact info" dismiss={dismiss}>
                    Please enter at least one way to contact you (phone, email, or website).
                </Modal>
            );
            return;
        }

        // If there are validation errors, show them and stop
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Anon vibe if not set
        let finalFormValues = { ...formfield };
        if (finalFormValues.vibe === "") {
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
            // Notify parent of initial photo via ref to avoid dependency issues
            if (initialFormValues.photo && onPhotoChangeRef.current) {
                onPhotoChangeRef.current(initialFormValues.photo);
            }
        }
    }, [initialFormValues]);

    return (
        <form id="contactForm" className="w-full max-w-md flex flex-col px-2"
            onSubmit={handleSubmit}>
            <Input name="name" label="Name" type="text" required={true} value={formfield.name} placeholder="Soulja Boy" onChange={handleChange} onBlur={handleBlur} error={errors.name} />
            <Input name="phone" label="Phone" type="tel" value={formfield.phone} placeholder="+16789998212" onChange={handleChange} onBlur={handleBlur} error={errors.phone} />
            <Input name="email" label="Email" type="email" value={formfield.email} placeholder="swag@hmu.world" onChange={handleChange} onBlur={handleBlur} error={errors.email} />
            <Input name="url" label="Website" type="text" value={formfield.url} placeholder="https://hmu.world" onChange={handleChange} onBlur={handleBlur} error={errors.url} />
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
                    className="w-full py-3 rounded-lg border border-dashed border-slate-400
                        text-sm text-slate-500 flex items-center justify-center gap-2
                        active:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed
                        transition-colors"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span className="uppercase tracking-widest">
                        {photoLoading ? "Processing..." : formfield.photo ? "Change Photo" : "Add Photo"}
                    </span>
                </button>
                {formfield.photo && (
                    <div className="flex items-center gap-3 mt-2">
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
                    </div>
                )}
            </label>
            <Button type="submit" className="self-center my-4 shadow-none">Save contact</Button>
            <TextButton type="button" onClick={cancel} className="self-center">Cancel</TextButton>
            {modal}
        </form>
    );
}
