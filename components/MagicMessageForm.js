import { useState } from 'react';
import Button from './Button.js';
import TextButton from './TextButton.js';

export default function MagicMessageForm({ initialValues, onSubmit, onCancel }) {
    const [type, setType] = useState(initialValues?.type || 'email');
    const [recipient, setRecipient] = useState(initialValues?.recipient || '');
    const [subject, setSubject] = useState(initialValues?.subject || '');
    const [body, setBody] = useState(initialValues?.body || '');
    const [errors, setErrors] = useState({});

    const validate = () => {
        const newErrors = {};

        if (!recipient.trim()) {
            newErrors.recipient = type === 'email'
                ? 'Email address is required'
                : 'Phone number is required';
        } else if (type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(recipient)) {
                newErrors.recipient = 'Enter a valid email address';
            }
        } else {
            const digitCount = recipient.replace(/\D/g, '').length;
            if (digitCount < 7 || digitCount > 15) {
                newErrors.recipient = 'Enter a valid phone number';
            }
        }

        if (!body.trim()) {
            newErrors.body = 'Message is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;

        const data = { type, recipient: recipient.trim(), body: body.trim() };
        if (type === 'email' && subject.trim()) {
            data.subject = subject.trim();
        }
        onSubmit(data);
    };

    return (
        <form className="w-full max-w-md flex flex-col px-2" onSubmit={handleSubmit}>
            {/* Segmented Toggle */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden mb-6">
                <button
                    type="button"
                    onClick={() => setType('email')}
                    className={`flex-1 py-3 text-sm uppercase tracking-widest font-medium transition-colors
                        ${type === 'email'
                            ? 'bg-slate-800 text-white'
                            : 'bg-white text-slate-500 active:bg-slate-50'}`}
                >
                    Email
                </button>
                <button
                    type="button"
                    onClick={() => setType('sms')}
                    className={`flex-1 py-3 text-sm uppercase tracking-widest font-medium transition-colors
                        ${type === 'sms'
                            ? 'bg-slate-800 text-white'
                            : 'bg-white text-slate-500 active:bg-slate-50'}`}
                >
                    SMS
                </button>
            </div>

            {/* Recipient */}
            <label className="mb-4">
                <div className="mb-1 text-slate-600">
                    {type === 'email' ? 'Recipient email' : 'Recipient phone number'}
                </div>
                <input
                    className={`py-2 px-3 w-full max-w-md text-lg border rounded-md text-slate-800
                        placeholder:text-slate-400
                        focus:outline-none focus:shadow-[inset_0_0_0.25rem_rgb(216,180,254)]
                        ${errors.recipient
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-slate-300 focus:border-purple-400'}`}
                    type={type === 'email' ? 'email' : 'tel'}
                    value={recipient}
                    placeholder={type === 'email' ? 'friend@example.com' : '+16789998212'}
                    onChange={(e) => setRecipient(e.target.value)}
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                />
                {errors.recipient && (
                    <div className="mt-1 text-sm text-red-500">{errors.recipient}</div>
                )}
            </label>

            {/* Subject (email only) */}
            {type === 'email' && (
                <label className="mb-4">
                    <div className="mb-1 text-slate-600">Subject <span className="text-slate-400">(optional)</span></div>
                    <input
                        className="py-2 px-3 w-full max-w-md text-lg border rounded-md text-slate-800
                            placeholder:text-slate-400 border-slate-300
                            focus:outline-none focus:border-purple-400
                            focus:shadow-[inset_0_0_0.25rem_rgb(216,180,254)]"
                        type="text"
                        value={subject}
                        placeholder="Say hello"
                        onChange={(e) => setSubject(e.target.value)}
                    />
                </label>
            )}

            {/* Body */}
            <label className="mb-4">
                <div className="mb-1 text-slate-600">Message</div>
                <textarea
                    className={`py-2 px-3 w-full max-w-md text-lg border rounded-md text-slate-800
                        placeholder:text-slate-400 resize-none
                        focus:outline-none focus:shadow-[inset_0_0_0.25rem_rgb(216,180,254)]
                        ${errors.body
                            ? 'border-red-400 focus:border-red-400'
                            : 'border-slate-300 focus:border-purple-400'}`}
                    rows={3}
                    value={body}
                    placeholder="Hey, I got your card!"
                    onChange={(e) => setBody(e.target.value)}
                />
                {errors.body && (
                    <div className="mt-1 text-sm text-red-500">{errors.body}</div>
                )}
            </label>

            <Button type="submit" className="self-center my-4 shadow-none">Save</Button>
            <TextButton type="button" onClick={onCancel} className="self-center">Cancel</TextButton>
        </form>
    );
}
