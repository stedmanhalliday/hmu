import { useEffect, useRef } from "react";

export default function EditPane(props) {

    const pane = useRef(0);

    useEffect(() => {
        const paneNode = pane.current;
        // Delay fade-in to let Contact fade out first (300ms duration)
        const timer = setTimeout(() => {
            paneNode.style.opacity = 1;
        }, 150);

        return () => {
            clearTimeout(timer);
            paneNode.style.opacity = 0;
        }
    }, [])

    return (
        <div ref={pane} className="fixed z-10 inset-0
            flex flex-col justify-evenly items-center
            overflow-hidden overscroll-none opacity-0
            transition-opacity duration-150"
            style={{
                paddingTop: 'max(env(safe-area-inset-top), 4rem)',
                paddingBottom: 'max(env(safe-area-inset-bottom), 4rem)'
            }}>

            {/* Edit Contact */}
            <div className="flex flex-col items-center gap-4">
                <button onClick={props.editContact}
                    className="w-20 h-20 rounded-full bg-black/10
                    flex items-center justify-center animate-pulse
                    active:bg-black/[.15] transition-all duration-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-8 h-8 fill-slate-500">
                        <path d="M224 256A128 128 0 1 0 224 0a128 128 0 1 0 0 256zm-45.7 48C79.8 304 0 383.8 0 482.3C0 498.7 13.3 512 29.7 512H418.3c16.4 0 29.7-13.3 29.7-29.7C448 383.8 368.2 304 269.7 304H178.3z"/>
                    </svg>
                </button>
                <span className="text-lg text-slate-600">
                    Edit contact
                </span>
            </div>

            {/* Edit Links */}
            <div className="flex flex-col items-center gap-4">
                <button onClick={props.editLinks}
                    className="w-20 h-20 rounded-full bg-black/10
                    flex items-center justify-center animate-pulse
                    active:bg-black/[.15] transition-all duration-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" className="w-8 h-8 fill-slate-500">
                        <path d="M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372.1 74 321.1 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z"/>
                    </svg>
                </button>
                <span className="text-lg text-slate-600">
                    Edit links
                </span>
            </div>

            {/* Delete Contact */}
            <div className="flex flex-col items-center gap-4">
                <button onClick={props.deleteContact}
                    className="w-20 h-20 rounded-full bg-red-500/10
                    flex items-center justify-center animate-pulse
                    active:bg-red-500/[.15] transition-all duration-100">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className="w-8 h-8 fill-red-500">
                        <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z"/>
                    </svg>
                </button>
                <span className="text-lg text-red-600">
                    Delete contact
                </span>
            </div>
        </div>
    )
}
