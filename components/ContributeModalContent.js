import DonateButton from "./DonateButton.js";

const linkClass = "text-purple-600 transition-all duration-[240ms] hover:text-purple-400 focus:text-purple-400 active:text-purple-400";

export default function ContributeModalContent() {
    return (
        <div className="text-base text-slate-600 space-y-3">
            <p>hmu.world is free, open source, and private. Help improve it with feedback, code contributions, or donations.</p>
            <ul>
                <li>Email: <a href="mailto:sup@hmu.world?subject=hmu.world%20Feedback" target="_blank" rel="noreferrer"
                    className={linkClass}>sup@hmu.world</a></li>
                <li>X (Twitter): <a href="https://x.com/stedmanhalliday" target="_blank" rel="noreferrer"
                    className={linkClass}>@stedmanhalliday</a></li>
                <li>GitHub: <a href="https://github.com/stedmanhalliday/hmu" target="_blank" rel="noreferrer"
                    className={linkClass}>stedmanhalliday/hmu</a></li>
            </ul>
            <DonateButton />
        </div>
    );
}
