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
            <header className="flex flex-col items-center space-y-6 mb-6">
                <div className="w-20 h-20 rounded-full
                flex justify-center items-center shrink-0 
                bg-white shadow-md
                text-5xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={"/emoji/🔗.png"}
                        width={48} height={48}
                        alt={"🔗"} />
                </div>
                <h1 className="text-center text-4xl leading-tight text-slate-600">
                    Edit your social&nbsp;links
                </h1>
            </header>
            <LinkForm 
                contactId={contactId}
                initialLinkValues={currentLinkValues}
            />
        </Page>
    );
};
