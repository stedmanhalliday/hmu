import Script from "next/script";

export default function Analytics() {
    // Google Analytics tag: G-0JWKW8VHW8
    return (
        <div>
            <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-0JWKW8VHW8" />
            <Script strategy="afterInteractive" id="gtag-init"
                dangerouslySetInnerHTML={{__html: `
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
            
                    gtag('config', 'G-0JWKW8VHW8');
                `}}
            />
        </div>
    );
}