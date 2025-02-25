"use client";

import { useEffect, useState } from "react";
import { getDocumentSetting, setDocumentSetting } from "../lib/settings-api/settings";

const FORM_KEY = "annotationSettings";

const demoData = [
    {
        id: "id 0",
        name: "Test",
        formDescription: [
            {
                type: "textInput",
                label: "Text 1 Label",
                id: "id0",
            },
            {
                type: "textInput",
                label: "Text 2 Label",
                id: "id1",
            },
            {
                type: "select",
                label: "Select Label",
                id: "id2",
                options: [
                    { value: "value0", label: "Option 1" },
                    { value: "value1", label: "Option 2" },
                ],
            },
        ],
    },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saveAndLoadSettings = async () => {
            try {
                await setDocumentSetting(FORM_KEY, demoData);
                console.log("Settings saved!");

                const savedSettings = await getDocumentSetting(FORM_KEY);
                console.log(savedSettings)
                setSettings(savedSettings);
                
            } catch (error) {
                console.error("Error handling settings:", error);
            } finally {
                setLoading(false);
            }
        };

        // Ensure Word is initialized before running API calls
        setTimeout(()=> {
            saveAndLoadSettings();
         }
         ,200);
            
        
    }, []);

    return (
        <div>
            <h1>Settings</h1>
            {loading ? (
                <p>Loading settings...</p>
            ) : settings ? (
                <pre>{JSON.stringify(settings, null, 2)}</pre>
            ) : (
                <p>No settings found.</p>
            )}
        </div>
    );
}
