import TextButton from "./TextButton.js";

import { useEffect, useRef } from "react";

export default function Modal({ title, children, dismiss }) {

    const shim = useRef(null);
    const modal = useRef(null);

    useEffect(() => {

        const shimNode = shim.current;
        const modalNode = modal.current;

        shimNode.style.opacity = 1;
        modalNode.style.top = "0";

        return () => {
            shimNode.style.opacity = 0;
            modalNode.style.top = "-5%";
        }
    }, [])

    return (
        <div ref={shim} className="fixed inset-0 bg-black/[.15] opacity-0 transition-all duration-[240ms] flex items-center justify-center z-40" onClick={dismiss}>
            <div ref={modal} onClick={(e) => e.stopPropagation()} className="relative top-[-5%]
            w-full max-w-[23rem] px-8 pt-6 pb-4 rounded-xl flex flex-col
            bg-white shadow-2xl transition-all duration-[240ms]">
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