import TextButton from "./TextButton.js";

import { useEffect, useRef } from "react";

/**
 * Confirmation modal with cancel/confirm actions.
 * Used for destructive operations like delete.
 */
export default function ConfirmModal({
    title,
    children,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onCancel,
    isLoading = false,
    confirmDestructive = false
}) {
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
    }, []);

    return (
        <div
            ref={shim}
            className="fixed w-full h-full left-0 top-0 bg-black/[.15] opacity-0 transition-all duration-300 z-50"
            onClick={onCancel}
        >
            <div
                ref={modal}
                className="fixed left-1/2 top-[45%] -translate-x-1/2 -translate-y-1/2
                    w-full max-w-[23rem] px-8 pt-6 pb-4 rounded-xl flex flex-col
                    bg-white shadow-2xl transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="pb-4 mb-5 border-b border-solid border-purple-200">
                    <p className="relative left-8 text-xl font-normal uppercase tracking-wider text-purple-600 modalTitle">
                        {title}
                    </p>
                </div>
                {children}
                <div className="flex justify-end gap-4 mt-4">
                    <TextButton
                        onClick={onCancel}
                        disabled={isLoading}
                    >
                        {cancelLabel}
                    </TextButton>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className={`
                            py-2 px-4 rounded-lg cursor-pointer
                            text-sm uppercase tracking-widest leading-3
                            transition-all duration-100
                            ${confirmDestructive
                                ? 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700'
                                : 'bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                    >
                        {isLoading ? "..." : confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
