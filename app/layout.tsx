import Setup from "./components/Setup";
import '../styles/globals.css'
import React from "react";

export const metadata = {
    title: 'Next.js',
    description: 'Generated by Next.js',
}

export default function RootLayout({children}: { children: React.ReactNode }) {
    return (
        <html lang="en">
        <body>
        <Setup>
            {children}
        </Setup>
        </body>
        </html>
    )
}
