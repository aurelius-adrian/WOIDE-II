"use client";

import { useEffect, useState } from "react";
import { getAllDocumentSettings, setDocumentSetting } from "../lib/settings-api/settings";

const FORM_KEY = "annotationSettings";
const FORM_KEY2 = "textSettings";
const FORM_KEY3 = "numberSettings";
const FORM_KEY4 = "moreSettings";

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

const demoData2 = [
    {
        id: "id_6",
        name: "Advanced Settings",
        formDescription: [
            {
                type: "group",
                label: "Network Configuration",
                id: "network",
                fields: [
                    {
                        type: "textInput",
                        label: "IP Address",
                        id: "ip_address",
                    },
                    {
                        type: "number",
                        label: "Port",
                        id: "port",
                        value: 8080,
                    },
                ],
            },
            {
                type: "group",
                label: "User Permissions",
                id: "permissions",
                fields: [
                    {
                        type: "checkbox",
                        label: "Admin Access",
                        id: "admin_access",
                    },
                    {
                        type: "checkbox",
                        label: "Read-Only Mode",
                        id: "read_only",
                    },
                ],
            },
        ],
    },
];

export default function SettingsPage() {
    const [settings, setSettings] = useState<Record<string, any> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saveAndLoadSettings = async () => {
            try {
                await setDocumentSetting(FORM_KEY, demoData);
                await setDocumentSetting(FORM_KEY2, "testing");
                await setDocumentSetting(FORM_KEY3, 222222);
                await setDocumentSetting(FORM_KEY4, demoData2);
                console.log("Settings saved!");

                // Fetch all settings instead of just one
                const allSettings = await getAllDocumentSettings();
                setSettings(allSettings);
            } catch (error) {
                console.error("Error handling settings:", error);
            } finally {
                setLoading(false);
            }
        };

        // Ensure Word is initialized before running API calls
        setTimeout(() => {
            saveAndLoadSettings();
        }, 200);
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
