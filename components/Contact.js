import { useState, useEffect, memo } from "react";
import { useGradientAnimation } from "../hooks/useGradientAnimation.js";

// Social link icon SVGs
const SOCIAL_ICONS = {
    instagram: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' fill='rgba(0, 0, 0)'%3E%3Cpath d='M224,202.66A53.34,53.34,0,1,0,277.36,256,53.38,53.38,0,0,0,224,202.66Zm124.71-41a54,54,0,0,0-30.41-30.41c-21-8.29-71-6.43-94.3-6.43s-73.25-1.93-94.31,6.43a54,54,0,0,0-30.41,30.41c-8.28,21-6.43,71.05-6.43,94.33S91,329.26,99.32,350.33a54,54,0,0,0,30.41,30.41c21,8.29,71,6.43,94.31,6.43s73.24,1.93,94.3-6.43a54,54,0,0,0,30.41-30.41c8.35-21,6.43-71.05,6.43-94.33S357.1,182.74,348.75,161.67ZM224,338a82,82,0,1,1,82-82A81.9,81.9,0,0,1,224,338Zm85.38-148.3a19.14,19.14,0,1,1,19.13-19.14A19.1,19.1,0,0,1,309.42,189.74ZM400,32H48A48,48,0,0,0,0,80V432a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V80A48,48,0,0,0,400,32ZM382.88,322c-1.29,25.63-7.14,48.34-25.85,67s-41.4,24.63-67,25.85c-26.41,1.49-105.59,1.49-132,0-25.63-1.29-48.26-7.15-67-25.85s-24.63-41.42-25.85-67c-1.49-26.42-1.49-105.61,0-132,1.29-25.63,7.07-48.34,25.85-67s41.47-24.56,67-25.78c26.41-1.49,105.59-1.49,132,0,25.63,1.29,48.33,7.15,67,25.85s24.63,41.42,25.85,67.05C384.37,216.44,384.37,295.56,382.88,322Z'/%3E%3C/svg%3E",
        alt: "instagram"
    },
    twitter: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' fill='rgba(0, 0, 0)'%3E%3Cpath d='M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm297.1 84L257.3 234.6 379.4 396H283.8L209 298.1 123.3 396H75.8l111-126.9L69.7 116h98l67.7 89.5L313.6 116h47.5zM323.3 367.6L153.4 142.9H125.1L296.9 367.6h26.3z'/%3E%3C/svg%3E",
        alt: "twitter"
    },
    linkedin: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' fill='rgba(0, 0, 0)'%3E%3Cpath d='M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z'/%3E%3C/svg%3E",
        alt: "linkedin"
    },
    github: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' fill='rgba(0, 0, 0)'%3E%3Cpath d='M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zM277.3 415.7c-8.4 1.5-11.5-3.7-11.5-8 0-5.4.2-33 .2-55.3 0-15.6-5.2-25.5-11.3-30.7 37-4.1 76-9.2 76-73.1 0-18.2-6.5-27.3-17.1-39 1.7-4.3 7.4-22-1.7-45-13.9-4.3-45.7 17.9-45.7 17.9-13.2-3.7-27.5-5.6-41.6-5.6-14.1 0-28.4 1.9-41.6 5.6 0 0-31.8-22.2-45.7-17.9-9.1 22.9-3.5 40.6-1.7 45-10.6 11.7-15.6 20.8-15.6 39 0 63.6 37.3 69 74.3 73.1-4.8 4.3-9.1 11.7-10.6 22.3-9.5 4.3-33.8 11.7-48.3-13.9-9.1-15.8-25.5-17.1-25.5-17.1-16.2-.2-1.1 10.2-1.1 10.2 10.8 5 18.4 24.2 18.4 24.2 9.7 29.7 56.1 19.7 56.1 19.7 0 13.9.2 36.5.2 40.6 0 4.3-3 9.5-11.5 8-66-22.1-112.2-84.9-112.2-158.3 0-91.8 70.2-161.5 162-161.5S388 165.6 388 257.4c.1 73.4-44.7 136.3-110.7 158.3z'/%3E%3C/svg%3E",
        alt: "github"
    },
    telegram: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' fill='rgba(0, 0, 0)'%3E%3Cpath d='M446.7 98.6l-67.6 318.8c-5.1 22.5-18.4 28.1-37.3 17.5l-103-75.9-49.7 47.8c-5.5 5.5-10.1 10.1-20.7 10.1l7.4-104.9 190.9-172.5c8.3-7.4-1.8-11.5-12.9-4.1L117.8 284 16.2 252.2c-22.1-6.9-22.5-22.1 4.6-32.7L418.2 66.4c18.4-6.9 34.5 4.1 28.5 32.2z'/%3E%3C/svg%3E",
        alt: "telegram"
    },
    venmo: {
        src: "data:image/svg+xml,%3Csvg viewBox='0 0 448 512' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M412.17 32H38.28C17.85 32 0 46.7 0 66.89V441.6C0 461.91 17.85 480 38.28 480H412.06C432.6 480 448 461.8 448 441.61V66.89C448.12 46.7 432.6 32 412.17 32ZM246 387H142.32L100.75 138.44L191.5 129.82L213.5 306.69C234.03 273.24 259.38 220.69 259.38 184.82C259.38 165.2 256.02 151.82 250.77 140.82L333.4 124.1C342.96 139.88 347.26 156.1 347.26 176.67C347.25 242.17 291.34 327.26 246 387Z' fill='black'/%3E%3C/svg%3E",
        alt: "venmo"
    },
    custom: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 512' fill='rgba(0,0,0)'%3E%3Cpath d='M579.8 267.7c56.5-56.5 56.5-148 0-204.5c-50-50-128.8-56.5-186.3-15.4l-1.6 1.1c-14.4 10.3-17.7 30.3-7.4 44.6s30.3 17.7 44.6 7.4l1.6-1.1c32.1-22.9 76-19.3 103.8 8.6c31.5 31.5 31.5 82.5 0 114L422.3 334.8c-31.5 31.5-82.5 31.5-114 0c-27.9-27.9-31.5-71.8-8.6-103.8l1.1-1.6c10.3-14.4 6.9-34.4-7.4-44.6s-34.4-6.9-44.6 7.4l-1.1 1.6C206.5 251.2 213 330 263 380c56.5 56.5 148 56.5 204.5 0L579.8 267.7zM60.2 244.3c-56.5 56.5-56.5 148 0 204.5c50 50 128.8 56.5 186.3 15.4l1.6-1.1c14.4-10.3 17.7-30.3 7.4-44.6s-30.3-17.7-44.6-7.4l-1.6 1.1c-32.1 22.9-76 19.3-103.8-8.6C74 372.1 74 321.1 105.5 289.5L217.7 177.2c31.5-31.5 82.5-31.5 114 0c27.9 27.9 31.5 71.8 8.6 103.9l-1.1 1.6c-10.3 14.4-6.9 34.4 7.4 44.6s34.4 6.9 44.6-7.4l1.1-1.6C433.5 260.8 427 182 377 132c-56.5-56.5-148-56.5-204.5 0L60.2 244.3z'/%3E%3C/svg%3E",
        alt: "link"
    },
    contact: {
        src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512' fill='rgba(0, 0, 0)'%3E%3Cpath d='M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H512c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm80 256h64c44.2 0 80 35.8 80 80c0 8.8-7.2 16-16 16H80c-8.8 0-16-7.2-16-16c0-44.2 35.8-80 80-80zm-32-96a64 64 0 1 1 128 0 64 64 0 1 1 -128 0zm256-32H496c8.8 0 16 7.2 16 16s-7.2 16-16 16H368c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H496c8.8 0 16 7.2 16 16s-7.2 16-16 16H368c-8.8 0-16-7.2-16-16s7.2-16 16-16zm0 64H496c8.8 0 16 7.2 16 16s-7.2 16-16 16H368c-8.8 0-16-7.2-16-16s7.2-16 16-16z'/%3E%3C/svg%3E",
        alt: "contact card"
    }
};

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
