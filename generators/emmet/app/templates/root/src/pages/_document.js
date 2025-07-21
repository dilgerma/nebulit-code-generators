// src/pages/_document.js
import {Head, Html, Main, NextScript} from 'next/document'

export default function Document() {
    return (
        <Html lang="en">
            <Head>
                <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Sofia"/>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@1.0.4/css/bulma.min.css"/>
                <link rel="stylesheet" href="/css/global.css"/>
                <script src="https://kit.fontawesome.com/5fb943030e.js" crossOrigin="anonymous" async/>
                <link rel="icon" href="/favicon.ico"/>
            </Head>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    )
}
