/*
 * Copyright (c) 2025 Nebulit GmbH
 * Licensed under the MIT License.
 */

import Document, {Html, Head, Main, NextScript} from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html>
                <Head>
                    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Sofia"/>

                    <meta charSet="UTF-8"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
                    <link rel="stylesheet" href="/css/global.css"/>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.9.4/css/bulma.min.css"/>
                    <script src="https://kit.fontawesome.com/5fb943030e.js" crossOrigin="anonymous"
                            async={true}/>

                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <body>
                <Main/>
                <NextScript/>
                </body>
            </Html>
        );
    }
}

export default MyDocument;
