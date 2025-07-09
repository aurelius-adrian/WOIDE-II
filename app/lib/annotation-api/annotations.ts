import { v4 } from "uuid";
import { Annotation, AnnotationProperties } from "./types";
import { getDocumentSetting } from "../settings-api/settings";

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
            return {
                id: e.tag.slice(idSalt.length + 2),
                data: e.title,
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
            return {
                id: e.tag.slice(idSalt.length + 2),
                data: e.title,
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

        start.insertText(" ", Word.InsertLocation.after);
        const startSymbolRange = start.insertText(startSymbol, Word.InsertLocation.replace);
        const cc_s = startSymbolRange.insertContentControl();
        cc_s.appearance = Word.ContentControlAppearance.hidden;
        cc_s.tag = idSalt + "_s" + ret.id;
        cc_s.title = props.data ?? "";
        cc_s.font.color = color;
        cc_s.font.bold = true;
        cc_s.cannotEdit = true;

        end.insertText(" ", Word.InsertLocation.before);
        const endSymbolRange = end.insertText(endSymbol, Word.InsertLocation.replace);
        const cc_e = endSymbolRange.insertContentControl();
        cc_e.cannotEdit = false;
        cc_e.appearance = Word.ContentControlAppearance.hidden;
        cc_e.tag = idSalt + "_e" + ret.id;
        cc_e.font.color = color;
        cc_e.font.bold = true;
        cc_e.cannotEdit = true;

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

        const toUpdate = contentControls.items.filter((cc) => cc.tag === `${idSalt}_s${AnnotationToUpdateID}`);
        toUpdate[0].cannotEdit = false;
        toUpdate[0].title = props.data ?? "";
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
