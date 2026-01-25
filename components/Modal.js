import TextButton from "./TextButton.js";

import { useEffect, useRef } from "react";

export default function Modal({ title, children, dismiss }) {

    const shim = useRef(null);
    const modal = useRef(null);

    useEffect(() => {

        const shimNode = shim.current;
        const modalNode = modal.current;

        shimNode.style.opacity = 1;
        modalNode.style.top = "50%";

        return () => {
            shimNode.style.opacity = 0;
            modalNode.style.top = "45%";
        }
    }, [])

    return (
        <div ref={shim} className="fixed w-full h-full left-0 top-0 bg-black/[.15] opacity-0 transition-all duration-300">
            <div ref={modal} className="fixed left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2
            w-full max-w-[23rem] px-8 pt-6 pb-4 rounded-xl flex flex-col
            bg-white shadow-2xl transition-all duration-300">
                <div className="pb-4 mb-5 border-b border-solid border-purple-200">
                    <p className="relative left-8 text-xl font-normal uppercase tracking-wider text-purple-600 modalTitle">{title}</p>
                </div>
                {children}
                <div className="text-right">
                    <TextButton className="mt-4" onClick={dismiss}>Dismiss</TextButton>
                </div>
            </div>
        </div>
    );
}