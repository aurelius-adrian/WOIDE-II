import React from "react";
import {Button} from "@fluentui/react-button";
import {Select} from "@fluentui/react-select";
import {useId} from "@fluentui/react-utilities";
import {useDarkModeContext} from "./Setup";
import {
    DarkThemeFilled, HomeRegular,
    SettingsRegular,
} from "@fluentui/react-icons";
import { usePathname} from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

const Navbar = () => {
    const locale = useLocale(); 
    const {darkMode, setDarkMode} = useDarkModeContext();
    const selectId = useId();
    const t = useTranslations("Navbar");
    const pathname = usePathname()
    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newLocale = e.target.value;
        const path = pathname.split("/").slice(2).join("/");
        window.location.href = (`/${newLocale}/${path}`);
    };
    
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
            <Select id={selectId} 
        value={locale}
        onChange={handleLanguageChange}
        className={"text-white rounded-md py-2 bg-transparent focus:ring-0 focus:outline-none border-none appearance-none"} 
      >
        <option value="en">EN</option>
        <option value="de">DE</option>
      </Select>
            </div>
        </div>
    </div>
}

export default Navbar;