import { SOCIAL_ICONS } from "../lib/socialIcons.js";

export default function SocialLink(props) {
    const icon = SOCIAL_ICONS[props.type] || SOCIAL_ICONS.contact;

    return (
        <div className={`w-16 h-16 mb-6 mx-3 rounded-full
            flex justify-center items-center shrink-0
            bg-white shadow-md socialLink
            ${props.className}`}
            onClick={props.onClick}
            data-displayname={props.displayName}
            data-label={props.label}
            data-url={props.url}
            data-type={props.type} >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon.src} alt={icon.alt}
                className="w-[46%] h-[46%]" />
        </div>
    )
}