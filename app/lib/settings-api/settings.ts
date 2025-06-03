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

    try {
        return await Word.run(async (context) => {
            const settings = context.document.settings;
            const setting = settings.getItemOrNullObject(key);
            setting.load("value");
            await context.sync();

            return setting.isNullObject ? null : JSON.parse(setting.value);
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
