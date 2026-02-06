export default function TextButton({className, style, type, onClick, disabled, children}) {
    return (
        <button className={`
        py-2 cursor-pointer
        text-sm text-slate-600 uppercase tracking-widest leading-3 textButton
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}`}
            style={style}
            type={type}
            onClick={onClick}
            disabled={disabled}>
            {children}
        </button>
    );
}
