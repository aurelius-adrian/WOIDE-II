import {v4} from "uuid"
import {Annotation, AnnotationProperties} from "./types";

export const idSalt = "woideann_"

const _randomHexColor = () => {
    const hexChars = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += hexChars[Math.floor(Math.random() * 16)];
    }
    return color;
}

export const getAnnotations: () => Promise<Annotation[]> = async () => {
    return await Word.run(async (context) => {
        const ccs = context.document.contentControls;
        ccs.load();
        await context.sync();
        const list = context.document.contentControls.items.filter(e => e.title.includes(idSalt) && e.title.includes("_s"));
        console.log(list);
        return list.map(e => {
            return {
                id: e.title.slice(idSalt.length + 2),
                properties: {}
            }
        })
    });
}

export const insertAnnotation = async (props: AnnotationProperties = {}): Promise<Annotation | null> => {
    let ret = null;
    await Word.run(async (context) => {
        const range: Word.Range = context.document.getSelection().getRange().split([], true, false, true).getFirst();

        const start: Word.Range = range.getRange(Word.RangeLocation.start);
        const end: Word.Range = range.getRange(Word.RangeLocation.end);

        let cc_s = start.insertContentControl();
        let cc_e = end.insertContentControl();

        ret = {
            id: v4(),
        };
        let color = props.color ?? _randomHexColor();

        cc_s.insertText(props.startSymbol ?? "❭", Word.InsertLocation.replace);
        cc_s.appearance = Word.ContentControlAppearance.hidden;
        cc_s.title = idSalt + '_s' + ret.id ;
        cc_s.font.color = color;
        cc_s.font.bold = true;
        cc_s.cannotEdit = true;

        cc_e.insertText(props.endSymbol ?? "❬", Word.InsertLocation.replace);
        cc_e.appearance = Word.ContentControlAppearance.hidden;
        cc_e.title = idSalt + '_e' + ret.id;
        cc_e.font.color = color;
        cc_e.font.bold = true;
        cc_e.cannotEdit = true;

        start.select(Word.SelectionMode.start);
        await context.sync();
    });

    return ret;
}

export const _getAnnotationRange = (start: Word.Range, end: Word.Range): Word.Range => {
    return start.expandTo(end);
}