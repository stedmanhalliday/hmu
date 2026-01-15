import styles from "../styles/Preview.module.css";

import * as convert from 'color-convert';
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Contacts({ id, name, vibe }) {

    const [stops, setStops] = useState({
        start: "",
        startRGBA: "",
        end: "",
        endRGBA: ""
    });

    const [angle, setAngle] = useState(180);

    // Increment gradient angle
    const updateGradientAngle = () => {
        setAngle((prevAngle) => (prevAngle + 1) % 360);
    };

    // Convert hex to rgba
    const rgbaColor = (hexColor, alpha) => {
        const stop = convert.hex.rgb(hexColor);
        const rgbaColor = "rgba(" + stop.join(",") + "," + alpha + ")";
        return rgbaColor;
    }

    // Initialize router
    const router = useRouter();

    // Navigate to QR code for this specific contact
    const preview = () => {
        router.push(`/preview?id=${id}`);
    }

    useEffect(() => {
        if (vibe && vibe.group && vibe.group.length > 0) {
            setStops({
                start: vibe.group[0],
                end: vibe.group[vibe.group.length - 1],
                startRGBA: rgbaColor(vibe.group[0], 0.5),
                endRGBA: rgbaColor(vibe.group[vibe.group.length - 1], 0.5)
            });
        }
        const interval = setInterval(updateGradientAngle, 15);
        return () => clearInterval(interval);
    }, [vibe]);

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
                    {vibe?.emoji &&
                        <img src={`/emoji/${vibe.emoji}.png`} alt={vibe.emoji}
                            width={24} height={24} />
                    }
                </span>
                <p className="text-lg truncate text-slate-800">{name}</p>
            </div>
        </div>
    );
}
