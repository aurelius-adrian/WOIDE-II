import {Button} from "@fluentui/react-button";
import {useDarkModeContext} from "@/components/Layout";
import {
    bundleIcon,
    DarkThemeFilled,
    CalendarMonthRegular, SettingsRegular,
} from "@fluentui/react-icons";
import {dark} from "@mui/material/styles/createPalette";


const Navbar = () => {
    const {darkMode, setDarkMode} = useDarkModeContext();

    return <div className="relative bg-blue-950 h-12">
        <div className="h-full flex items-center px-3 justify-between">
            <div>
                <Button appearance="transparent"
                        icon={<SettingsRegular className={"transition-all text-white hover:rotate-45"}/>}
                        onClick={() => {
                            location.href = '/settings'
                        }}></Button>
            </div>
            <div>
                <Button appearance="transparent" icon={darkMode ? <DarkThemeFilled className={"transition-all rotate-180 text-white"}/> :
                    <DarkThemeFilled className={"transition-all rotate-360 text-white"}/>}
                        color="white"
                        onClick={() => setDarkMode(!darkMode)}></Button>
            </div>
        </div>
    </div>
}

export default Navbar;