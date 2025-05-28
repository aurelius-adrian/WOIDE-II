import {notFound} from "next/navigation";
import {getRequestConfig} from "next-intl/server";
import {headers} from "next/headers";

const locales = ["en", "de"];

export default getRequestConfig(async () => {
    const requestHeaders = await headers();
    const locale = requestHeaders.get("X-NEXT-INTL-LOCALE") || "en";
    if (!locales.includes(locale)) notFound();

    return {
        messages: (await import(`../public/locales/${locale}.json`)).default,
        locale: locale,
    };
});