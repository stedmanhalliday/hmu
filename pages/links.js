import { StorageContext } from "./_app.js";
import Page from "../components/Page.js";
import LinkForm from "../components/LinkForm.js";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";

export default function Links() {
    const router = useRouter();
    const { id: contactId } = router.query;

    const { getContact } = useContext(StorageContext);

    // Current contact's link values for editing
    const [currentLinkValues, setCurrentLinkValues] = useState(null);
    const [showMagicForm, setShowMagicForm] = useState(false);

    // Load contact's link data when contactId is available
    useEffect(() => {
        if (!contactId) return;

        const contact = getContact(contactId);
        if (contact && contact.linkValues) {
            setCurrentLinkValues(contact.linkValues);
        }
    }, [contactId, getContact]);

    return (
        <Page className="justify-center bg-slate-100">
            <header className="flex flex-col items-center space-y-6 mb-6"
                style={{ paddingTop: 'env(safe-area-inset-top)' }}>
                <div className="w-20 h-20 rounded-full
                flex justify-center items-center shrink-0
                bg-white shadow-md
                text-5xl">
                    {showMagicForm ? (
                        <img src="/assets/magic-message-3D.webp" alt="Magic Message"
                            className="w-14 h-14" />
                    ) : (
                        <img src={"/emoji/🔗.png"}
                            width={48} height={48}
                            alt={"🔗"} />
                    )}
                </div>
                <h1 className="text-center leading-tight text-slate-600"
                    style={{ fontSize: 'clamp(1.5rem, 8vw, 2.25rem)' }}>
                    {showMagicForm ? "Magic Message" : "Edit your links"}
                </h1>
                {showMagicForm && (
                    <p className="text-center text-slate-400 text-xl max-w-xs -mt-2">
                        Generate a QR code that drafts a message for anyone who scans it
                    </p>
                )}
            </header>
            <LinkForm
                contactId={contactId}
                initialLinkValues={currentLinkValues}
                showMagicForm={showMagicForm}
                setShowMagicForm={setShowMagicForm}
            />
        </Page>
    );
};
