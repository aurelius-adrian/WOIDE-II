import Navbar from "@/components/Navbar";
import {webDarkTheme, webLightTheme} from "@fluentui/tokens";
import {FluentProvider} from "@fluentui/react-provider";
import React, {useContext, createContext, useEffect} from "react";

const DarkModeContext = createContext<{
    darkMode: any,
    setDarkMode: any,
}>({
    darkMode: false, setDarkMode: () => {
    }
});

export default function Layout({children}: { children: any }) {

    const [darkMode, setDarkMode] = React.useState(false);
    const [theme, setTheme] = React.useState(webLightTheme);

    useEffect(() => {
        setDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add('dark')
            setTheme(webDarkTheme);
        } else {
            document.documentElement.classList.remove('dark')
            setTheme(webLightTheme);
        }
    }, [darkMode]);

    return (
        <div>
            <DarkModeContext.Provider value={{darkMode, setDarkMode}}>
                <FluentProvider theme={theme}>
                    <Navbar></Navbar>
                    <main className={'bg-light-bg dark:bg-dark-bg p-3'}>{children}</main>
                </FluentProvider>
            </DarkModeContext.Provider>
        </div>
    )
}

export const useDarkModeContext = () => useContext(DarkModeContext);