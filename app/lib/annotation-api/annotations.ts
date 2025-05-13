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

export const getAnnotationsInSelection: () => Promise<Annotation[]> = async () => {
    return await Word.run(async (context) => {
        const selection = context.document.getSelection();
        const ccs = selection.contentControls;
        ccs.load();
        await context.sync();
        const list = selection.contentControls.items.filter(e => e.tag && e.tag.includes(idSalt) && e.tag.includes("_s"));
        return list.map(e => {
            return {
                id: e.tag.slice(idSalt.length + 2),
                data: e.title,
                color: e.color,
            } as Annotation;
        })
    });
}

export const getAnnotations: () => Promise<Annotation[]> = async () => {
    return await Word.run(async (context) => {
        const ccs = context.document.contentControls;
        ccs.load();
        await context.sync();
        const list = context.document.contentControls.items.filter(e => e.tag && e.tag.includes(idSalt) && e.tag.includes("_s"));
        return list.map(e => {
            return {
                id: e.tag.slice(idSalt.length + 2),
                data: e.title,
                color: e.color,
            } as Annotation;
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
        cc_s.tag = idSalt + '_s' + ret.id;
        cc_s.title = props.data ?? "";
        cc_s.font.color = color;
        cc_s.font.bold = true;
        cc_s.cannotEdit = true;

        cc_e.insertText(props.endSymbol ?? "❬", Word.InsertLocation.replace);
        cc_e.appearance = Word.ContentControlAppearance.hidden;
        cc_e.tag = idSalt + '_e' + ret.id;
        cc_e.font.color = color;
        cc_e.font.bold = true;
        cc_e.cannotEdit = true;

        start.select(Word.SelectionMode.start);
        await context.sync();
    });

    return ret;
}
export const updateAnnotation = async (AnnotationToUpdateID: string,props: AnnotationProperties = {}): Promise<void> => {

    await Word.run(async (context) => {
        const contentControls = context.document.contentControls;
        contentControls.load();
        await context.sync();
    
        const toUpdate = contentControls.items.filter(cc => 
          cc.tag === `${idSalt}_s${AnnotationToUpdateID}` 
        );
        toUpdate[0].cannotEdit = false;
        toUpdate[0].title = props.data ?? "";
        await context.sync();
        
      });
}

export const _getAnnotationRange = (start: Word.Range, end: Word.Range): Word.Range => {
    return start.expandTo(end);
}

export const deleteAnnotation = async (annotationId: string): Promise<void> => {
    await Word.run(async (context) => {
        
      const contentControls = context.document.contentControls;
      contentControls.load();
      await context.sync();
  
      const toDelete = contentControls.items.filter(cc => 
        cc.tag === `${idSalt}_s${annotationId}` || 
        cc.tag === `${idSalt}_e${annotationId}`
      );

      toDelete.forEach(cc => {
        cc.cannotEdit = false
        cc.insertText("", Word.InsertLocation.replace);
        cc.delete(true); 
      });
      
      await context.sync();
    });
  };
  
  