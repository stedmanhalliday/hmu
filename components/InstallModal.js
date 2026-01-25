import Modal from "./Modal.js";

function Instructions({ os }) {
    if (os === "ios") {
        return (
            <div className="text-base text-slate-600 space-y-3">
                <ol className="ml-5 list-decimal space-y-3">
                    <li>Tap the <em className="relative font-medium uppercase tracking-wide pl-5 ml-1 mr-0.5 safariShare">share</em> icon at the bottom of the screen (Safari) or top right in the address bar (Chrome).</li>
                    <li>Scroll down and tap the <em className="font-medium uppercase tracking-wide">Add to home screen</em> option.</li>
                </ol>
                <p>Make sure you&apos;re using the lastest version of Safari or Chrome.</p>
            </div>
        );
    } else if (os === "android") {
        return (
            <div className="text-base text-slate-600 space-y-3">
                <ol className="ml-5 list-decimal space-y-3">
                    <li>Open this page in Chrome.</li>
                    <li>Tap the <em className="font-medium uppercase tracking-wide">install app</em> button.</li>
                </ol>
                <p>Make sure you&apos;re using the lastest version of Chrome.</p>
            </div>
        );
    } else return (
        <div className="text-base text-slate-600 space-y-3">
            <p>
                hmu.world supports iOS and Android.
            </p>
            <ol className="ml-5 list-decimal space-y-3">
                <li>Open this page on a mobile device <em className="font-medium uppercase tracking-wide">or</em> scan the QR code on the homepage with its camera.</li>
                <li>Tap the <em className="font-medium uppercase tracking-wide">install app</em> button.</li>
            </ol>
        </div>
    );
}

export default function InstallModal({ os, dismiss }) {

    return (
        <Modal title="Install hmu.world" dismiss={dismiss}>
            <Instructions os={os} />
        </Modal >
    )
}