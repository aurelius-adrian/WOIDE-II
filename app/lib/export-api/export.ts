import { _getAnnotationContentControls, _getAnnotationRange } from "../annotation-api/annotations";
import { Annotation } from "../annotation-api/types";
import { getDocumentSetting } from "../settings-api/settings";
import { AnnotationType } from "../utils/annotations";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mustache = require("mustache");

const annotationExportData: Record<
    string,
    {
        [p: string]: string;
    }
> = {};

export async function Export(layer: string) {
    Word.run(async (context) => {
        (await getDocumentSetting<AnnotationType[]>("annotationTypes"))?.forEach((e) => {
            if (!e.id) return;
            annotationExportData[e.id] = e.exportData;
        });

        const res = await helper(context.document.body.getRange(), layer, context);
        Promise.all(res).then((r) => {
            console.log(r.join("\n"));
        });
    });
}

async function helper(range: Word.Range, layer: string, context: Word.RequestContext): Promise<Promise<string>[]> {
    let ret: Promise<string>[] = [];
    range.load();
    await context.sync();

    const ccs = await _getAnnotationContentControls(context, range);

    let annotation:
        | {
              start: Word.ContentControl;
              end: Word.ContentControl;
              data: Annotation;
          }
        | undefined = undefined;

    for (const start of ccs) {
        try {
            start.load();
            await context.sync();
            if (start.title === undefined) continue;
            const data = JSON.parse(start.title) as Annotation;
            if (!annotationExportData[data.annotationTypeId][layer]) continue;

            const end = await getAnnotationClosingTag(start, context);
            if (!end) continue;

            annotation = {
                start,
                end,
                data,
            };
        } catch (e) {
            console.error("error with parsing annotation data during layer export: \n", e);
        }
    }

    if (!annotation) {
        const html = range.getHtml();
        await context.sync();

        return [getHTMLBody(html.value)];
    }

    const pre_range = range
        .getRange(Word.RangeLocation.start)
        .expandTo(annotation.start.getRange(Word.RangeLocation.before));
    ret = (await helper(pre_range, layer, context)).concat(ret);

    const aRange = _getAnnotationRange(
        annotation.start.getRange(Word.RangeLocation.after),
        annotation.end.getRange(Word.RangeLocation.before),
    );

    const data: Annotation & { getInnerHTML?: string } = { ...annotation.data };
    const template = annotationExportData[data.annotationTypeId][layer];

    if (template.includes("getInnerHTML")) {
        const res = await Promise.all(await helper(aRange, layer, context));
        data.getInnerHTML = res.join("\n");
    }

    // if (annotationExportData[data.annotationTypeId][layer].includes("getChildrenEval")) { TODO
    //     const res = await Promise.all(await helper(aRange, layer, context));
    //     data.getInnerHTML = res.join("\n");
    // }

    ret = ret.concat(Mustache.render(template, data));

    const eRange = aRange.getRange(Word.RangeLocation.after).expandTo(range.getRange(Word.RangeLocation.end));
    ret = ret.concat(await helper(eRange, layer, context));

    return ret;
}

async function getAnnotationClosingTag(
    start: Word.ContentControl,
    context: Word.RequestContext,
): Promise<Word.ContentControl | undefined> {
    const end_ccs = context.document.contentControls.getByTag(start.tag.replace("_s", "_e"));
    end_ccs.load("items");
    await context.sync();

    if (end_ccs.items.length !== 1) return undefined;

    const end = end_ccs.items[0];
    end.load();
    await context.sync();

    return end;
}

async function getHTMLBody(html: string) {
    const parser = new DOMParser();
    return parser.parseFromString(html, "text/html").body.innerHTML.replace(/\n\n/g, "\n");
}

async function getHTMLHead(html: string) {
    const parser = new DOMParser();
    return parser.parseFromString(html, "text/html").head.innerHTML.replace(/\n\n/g, "\n");
}
