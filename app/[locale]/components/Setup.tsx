"use client";
import { webDarkTheme, webLightTheme } from "@fluentui/tokens";
import { FluentProvider } from "@fluentui/react-provider";
import React, { createContext, useContext, useEffect } from "react";
import Script from "next/script";
import { SnackbarProvider } from "notistack";

const DarkModeContext = createContext<{
    darkMode: any;
    setDarkMode: any;
}>({
    darkMode: false,
    setDarkMode: () => {},
});

const OfficeReadyContext = createContext<boolean>(false);

export default function Setup({ children }: { children: any }) {
    const [darkMode, setDarkMode] = React.useState(false);
    const [theme, setTheme] = React.useState(webLightTheme);

    const [officeReady, setOfficeReady] = React.useState(false);

    useEffect(() => {
        setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }, []);

    useEffect(() => {
        if (darkMode) {
            document.documentElement.classList.add("dark");
            setTheme(webDarkTheme);
        } else {
            document.documentElement.classList.remove("dark");
            setTheme(webLightTheme);
        }
    }, [darkMode]);

    const initOfficeJS = async () => {
        window.Office.onReady(() => {
            console.debug("WOIDE II initialized Office JS");
            setOfficeReady(true);
            window.history.replaceState = function () {};
        });

        Office.actions.associate("ShowTaskpane", () => {
            return Office.addin
                .showAsTaskpane()
                .then(() => {
                    return;
                })
                .catch((error) => {
                    return error.code;
                });
        });

        Office.actions.associate("HideTaskpane", () => {
            return Office.addin
                .hide()
                .then(() => {
                    return;
                })
                .catch((error) => {
                    return error.code;
                });
        });
    };

    return (
        <div>
            <Script
                type="text/javascript"
                src="https://appsforoffice.microsoft.com/lib/1/hosted/office.js"
                onLoad={initOfficeJS}
                onError={console.error}
            />
            <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
                <SnackbarProvider>
                    <OfficeReadyContext.Provider value={officeReady}>
                        <FluentProvider theme={theme}>
                            <main className={"bg-light-bg dark:bg-dark-bg p-3"}>{children}</main>
                        </FluentProvider>
                    </OfficeReadyContext.Provider>
                </SnackbarProvider>
            </DarkModeContext.Provider>
        </div>
    );
}

export const useDarkModeContext = () => useContext(DarkModeContext);
export const useOfficeReady = () => useContext(OfficeReadyContext);
