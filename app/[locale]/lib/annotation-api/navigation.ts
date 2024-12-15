import {_getAnnotationRange, Annotation} from "./annotations";

export const highlightAnnotationID = async (a: Annotation) => {
    await Word.run(async (context) => {
        const start = context.document.contentControls.getByTitle(a.annotationId + '_s');
        const end = context.document.contentControls.getByTitle(a.annotationId + '_e');
        start.load('text');
        end.load('text');
        await context.sync();

        if (start.items.length == 0 ) return

        start.items[0].select();
        let aRange = _getAnnotationRange(start.items[0].getRange(), end.items[0].getRange());
        aRange.highlight();
    });
}