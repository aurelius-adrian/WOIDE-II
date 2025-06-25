"use client";
import React from "react";
import { Button } from "@fluentui/react-button";
import { useDarkModeContext } from "../../components/Setup";
import { DarkThemeFilled } from "@fluentui/react-icons";
import { usePathname } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import LanguageSelect from "../../components/LanguageSelect";

export const Navbar = () => {
    const locale = useLocale();
    const { darkMode, setDarkMode } = useDarkModeContext();
    const t = useTranslations("Navbar");
    const pathname = usePathname();
    const handleLanguageChange = (e: string) => {
        const path = pathname.split("/").slice(2).join("/");
        window.location.href = `/${e}/${path}`;
    };

    return (
        <div className="relative bg-blue-950 h-16 shadow-md">
            <div className="container mx-auto px-4 h-full">
                <div className="flex justify-between items-center h-full">
                    {/* Left section - Brand and Navigation */}
                    <div className="flex items-center space-x-6">
                        <h1 className="text-white text-xl font-bold">WOIDE II - A Word OMDoc IDE</h1>
                    </div>

                    {/* Right section - Controls */}
                    <div className="flex items-center space-x-4">
                        <Button
                            appearance="transparent"
                            icon={
                                darkMode ? (
                                    <DarkThemeFilled className="transition-all rotate-180 text-white hover:text-blue-200" />
                                ) : (
                                    <DarkThemeFilled className="transition-all rotate-0 text-white hover:text-blue-200" />
                                )
                            }
                            onClick={() => setDarkMode(!darkMode)}
                        />
                        <LanguageSelect locale={locale} setLocale={handleLanguageChange} white={true} long={true} />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
