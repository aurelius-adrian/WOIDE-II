import { _getAnnotationContentControls, _getAnnotationRange } from "../annotation-api/annotations";
import { Annotation } from "../annotation-api/types";
import { getDocumentSetting } from "../settings-api/settings";
import { AnnotationType } from "../utils/annotations";
import { enqueueSnackbar } from "notistack";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mustache = require("mustache");

const annotationExportData: Record<
    string,
    {
        [p: string]: string;
    }
> = {};

let globalDocumentData: any = {};

const documentHTMLExportTemplate = `<html>
    <head>
        {{{HTMLHead}}}
    </head>
    <body>
        {{{HTMLBody}}}
    </body>
</html>`;

export function getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, "-");
}

export function saveStringToFile(data: string, filename: string, type = "text/plain"): void {
    const blob = new Blob([data], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    enqueueSnackbar({
        message: `Exported ${filename}`,
        variant: "success",
        autoHideDuration: 2500,
    });
}

export async function Export(layer: string): Promise<string> {
    return await Word.run(async (context) => {
        globalDocumentData = (await getDocumentSetting("globalDocumentData")) ?? {};

        const documentExportTemplate =
            (
                ((await getDocumentSetting("documentExportSettings")) ?? {}) as {
                    [key: string]: string;
                }
            )[layer] ?? "{{{getInnerHTML}}}";

        (await getDocumentSetting<AnnotationType[]>("annotationTypes"))?.forEach((e) => {
            if (!e.id) return;
            annotationExportData[e.id] = e.exportData;
        });

        const data: { getInnerHTML?: string; getChildrenEval?: string } = {};

        if (documentExportTemplate.includes("getInnerHTML")) {
            const res = await Promise.all(await helper(context.document.body.getRange(), layer, context));
            const documentHTML = context.document.body.getRange().getHtml();
            await context.sync();

            data.getInnerHTML = Mustache.render(documentHTMLExportTemplate, {
                HTMLHead: await getHTMLHead(documentHTML.value),
                HTMLBody: res.join("\n"),
            });
        }

        if (documentExportTemplate.includes("getChildrenEval")) {
            const res = await Promise.all(await helper(context.document.body.getRange(), layer, context, true));
            data.getChildrenEval = res.join("\n");
        }

        return Mustache.render(documentExportTemplate, data);
    });
}

async function helper(
    range: Word.Range,
    layer: string,
    context: Word.RequestContext,
    withoutHTML = false,
): Promise<Promise<string>[]> {
    let ret: Promise<string>[] = [];
    range.load();
    await context.sync();

    console.log("for range", range.text, range);

    if (range.text === "") return ret;

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
            break;
        } catch (e) {
            console.error("error with parsing annotation data during layer export: \n", e);
        }
    }

    if (annotation?.end) {
        const _range = annotation?.end.getRange();
        _range.load();
        await context.sync();

        const _res = range.compareLocationWith(_range);
        await context.sync();

        if (
            _res.value !== Word.LocationRelation.contains &&
            _res.value !== Word.LocationRelation.containsStart &&
            _res.value !== Word.LocationRelation.containsEnd &&
            _res.value !== Word.LocationRelation.equal
        ) {
            console.log("compareLocationWith", _res.value);
            annotation = undefined;
        }
    }

    if (!annotation) {
        if (withoutHTML) return [];

        const html = range.getHtml();
        await context.sync();

        return [getHTMLBody(html.value)];
    }

    const pre_range = range
        .getRange(Word.RangeLocation.start)
        .expandTo(annotation.start.getRange(Word.RangeLocation.before));
    ret = (await helper(pre_range, layer, context, withoutHTML)).concat(ret);

    const aRange = _getAnnotationRange(
        annotation.start.getRange(Word.RangeLocation.after),
        annotation.end.getRange(Word.RangeLocation.before),
    );

    const data: any & {
        getInnerHTML?: string;
        getChildrenEval?: string;
    } = { ...globalDocumentData, ...annotation.data.data };
    const template = annotationExportData[annotation.data.annotationTypeId][layer];

    if (template.includes("getInnerHTML")) {
        const res = await Promise.all(await helper(aRange, layer, context, false));
        data.getInnerHTML = res.join("\n");
    }

    if (annotationExportData[annotation.data.annotationTypeId][layer].includes("getChildrenEval")) {
        const res = await Promise.all(await helper(aRange, layer, context, true));
        data.getChildrenEval = res.join("\n");
    }

    ret = ret.concat(Mustache.render(template, data));

    const eRange = annotation.end.getRange(Word.RangeLocation.after).expandTo(range.getRange(Word.RangeLocation.end));
    ret = ret.concat(await helper(eRange, layer, context, withoutHTML));

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
