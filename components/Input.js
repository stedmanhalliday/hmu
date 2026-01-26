export default function Input(props) {
    const hasError = props.error && props.error.length > 0;

    return (
        <label className="mb-4">
            <div className="mb-1 text-slate-600">{props.label}</div>
            <input className={`py-2 px-3 w-full max-w-md text-lg border rounded-md text-slate-800
                placeholder:text-slate-400
                focus:outline-none focus:shadow-[inset_0_0_0.25rem_rgb(216,180,254)]
                ${hasError
                    ? 'border-red-400 focus:border-red-400'
                    : 'border-slate-300 focus:border-purple-400'}`}
                autoCorrect="off" autoCapitalize="off" spellCheck="false"
                type={props.type}
                name={props.name}
                value={props.value}
                placeholder={props.placeholder}
                onChange={props.onChange}
                onBlur={props.onBlur}
                required={props.required} />
            {hasError && (
                <div className="mt-1 text-sm text-red-500">{props.error}</div>
            )}
        </label>
    )
}