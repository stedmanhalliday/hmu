import Header from "../components/Header.js";

export default function Page({ className, style, children }) {
    return (
        <div>
            <Header></Header>
            <main className={`box-border min-h-screen flex flex-col items-center
            transition-opacity duration-300 p-8 ${className}`}
                style={style}>
                {children}
            </main>
        </div>
    );
}