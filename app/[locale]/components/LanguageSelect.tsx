"use client";
import React from "react";

interface LanguageSelectProps {
    locale: string;
    setLocale: (locale: string) => void;
    white?: boolean;
    long?: boolean;
}

const LanguageSelect: React.FC<LanguageSelectProps> = ({ locale, setLocale, white, long }) => {
    return (
        <div className="flex items-center space-x-2">
            <span
                className={`cursor-pointer hover:text-blue-500 
                ${locale === "en" ? "font-bold" : ""} 
                ${white ? "text-white" : ""}`}
                onClick={() => setLocale("en")}
            >
                {long ? "English" : "En"}
            </span>
            <span className="text-gray-400">|</span>
            <span
                className={`cursor-pointer hover:text-blue-500 
                ${locale === "de" ? "font-bold" : ""} 
                ${white ? "text-white" : ""}`}
                onClick={() => setLocale("de")}
            >
                {long ? "Deutsch" : "De"}
            </span>
        </div>
    );
};

export default LanguageSelect;
