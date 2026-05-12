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

const defaultExportStyles = `<style data-woide-export-styles="true">
  .woide-body {
    --rustex-text-width: 517.5;
    --rustex-page-width: 921.44238;
    max-width: 42rem;
    margin: 0 auto;
    padding: 2rem 3rem 4rem;
    color: #111;
    font-family: LMRoman10, "Times New Roman", Georgia, serif;
    font-size: 15px;
    line-height: 1.5;
  }

  .woide-body,
  .woide-body section.rustex-contents,
  .woide-body span.rustex-contents[data-ftml-paragraph],
  .woide-body .rustex-paragraph,
  .woide-body h1.rustex-contents,
  .woide-body .woide-item,
  .woide-body .woide-item-label,
  .woide-body .woide-item-body {
    color: #111 !important;
  }

  .woide-body .woide-ref,
  .woide-body .woide-ref *,
  .woide-body .ftml-comp,
  .woide-body .ftml-comp * {
    color: #3f7ae0 !important;
  }

  .woide-body section.rustex-contents,
  .woide-body div.rustex-contents,
  .woide-body span.rustex-contents[data-ftml-paragraph],
  .woide-body .rustex-paragraph,
  .woide-body .woide-enumerate,
  .woide-body .woide-itemize,
  .woide-body .woide-item,
  .woide-body .woide-footnote-body {
    display: block;
  }

  .woide-body section.rustex-contents > h1.rustex-contents {
    display: block;
    margin: 0 0 0.85rem 0;
    font-size: 2rem;
    font-weight: 700;
    line-height: 1.1;
  }

  .woide-body span.rustex-contents[data-ftml-paragraph] h1.rustex-contents {
    display: inline;
    margin: 0;
    font-size: 1em;
    font-weight: 700;
    line-height: inherit;
  }

  .woide-body span.rustex-contents[data-ftml-paragraph] h1.rustex-contents::after {
    content: " ";
  }

  .woide-body span.rustex-contents,
  .woide-body .ftml-def-comp,
  .woide-body .ftml-comp,
  .woide-body .woide-ref,
  .woide-body .woide-module,
  .woide-body .woide-module-import,
  .woide-body .OutlineGroup,
  .woide-body .OutlineElement,
  .woide-body .ParaWrappingDiv,
  .woide-body .Paragraph,
  .woide-body .TextRun,
  .woide-body .NormalTextRun,
  .woide-body .LineBreakBlob {
    display: inline;
    vertical-align: baseline;
  }

  .woide-body .Paragraph {
    margin: 0;
  }

  .woide-body h1.rustex-contents {
    font-family: inherit;
  }

  .woide-body .rustex-paragraph {
    margin: 0 0 0.75rem 0;
  }

  .woide-body section.rustex-contents + section.rustex-contents {
    margin-top: 2rem;
  }

  .woide-body .woide-enumerate,
  .woide-body .woide-itemize {
    margin: 0.5rem 0 0.75rem 1.5rem;
    padding-left: 0;
  }

  .woide-body .woide-item {
    display: block;
    margin: 0 0 0.4rem 0 !important;
  }

  .woide-body .woide-item-label {
    display: inline !important;
    min-width: 0;
    margin-right: 0.35rem;
    vertical-align: baseline;
    color: #111 !important;
  }

  .woide-body .woide-item-body {
    display: inline !important;
    vertical-align: baseline;
    white-space: normal;
  }

  .woide-body .woide-enumerate .woide-enumerate,
  .woide-body .woide-enumerate .woide-itemize,
  .woide-body .woide-itemize .woide-enumerate,
  .woide-body .woide-itemize .woide-itemize {
    margin-top: 0.25rem;
    margin-left: 2rem;
  }

  .woide-body .woide-footnote-body {
    margin-top: 0.75rem !important;
    padding-top: 0.5rem;
    border-top: 1px solid #999;
    font-size: 0.85em !important;
  }

  .woide-body .rustex-contents[data-ftml-paragraph] .LineBreakBlob br {
    display: none;
  }

  .woide-body .woide-module-import {
    display: none !important;
  }

  .woide-body .EOP,
  .woide-body .WACImageGroupContainer,
  .woide-body .EmptyTextRun {
    display: none !important;
  }
</style>`;

const documentHTMLExportTemplate = `<!DOCTYPE html><html lang="en">
    <head>
        <meta charset="UTF-8" />
        {{{getHTMLHead}}}
        <script src="https://mathhub.info/ftml.js"></script>
        ${defaultExportStyles}
    </head>
    <body class="woide-body rustex-body">
        <span class="rustex-contents" data-ftml-document-kind="fragment" style="display:none;"></span>
        {{{getInnerHTML}}}
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
            )[layer] ?? documentHTMLExportTemplate;

        Object.keys(annotationExportData).forEach((key) => delete annotationExportData[key]);
        (await getDocumentSetting<AnnotationType[]>("annotationTypes"))?.forEach((e) => {
            if (!e.id) return;
            annotationExportData[e.id] = e.exportData;
        });

        const data: {
            getHTMLHead?: string;
            getInnerHTML?: string;
            getChildrenEval?: string;
        } = {};

        if (documentExportTemplate.includes("getHTMLHead")) {
            const documentHTML = context.document.body.getRange().getHtml();
            await context.sync();

            data.getHTMLHead = await getHTMLHead(documentHTML.value);
        }

        if (documentExportTemplate.includes("getInnerHTML")) {
            const res = await Promise.all(await helper(context.document.body.getRange(), layer, context));
            data.getInnerHTML = res.join("\n");
        }

        if (documentExportTemplate.includes("getChildrenEval")) {
            const res = await Promise.all(await helper(context.document.body.getRange(), layer, context, true));
            data.getChildrenEval = res.join("\n");
        }

        const rendered = Mustache.render(documentExportTemplate, data);
        return ensureDefaultStylesInHtml(cleanExportedHtml(rendered));
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

function cleanExportedHtml(html: string): string {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");

    document.querySelectorAll(".EOP, .WACImageGroupContainer, .EmptyTextRun").forEach((node) => node.remove());

    document.querySelectorAll(".LineBreakBlob").forEach((node) => {
        const replacement = document.createTextNode(" ");
        node.replaceWith(replacement);
    });

    unwrapElements(document, ".OutlineGroup, .OutlineElement, .ParaWrappingDiv, .Paragraph, .TextRun, .NormalTextRun");

    document.querySelectorAll("[style]").forEach((node) => {
        if (
            node.matches(
                ".woide-footnote-ref, .woide-footnote-body, [data-woide-export-styles], .rustex-contents[data-ftml-document-kind], .normref-wrapper, .normref-wrapper *, .woide-normref, .woide-normref *",
            )
        ) {
            return;
        }
        node.removeAttribute("style");
    });

    document.querySelectorAll("[xml\\:lang], [lang], [paraid], [paraeid], [data-contrast]").forEach((node) => {
        node.removeAttribute("xml:lang");
        node.removeAttribute("lang");
        node.removeAttribute("paraid");
        node.removeAttribute("paraeid");
        node.removeAttribute("data-contrast");
    });

    removeEmptyNonSemanticNodes(document.body);
    removePunctuationOnlyNodes(document.body);

    return document.documentElement.outerHTML;
}

function unwrapElements(document: Document, selector: string) {
    document.querySelectorAll(selector).forEach((node) => {
        const parent = node.parentNode;
        if (!parent) return;

        while (node.firstChild) {
            parent.insertBefore(node.firstChild, node);
        }
        parent.removeChild(node);
    });
}

function removeEmptyNonSemanticNodes(root: ParentNode) {
    root.querySelectorAll("*").forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.children.length > 0) return;
        if (node.hasAttributes()) {
            const attributeNames = node.getAttributeNames();
            const onlyClassAttribute = attributeNames.length === 1 && attributeNames[0] === "class";
            if (!onlyClassAttribute) return;
        }

        if ((node.textContent ?? "").trim() === "") {
            node.remove();
        }
    });
}

function removePunctuationOnlyNodes(root: ParentNode) {
    root.querySelectorAll("*").forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.querySelector("[data-ftml-term], [data-ftml-title], [data-ftml-paragraph], [data-ftml-section], [data-ftml-item], [data-ftml-itemize], [data-ftml-enumerate], [data-ftml-footnote]")) {
            return;
        }

        const text = (node.textContent ?? "").replace(/\u00a0/g, " ").trim();
        if (text === "." || text === "," || text === ";") {
            node.remove();
        }
    });
}

function ensureDefaultStylesInHtml(html: string): string {
    const exportStylesRegex = /<style\b[^>]*data-woide-export-styles=(["'])true\1[^>]*>[\s\S]*?<\/style>/i;

    if (exportStylesRegex.test(html)) {
        return html.replace(exportStylesRegex, defaultExportStyles);
    }

    if (/<\/head>/i.test(html)) {
        return html.replace(/<\/head>/i, `${defaultExportStyles}\n</head>`);
    }

    return `${defaultExportStyles}\n${html}`;
}
