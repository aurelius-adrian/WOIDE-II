import { AnnotationType } from "../utils/annotations";

let lazyData: Record<string, any> = {};

/**
 * Saves data in Word document settings.
 * @param key - The settings key
 * @param value - The data to store (must be serializable)
 */
export async function setDocumentSetting<T>(key: string, value: T): Promise<void> {
    if (typeof window === "undefined" || !window.Office || !window.Word) {
        throw new Error("Word API is not available. Run this inside Microsoft Word.");
    }

    try {
        await Word.run(async (context) => {
            const settings = context.document.settings;
            settings.add(key, JSON.stringify(value));
            await context.sync();
            lazyData[key] = value;
        });
    } catch (error) {
        throw new Error(`Failed to save setting: ${(error as Error).message}`);
    }
}

/**
 * Retrieves stored data from Word document settings.
 * @param key - The settings key
 * @returns The stored data or `null` if not found
 */
export async function getDocumentSetting<T>(key: string): Promise<T | null> {
    if (typeof window === "undefined" || !window.Office || !window.Word) {
        throw new Error("Word API is not available. Run this inside Microsoft Word.");
    }

    if (lazyData[key]) {
        return lazyData[key];
    }

    try {
        return await Word.run(async (context) => {
            const settings = context.document.settings;
            const setting = settings.getItemOrNullObject(key);
            setting.load("value");
            await context.sync();

            const value = setting.isNullObject ? null : JSON.parse(setting.value);
            lazyData[key] = value;
            return value;
        });
    } catch (error) {
        throw new Error(`Failed to retrieve setting: ${(error as Error).message}`);
    }
}

/**
 * Retrieves all stored settings from the Word document.
 * @returns An object containing all settings as key-value pairs.
 */
export async function getAllDocumentSettings(): Promise<Record<string, any>> {
    if (typeof window === "undefined" || !window.Office || !window.Word) {
        throw new Error("Word API is not available. Run this inside Microsoft Word.");
    }

    try {
        return await Word.run(async (context) => {
            const settings = context.document.settings;
            settings.load("items");
            await context.sync();

            const allSettings: Record<string, any> = {};
            settings.items.forEach((setting) => {
                try {
                    allSettings[setting.key] = JSON.parse(setting.value); // Deserialize JSON if possible
                } catch {
                    allSettings[setting.key] = setting.value; // Use raw value if parsing fails
                }
            });

            return allSettings;
        });
    } catch (error) {
        throw new Error(`Failed to retrieve all settings: ${(error as Error).message}`);
    }
}

export const getAllExportLayers = async (): Promise<string[]> => {
    const ret: Set<string> = new Set<string>();

    (await getDocumentSetting<AnnotationType[]>("annotationTypes"))?.forEach((e) => {
        if (e.exportData) {
            Object.keys(e.exportData).forEach((e) => {
                ret.add(e);
            });
        }
    });

    return [...ret];
};

export async function getAnnotationTypesAsDict(): Promise<Record<string, AnnotationType>> {
    const types = await getDocumentSetting<AnnotationType[]>("annotationTypes");
    if (!types) return {};

    const ret: Record<string, AnnotationType> = {};
    types.forEach((e) => {
        if (!e.id) return;
        ret[e.id] = e;
    });

    return ret;
}
