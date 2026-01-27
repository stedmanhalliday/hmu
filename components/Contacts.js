import styles from "../styles/Preview.module.css";
import { useGradientAnimation } from "../hooks/useGradientAnimation.js";

import { useRouter } from "next/router";
import { memo } from "react";

function Contacts({ id, name, vibe, photo }) {
    const { angle, stops } = useGradientAnimation(vibe);
    const router = useRouter();

    // Navigate to QR code for this specific contact
    const preview = () => {
        router.push(`/preview?id=${id}`);
    }

    return (
        <div className={`${styles.miniCard} relative rounded-xl
            cursor-pointer active:scale-[.98] p-0.5`}
            style={{
                "background": `linear-gradient(${angle}deg, ${stops.start}, ${stops.end})`,
                "boxShadow": `0 -2px 8px 0 ${stops.startRGBA}, 0 2px 8px 0 ${stops.endRGBA}`
            }}
            onClick={preview}>
            <div className="w-80 pl-4 pr-10 py-4 flex items-center rounded-xl
            bg-white shadow-md">
                <span className="mr-3 text-2xl flex items-center">
                    {photo ? (
                        <img src={photo}
                            className="w-6 h-6 rounded-full object-cover"
                            alt="Profile" />
                    ) : vibe?.emoji && (
                        <img src={`/emoji/${vibe.emoji}.png`} alt={vibe.emoji}
                            width={24} height={24} />
                    )}
                </span>
                <p className="text-lg truncate text-slate-800">{name}</p>
            </div>
        </div>
    );
}

export default memo(Contacts);
