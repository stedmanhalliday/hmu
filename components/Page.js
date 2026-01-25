import Header from "../components/Header.js";

export default function Page({ className, style, children }) {
    return (
        <div>
            <Header></Header>
            <main className={`box-border min-h-screen flex flex-col items-center
            transition-opacity duration-300 ${className}`}
                style={{
                    ...style,
                    paddingTop: 'max(env(safe-area-inset-top), 2rem)',
                    paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)',
                    paddingLeft: 'max(env(safe-area-inset-left), 2rem)',
                    paddingRight: 'max(env(safe-area-inset-right), 2rem)',
                }}>
                {children}
            </main>
        </div>
    );
}