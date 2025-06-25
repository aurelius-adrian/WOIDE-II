import { _getAnnotationRange, idSalt } from "./annotations";
import { Annotation } from "./types";

export const highlightAnnotationID = async (a: Annotation | string) => {
    const id = typeof a === "string" ? a : a.id;

    await Word.run(async (context) => {
        const start = context.document.contentControls.getByTag(idSalt + "_s" + id);
        const end = context.document.contentControls.getByTag(idSalt + "_e" + id);
        start.load("text");
        end.load("text");
        await context.sync();

        if (start.items.length === 0) return;

        start.items[0].select();
        const aRange = _getAnnotationRange(start.items[0].getRange(), end.items[0].getRange());
        aRange.highlight();
    });
};

export const removeHighlightAnnotationID = async (a: Annotation | string) => {
    const id = typeof a === "string" ? a : a.id;

    await Word.run(async (context) => {
        const start = context.document.contentControls.getByTag(idSalt + "_s" + id);
        const end = context.document.contentControls.getByTag(idSalt + "_e" + id);
        start.load("text");
        end.load("text");
        await context.sync();

        if (start.items.length === 0) return;

        start.items[0].select();
        const aRange = _getAnnotationRange(start.items[0].getRange(), end.items[0].getRange());
        aRange.removeHighlight();
    });
};

export const timedHighlightAnnotationID = (a: Annotation | string, timeout: number) => {
    highlightAnnotationID(a);
    setTimeout(() => {
        removeHighlightAnnotationID(a);
    }, timeout);
};

export const getAnnotationTextByID = async (a: Annotation | string): Promise<string | null> => {
    const id = typeof a === "string" ? a : a.id;

    return await Word.run(async (context) => {
        const start = context.document.contentControls.getByTag(idSalt + "_s" + id);
        const end = context.document.contentControls.getByTag(idSalt + "_e" + id);

        start.load("items");
        end.load("items");

        await context.sync();

        if (start.items.length === 0 || end.items.length === 0) {
            console.warn("No content controls found for annotation:", id);
            return null;
        }

        const startRange = start.items[0].getRange();
        const endRange = end.items[0].getRange();

        const annotationRange = _getAnnotationRange(startRange, endRange);
        annotationRange.load("text");

        await context.sync();

        return annotationRange.text;
    });
};
