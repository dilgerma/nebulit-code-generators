import { Geist, Geist_Mono } from "next/font/google";
import '../../public/css/global.css'
const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});


export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
        <head>
            <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Sofia"/>

            <meta charSet="UTF-8"/>
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
            <link rel="stylesheet" href="/css/globals.css"/>
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bulma/0.9.4/css/bulma.min.css"/>
            <script src="https://kit.fontawesome.com/5fb943030e.js" crossOrigin="anonymous"
                    async={true}/>

            <link rel="icon" href="/favicon.ico"/>
        </head>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        </body>
        </html>
    );
}
