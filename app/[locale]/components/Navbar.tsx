import React, { useState, useEffect } from "react";
import {Button} from "@fluentui/react-button";
import {useDarkModeContext} from "./Setup";
import {
    DarkThemeFilled, HomeRegular,
    SettingsRegular,
} from "@fluentui/react-icons";
import {useRouter, usePathname} from "next/navigation";
import { useTranslations } from "next-intl";

const Navbar = ({ locale }: { locale: string }) => {
    const [currentLocale, setCurrentLocale] = useState(locale);
    const {darkMode, setDarkMode} = useDarkModeContext();
    const t = useTranslations("Navbar");
    const router = useRouter();
    const pathname = usePathname()
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = e.target.value;
        setCurrentLocale(newLocale);
        const path = pathname.split("/").slice(2).join("/"); 
        window.location.href = (`/${newLocale}/${path}`); 
    };
    useEffect(() => {
        // Keep the locale in sync with the path
        const currentLocale = pathname.split("/")[1];
        console.log(currentLocale)
        if (currentLocale !== locale) {
            setCurrentLocale(currentLocale);
        }
      }, [pathname]);
    
    return <div className="relative bg-blue-950 h-12">
        <div className="h-full flex items-center px-3 justify-between">

                <div hidden={pathname.startsWith("/settings")}>
                    <Button appearance="transparent"
                            icon={<SettingsRegular className={"transition-all text-white hover:rotate-45"}/>}
                            onClick={() => {
                                location.href = '/settings'
                            }}></Button>
                </div>
                <div hidden={pathname.startsWith("/taskpane") || pathname == "/"}>
                    <Button appearance="transparent"
                            icon={<HomeRegular className={"transition-all text-white"}/>}
                            onClick={() => {
                                location.href = '/taskpane'
                            }}></Button>
                </div>
 
            <div>
                <Button appearance="transparent"
                        icon={darkMode ? <DarkThemeFilled className={"transition-all rotate-180 text-white"}/> :
                            <DarkThemeFilled className={"transition-all rotate-360 text-white"}/>}
                        color="white"
                        onClick={() => setDarkMode(!darkMode)}></Button>
            </div>
            <div>
            <select
        value={currentLocale}
        onChange={handleLanguageChange}
        className={"text-white rounded-md px-4 py-2 bg-transparent hover:outline-none focus:outline-none"}
    
      >
        <option value="en">EN</option>
        <option value="de">DE</option>
      </select>
            </div>
        </div>
    </div>
}

export default Navbar;