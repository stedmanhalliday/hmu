import { useState, useEffect, memo } from "react";
import { useGradientAnimation } from "../hooks/useGradientAnimation.js";
import { SOCIAL_ICONS } from "../lib/socialIcons.js";

function Contact({ src, displayName, vibe, label, style, activeLink, url, photo }) {
    const { angle, stops } = useGradientAnimation(vibe);
    const [imageAttributes, setImageAttributes] = useState(SOCIAL_ICONS.contact);

    // Update icon based on active link
    useEffect(() => {
        const icon = SOCIAL_ICONS[activeLink] || SOCIAL_ICONS.contact;
        setImageAttributes(icon);
    }, [activeLink]);

    const gradientBackground = (
        <div className="-z-10 fixed inset-0 opacity-20"
            style={{ background: `linear-gradient(-${angle}deg, ${stops.start}, ${stops.end})` }} />
    );

    const headerElement = (
        <header className="flex flex-col items-center space-y-4 shrink-0 transition-opacity duration-300"
            style={style?.opacity === 0
                ? { ...style, visibility: 'hidden', pointerEvents: 'none' }
                : style}>
            <div className="w-20 h-20 rounded-full flex justify-center items-center shrink-0
                bg-white shadow-md text-5xl overflow-hidden">
                {photo ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={photo}
                        className="w-full h-full object-cover"
                        alt="Profile" />
                ) : vibe?.emoji && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={`/emoji/${vibe.emoji}.png`} alt={vibe.emoji}
                        width={48} height={48} className="h-12" />
                )}
            </div>
            <div className="text-center w-80">
                <h1 className="leading-tight max-w-sm text-slate-800 truncate"
                    style={{ fontSize: 'clamp(1.5rem, 8vw, 2.25rem)' }}>{displayName}</h1>
                <div className="mt-2 flex items-center justify-center gap-1.5 text-xl text-slate-600">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imageAttributes.src} alt={imageAttributes.alt}
                        width={18} height={18} className="h-[18px] opacity-60" />
                    <span>{label}</span>
                </div>
            </div>
        </header>
    );

    const qrElement = (
        <div className="p-3 flex items-center justify-center rounded-[24px] transition-opacity duration-300"
            style={{
                ...style,
                ...(style?.opacity === 0 && { visibility: 'hidden', pointerEvents: 'none' }),
                background: `linear-gradient(${angle}deg, ${stops.start}, ${stops.end})`,
                boxShadow: `0 -4px 16px 0 ${stops.startRGBA}, 0 4px 16px 0 ${stops.endRGBA}`
            }}>
            {url ? (
                <a href={url} target="_blank" rel="noopener noreferrer"
                    className="flex p-1.5 rounded-[16px] bg-white cursor-pointer
                    active:scale-[0.98] transition-transform">
                    {src &&
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={src} width={168} height={168}
                            alt={`${label} QR code for ${displayName}`} />
                    }
                </a>
            ) : (
                <div className="flex p-1.5 rounded-[16px] bg-white">
                    {src &&
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={src} width={168} height={168}
                            alt={`${label} QR code for ${displayName}`} />
                    }
                </div>
            )}
        </div>
    );

    return (
        <>
            {gradientBackground}
            <div className="flex flex-col items-center">
                {headerElement}
                <div className="mt-8">{qrElement}</div>
            </div>
        </>
    );
}

export default memo(Contact);
