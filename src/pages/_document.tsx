import {Html, Head, Main, NextScript} from 'next/document'
import React from "react";

export default function Document() {

    return (
        <Html className={"h-full bg-light-bg dark:bg-dark-bg"}>
            <Head>
                {/* eslint-disable-next-line @next/next/no-sync-scripts */}
                <script type="text/javascript"
                        src="/office/office.js"></script>
            </Head>
            <body>
            <Main/>
            <NextScript/>
            </body>
        </Html>
    )
}
