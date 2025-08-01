import { v4 } from "uuid";
import { Annotation, AnnotationProperties } from "./types";
import { AnnotationType } from "../utils/annotations";

export const idSalt = "woideann_";

const _randomHexColor = () => {
    const hexChars = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += hexChars[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const getAnnotationsInSelection: () => Promise<Annotation[]> = async () => {
    return await Word.run(async (context) => {
        const selection = context.document.getSelection();
        const ccs = selection.contentControls;
        ccs.load();
        await context.sync();
        const list = selection.contentControls.items.filter(
            (e) => e.tag && e.tag.includes(idSalt) && e.tag.includes("_s"),
        );
        return list.map((e) => {
            const _data = JSON.parse(e.title);

            return {
                id: e.tag.slice(idSalt.length + 2),
                annotationTypeId: _data.annotationTypeId,
                data: _data.data,
                color: e.color,
            } as Annotation;
        });
    });
};

export const getAnnotations: () => Promise<Annotation[]> = async () => {
    return await Word.run(async (context) => {
        const ccs = context.document.contentControls;
        ccs.load();
        await context.sync();
        const list = ccs.items.filter((e) => e.tag && e.tag.includes(idSalt) && e.tag.includes("_s"));
        return list.map((e) => {
            const _data = JSON.parse(e.title);

            return {
                id: e.tag.slice(idSalt.length + 2),
                annotationTypeId: _data.annotationTypeId,
                data: _data.data,
                color: e.color,
            } as Annotation;
        });
    });
};

export const getAnnotationContentControls = async (range?: Word.Range): Promise<Word.ContentControl[]> => {
    return await Word.run(async (context) => {
        return await _getAnnotationContentControls(context, range);
    });
};

export const _getAnnotationContentControls = async (
    context: Word.RequestContext,
    range?: Word.Range,
): Promise<Word.ContentControl[]> => {
    const ccs = range?.contentControls || context.document.contentControls;
    ccs.load("items");
    await context.sync();
    return ccs.items.filter((e) => e.tag && e.tag.includes(idSalt) && e.tag.includes("_s"));
};

export const insertAnnotation = async (props: AnnotationProperties = {}): Promise<Annotation | null> => {
    let ret = null;
    await Word.run(async (context) => {
        const selection = context.document.getSelection();
        const splitRanges = selection.getRange().split([], true, false, true);
        const range = splitRanges.getFirst();

        const start: Word.Range = range.getRange(Word.RangeLocation.start);
        const end: Word.Range = range.getRange(Word.RangeLocation.end);

        ret = {
            id: v4(),
        };

        const color = props.color ?? _randomHexColor();

        const startSymbol = props.startSymbol ?? "❭";
        const endSymbol = props.endSymbol ?? "❬";

        const startSymbolRange = start.insertText(startSymbol, Word.InsertLocation.before);
        const cc_s = startSymbolRange.insertContentControl();
        cc_s.appearance = Word.ContentControlAppearance.hidden;
        cc_s.tag = idSalt + "_s" + ret.id;
        cc_s.title = JSON.stringify({ annotationTypeId: props.annotationTypeId, data: props.data });
        cc_s.color = color;
        cc_s.font.color = color;
        cc_s.font.bold = true;

        const endSymbolRange = end.insertText(endSymbol, Word.InsertLocation.after);
        const cc_e = endSymbolRange.insertContentControl();
        cc_e.appearance = Word.ContentControlAppearance.hidden;
        cc_e.tag = idSalt + "_e" + ret.id;
        cc_e.font.color = color;
        cc_e.font.bold = true;

        start.select(Word.SelectionMode.start);
        await context.sync();
    });

    return ret;
};

export const updateAnnotation = async (
    AnnotationToUpdateID: string,
    props: AnnotationProperties = {},
): Promise<void> => {
    await Word.run(async (context) => {
        const contentControls = context.document.contentControls;
        contentControls.load();
        await context.sync();

        const toUpdateStart = contentControls.items.find((cc) => cc.tag === `${idSalt}_s${AnnotationToUpdateID}`);
        const toUpdateEnd = contentControls.items.find((cc) => cc.tag === `${idSalt}_e${AnnotationToUpdateID}`);

        if (!toUpdateStart || !toUpdateEnd) {
            console.warn(`Could not find annotation with ID: ${AnnotationToUpdateID}`);
            return;
        }
        toUpdateStart.cannotEdit = false;
        toUpdateEnd.cannotEdit = false;

        toUpdateStart.title = JSON.stringify({ annotationTypeId: props.annotationTypeId, data: props.data });

        if (props.color) {
            toUpdateStart.color = props.color;
            toUpdateStart.font.color = props.color;
            toUpdateEnd.font.color = props.color;
        }

        toUpdateStart.cannotEdit = true;
        toUpdateEnd.cannotEdit = true;

        await context.sync();
    });
};

export const _getAnnotationRange = (start: Word.Range, end: Word.Range): Word.Range => {
    return start.expandTo(end);
};

export const deleteAnnotation = async (annotationId: string): Promise<void> => {
    await Word.run(async (context) => {
        const contentControls = context.document.contentControls;
        contentControls.load();
        await context.sync();

        const startCC = contentControls.items.find((cc) => cc.tag === `${idSalt}_s${annotationId}`);
        const endCC = contentControls.items.find((cc) => cc.tag === `${idSalt}_e${annotationId}`);

        if (!startCC || !endCC) return;

        const start = startCC.getRange();
        const end = endCC.getRange();

        start.load("text");
        end.load("text");
        await context.sync();

        startCC.cannotEdit = false;
        startCC.clear();
        startCC.delete(true);

        endCC.cannotEdit = false;
        endCC.clear();
        endCC.delete(true);

        await context.sync();
    });
};

export function getEmptyJSON(a: AnnotationType): any {
    const ret: any = {};
    for (const fe of a.formDescription) {
        switch (fe.type) {
            case "select":
                ret[fe.id] = (fe.options?.map((o) => o.value) ?? []).join(" | ");
                continue;
            default:
                ret[fe.id] = "";
        }
    }
    return ret;
}
