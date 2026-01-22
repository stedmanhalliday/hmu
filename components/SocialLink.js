export default function SocialLink(props) {
    return (
        <div className={`w-14 h-14 mb-4 mx-2 rounded-full
            flex justify-center items-center shrink-0
            bg-white shadow-md
            text-5xl ${props.className}`}
            onClick={props.onClick}
            data-displayname={props.displayName}
            data-label={props.label}
            data-url={props.url}
            data-type={props.type} >
        </div>
    )
}