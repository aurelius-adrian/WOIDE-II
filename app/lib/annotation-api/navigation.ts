import {_getAnnotationRange, idSalt} from "./annotations";
import {Annotation} from "./types";

export const highlightAnnotationID = async (a: Annotation) => {
    await Word.run(async (context) => {
        const start = context.document.contentControls.getByTitle(idSalt + '_s' + a.id);
        const end = context.document.contentControls.getByTitle(idSalt + '_e' + a.id);
        start.load('text');
        end.load('text');
        await context.sync();

        if (start.items.length == 0 ) return

        start.items[0].select();
        let aRange = _getAnnotationRange(start.items[0].getRange(), end.items[0].getRange());
        aRange.highlight();
    });
}

export const removeHighlightAnnotationID = async (a: Annotation) => {
    await Word.run(async (context) => {
        const start = context.document.contentControls.getByTitle(idSalt + '_s' + a.id);
        const end = context.document.contentControls.getByTitle(idSalt + '_e' + a.id);
        start.load('text');
        end.load('text');
        await context.sync();

        if (start.items.length == 0 ) return

        start.items[0].select();
        let aRange = _getAnnotationRange(start.items[0].getRange(), end.items[0].getRange());
        aRange.removeHighlight();
    });
}