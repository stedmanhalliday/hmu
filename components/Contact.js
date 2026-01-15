import * as convert from 'color-convert';
import { useState, useEffect } from "react";

export default function Contact(props) {
    const [stops, setStops] = useState({
        start: "",
        startRGBA: "",
        end: "",
        endRGBA: ""
    });

    const [angle, setAngle] = useState(180);
    const [imageAttributes, setImageAttributes] = useState({
        src: "",
        alt: ""
    });

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

    useEffect(() => {
        if (props.vibe.group && props.vibe.group.length > 0) {
            setStops({
                start: props.vibe.group[0],
                end: props.vibe.group[props.vibe.group.length - 1],
                startRGBA: rgbaColor(props.vibe.group[0], 0.5),
                endRGBA: rgbaColor(props.vibe.group[props.vibe.group.length - 1], 0.5)
            });
        }
        const interval = setInterval(updateGradientAngle, 15);

        if (props.activeLink == "" && props.vibe.emoji) {
            setImageAttributes({
                src: `/emoji/${props.vibe.emoji}.png`,
                alt: props.vibe.emoji
            });
        } else if (props.activeLink == "instagram") {
            setImageAttributes({
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' fill='rgba(0, 0, 0)'%3E%3Cpath d='M224,202.66A53.34,53.34,0,1,0,277.36,256,53.38,53.38,0,0,0,224,202.66Zm124.71-41a54,54,0,0,0-30.41-30.41c-21-8.29-71-6.43-94.3-6.43s-73.25-1.93-94.31,6.43a54,54,0,0,0-30.41,30.41c-8.28,21-6.43,71.05-6.43,94.33S91,329.26,99.32,350.33a54,54,0,0,0,30.41,30.41c21,8.29,71,6.43,94.31,6.43s73.24,1.93,94.3-6.43a54,54,0,0,0,30.41-30.41c8.35-21,6.43-71.05,6.43-94.33S357.1,182.74,348.75,161.67ZM224,338a82,82,0,1,1,82-82A81.9,81.9,0,0,1,224,338Zm85.38-148.3a19.14,19.14,0,1,1,19.13-19.14A19.1,19.1,0,0,1,309.42,189.74ZM400,32H48A48,48,0,0,0,0,80V432a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V80A48,48,0,0,0,400,32ZM382.88,322c-1.29,25.63-7.14,48.34-25.85,67s-41.4,24.63-67,25.85c-26.41,1.49-105.59,1.49-132,0-25.63-1.29-48.26-7.15-67-25.85s-24.63-41.42-25.85-67c-1.49-26.42-1.49-105.61,0-132,1.29-25.63,7.07-48.34,25.85-67s41.47-24.56,67-25.78c26.41-1.49,105.59-1.49,132,0,25.63,1.29,48.33,7.15,67,25.85s24.63,41.42,25.85,67.05C384.37,216.44,384.37,295.56,382.88,322Z'/%3E%3C/svg%3E",
                alt: "instagram"
            });
        } else if (props.activeLink == "twitter") {
            setImageAttributes({
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' fill='rgba(0, 0, 0)'%3E%3Cpath d='M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm297.1 84L257.3 234.6 379.4 396H283.8L209 298.1 123.3 396H75.8l111-126.9L69.7 116h98l67.7 89.5L313.6 116h47.5zM323.3 367.6L153.4 142.9H125.1L296.9 367.6h26.3z'/%3E%3C/svg%3E",
                alt: "twitter"
            });
        } else if (props.activeLink == "linkedin") {
            setImageAttributes({
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512' fill='rgba(0, 0, 0)'%3E%3Cpath d='M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z'/%3E%3C/svg%3E",
                alt: "linkedin"
            });
        } else if (props.activeLink == "venmo") {
            setImageAttributes({
                src: "data:image/svg+xml,%3Csvg viewBox='0 0 448 512' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M412.17 32H38.28C17.85 32 0 46.7 0 66.89V441.6C0 461.91 17.85 480 38.28 480H412.06C432.6 480 448 461.8 448 441.61V66.89C448.12 46.7 432.6 32 412.17 32ZM246 387H142.32L100.75 138.44L191.5 129.82L213.5 306.69C234.03 273.24 259.38 220.69 259.38 184.82C259.38 165.2 256.02 151.82 250.77 140.82L333.4 124.1C342.96 139.88 347.26 156.1 347.26 176.67C347.25 242.17 291.34 327.26 246 387Z' fill='black'/%3E%3C/svg%3E",
                alt: "venmo"
            });
        } else if (props.activeLink == "custom") {
            setImageAttributes({
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' fill='rgba(0, 0, 0)'%3E%3Cpath d='M352 256c0 22.2-1.2 43.6-3.3 64H163.3c-2.2-20.4-3.3-41.8-3.3-64s1.2-43.6 3.3-64H348.7c2.2 20.4 3.3 41.8 3.3 64zm28.8-64H503.9c5.3 20.5 8.1 41.9 8.1 64s-2.8 43.5-8.1 64H380.8c2.1-20.6 3.2-42 3.2-64s-1.1-43.4-3.2-64zm112.6-32H376.7c-10-63.9-29.8-117.4-55.3-151.6c78.3 20.7 142 77.5 171.9 151.6zm-149.1 0H167.7c6.1-36.4 15.5-68.6 27-94.7c10.5-23.6 22.2-40.7 33.5-51.5C239.4 3.2 248.7 0 256 0s16.6 3.2 27.8 13.8c11.3 10.8 23 27.9 33.5 51.5c11.6 26 20.9 58.2 27 94.7zm-209 0H18.6C48.6 85.9 112.2 29.1 190.6 8.4C165.1 42.6 145.3 96.1 135.3 160zM8.1 192H131.2c-2.1 20.6-3.2 42-3.2 64s1.1 43.4 3.2 64H8.1C2.8 299.5 0 278.1 0 256s2.8-43.5 8.1-64zM194.7 446.6c-11.6-26-20.9-58.2-27-94.6H344.3c-6.1 36.4-15.5 68.6-27 94.6c-10.5 23.6-22.2 40.7-33.5 51.5C272.6 508.8 263.3 512 256 512s-16.6-3.2-27.8-13.8c-11.3-10.8-23-27.9-33.5-51.5zM135.3 352c10 63.9 29.8 117.4 55.3 151.6C112.2 482.9 48.6 426.1 18.6 352H135.3zm358.1 0c-30 74.1-93.6 130.9-171.9 151.6c25.5-34.2 45.2-87.7 55.3-151.6H493.4z'/%3E%3C/svg%3E",
                alt: "globe icon"
            });
        }

        return () => clearInterval(interval);
    }, [props.vibe, props.displayName, props.label, props.src, props.activeLink]);

    return (
        <div className="flex flex-col items-center justify-center z-0">
            <div className="-z-10 fixed top-0 right-0 bottom-0 left-0 opacity-20"
                style={{ "background": `linear-gradient(-${angle}deg, ${stops.start}, ${stops.end})` }}>
            </div>
            <header className="flex flex-col items-center space-y-6
            transition-opacity duration-300"
                style={props.style}>
                <div className="w-20 h-20 rounded-full
                flex justify-center items-center shrink-0
                bg-white shadow-md text-5xl">
                    {props.vibe.emoji &&
                        <img src={imageAttributes.src} alt={imageAttributes.alt}
                            width={48} height={48} className="h-12" />
                    }
                </div>
                <div className="text-center">
                    <h1 className="text-3xl leading-tight max-w-sm text-slate-800">{props.displayName}</h1>
                    <p className="mt-2 text-xl text-slate-600">{props.label}</p>
                </div>
            </header >
            <div className="p-3 flex items-center justify-center mt-8 rounded-[24px]
            transition-opacity duration-300"
                style={{
                    ...props.style,
                    "background": `linear-gradient(${angle}deg, ${stops.start}, ${stops.end})`,
                    "boxShadow": `0 -4px 16px 0 ${stops.startRGBA}, 0 4px 16px 0 ${stops.endRGBA}`
                }}>
                <div className="flex p-1.5 rounded-[16px]
                bg-white">
                    {props.src &&
                        <img src={props.src} width={168} height={168}
                            alt={`${props.label} QR code for ${props.displayName}`} />
                    }
                </div>
            </div>
        </div >
    )
}