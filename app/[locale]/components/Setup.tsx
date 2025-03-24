"use client";
import Navbar from "./Navbar";
import { webDarkTheme, webLightTheme } from "@fluentui/tokens";
import { FluentProvider } from "@fluentui/react-provider";
import React, { useContext, createContext, useEffect } from "react";
import Script from "next/script";
import Loading from "../loading";

const DarkModeContext = createContext<{
  darkMode: any;
  setDarkMode: any;
}>({
  darkMode: false,
  setDarkMode: () => {},
});

export default function Setup({ children }: { children: any }) {
  const [darkMode, setDarkMode] = React.useState(false);
  const [theme, setTheme] = React.useState(webLightTheme);
  const [isOfficeJsLoaded, setIsOfficeJsLoaded] = React.useState(false);

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
      console.log("WOIDE II initialized Office JS");
      window.history.replaceState = function () {};
      setIsOfficeJsLoaded(true);
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
        onError={() => console.error("Failed to load Office.js")}
      ></Script>
      {isOfficeJsLoaded ? (
        <DarkModeContext.Provider value={{ darkMode, setDarkMode }}>
          <FluentProvider theme={theme}>
            <nav>
              <Navbar></Navbar>
            </nav>
            <main className={"bg-light-bg dark:bg-dark-bg p-3"}>
              {children}
            </main>
          </FluentProvider>
        </DarkModeContext.Provider>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export const useDarkModeContext = () => useContext(DarkModeContext);
