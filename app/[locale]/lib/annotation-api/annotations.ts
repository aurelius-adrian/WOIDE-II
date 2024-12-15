import {v4} from "uuid"
import {Annotation, AnnotationProperties} from "./types";

const _randomHexColor = () => {
    const hexChars = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += hexChars[Math.floor(Math.random() * 16)];
    }
    return color;
}

export const getAnnotations = async () => {
    await Word.run(async (context) => {

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

        cc_s.insertText(props.startSymbol ?? ">", Word.InsertLocation.replace);
        cc_s.appearance = Word.ContentControlAppearance.hidden;
        cc_s.title = ret.id + '_s';
        cc_s.font.color = color;
        cc_s.font.bold = true;
        cc_s.cannotEdit = true;

        cc_e.insertText(props.endSymbol ?? "<", Word.InsertLocation.replace);
        cc_e.appearance = Word.ContentControlAppearance.hidden;
        cc_e.title = ret.id + '_e';
        cc_e.font.color = color;
        cc_e.font.bold = true;
        cc_e.cannotEdit = true;



        // context.document.properties.customProperties.add("")

        start.select(Word.SelectionMode.start);
        await context.sync();


    });

    return ret;
}

export const _getAnnotationRange = (start: Word.Range, end: Word.Range): Word.Range => {
    return start.expandTo(end);
}