"use client";

import Markdown from "react-markdown";
import { useTranslations } from "next-intl";

export default function Main() {
    const t = useTranslations("Home");

    return (
        <div className={"py-10"}>
            <Markdown>{t("article")}</Markdown>
        </div>
    );
}
