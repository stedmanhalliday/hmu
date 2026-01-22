export default function SocialLink(props) {
    return (
        <div className={`w-12 h-12 mb-3 mx-2 rounded-full
            flex justify-center items-center shrink-0
            bg-white shadow-md
            text-3xl ${props.className}`}
            onClick={props.onClick}
            data-displayname={props.displayName}
            data-label={props.label}
            data-url={props.url}
            data-type={props.type} >
        </div>
    )
}