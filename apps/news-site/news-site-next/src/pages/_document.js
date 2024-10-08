import { Html, Head, Main, NextScript } from "next/document";
import Script from "next/script";

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <Script src="./workload-testing-utils.min.js" strategy="beforeInteractive" type="module" async />
                <Script src="./workload-test.js" strategy="beforeInteractive" type="module" async />
            </Head>
            <body>
                <Main />
                <div id="settings-container"></div>
                <div id="notifications-container"></div>
                <div id="sitemap-container"></div>
                <div id="login-container"></div>
                <NextScript />
            </body>
        </Html>
    );
}
