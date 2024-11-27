import {Html, Head, Main, NextScript} from 'next/document'
import Script from 'next/script'
import React from "react";

export default function Document() {

    return (
        <Html className={"h-full bg-light-bg dark:bg-dark-bg"}>
            <Head/>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    )
}
