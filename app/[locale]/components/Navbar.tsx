"use client";
import React from "react";
import { Button } from "@fluentui/react-button";
import { useDarkModeContext } from "./Setup";
import { DarkThemeFilled, HomeRegular, SettingsRegular } from "@fluentui/react-icons";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import LanguageSelect from "./LanguageSelect";

const Navbar = () => {
    const locale = useLocale();
    const { darkMode, setDarkMode } = useDarkModeContext();
    const t = useTranslations("Navbar");
    const pathname = usePathname();
    const handleLanguageChange = (e: string) => {
        const path = pathname.split("/").slice(2).join("/");
        window.location.href = `/${e}/${path}`;
    };

    return (
        <div className="relative bg-blue-950 h-12">
            <div className="h-full flex items-center px-3 justify-between">
                <div hidden={pathname.endsWith("/settings")}>
                    <Button
                        appearance="transparent"
                        icon={<SettingsRegular className={"transition-all text-white hover:rotate-45"} />}
                        onClick={() => {
                            location.href = "/settings";
                        }}
                    ></Button>
                </div>
                <div hidden={pathname.endsWith("/taskpane")}>
                    <Button
                        appearance="transparent"
                        icon={<HomeRegular className={"transition-all text-white"} />}
                        onClick={() => {
                            location.href = "/taskpane";
                        }}
                    ></Button>
                </div>

                <div className={"flex flex-row space-x-2"}>
                    <Button
                        appearance="transparent"
                        icon={
                            darkMode ? (
                                <DarkThemeFilled className={"transition-all rotate-180 text-white"} />
                            ) : (
                                <DarkThemeFilled className={"transition-all rotate-360 text-white"} />
                            )
                        }
                        color="white"
                        onClick={() => setDarkMode(!darkMode)}
                    ></Button>
                    <LanguageSelect locale={locale} setLocale={handleLanguageChange} white={true} />
                </div>
            </div>
        </div>
    );
};

export default Navbar;
