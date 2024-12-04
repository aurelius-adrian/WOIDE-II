import {Button} from "@fluentui/react-button";
import {useDarkModeContext} from "./Setup";
import {
    DarkThemeFilled, HomeRegular,
    SettingsRegular,
} from "@fluentui/react-icons";
import {useRouter, usePathname} from "next/navigation";


const Navbar = () => {
    const {darkMode, setDarkMode} = useDarkModeContext();

    const pathname = usePathname()

    return <div className="relative bg-blue-950 h-12">
        <div className="h-full flex items-center px-3 justify-between">
            <div className={"space-x-2"}>
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
            </div>
            <div>
                <Button appearance="transparent"
                        icon={darkMode ? <DarkThemeFilled className={"transition-all rotate-180 text-white"}/> :
                            <DarkThemeFilled className={"transition-all rotate-360 text-white"}/>}
                        color="white"
                        onClick={() => setDarkMode(!darkMode)}></Button>
            </div>
        </div>
    </div>
}

export default Navbar;