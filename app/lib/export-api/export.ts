import { _getAnnotationContentControls, _getAnnotationRange } from "../annotation-api/annotations";

export async function Export() {
    Word.run(async (context) => {
        let res = await helper(context.document.body.getRange(), context);
        Promise.all(res).then((r) => {
            console.log(r);
        });
    });
}

async function helper(range: Word.Range, context: Word.RequestContext): Promise<Promise<string>[]> {
    let ret: Promise<string>[] = [];
    range.load();
    await context.sync();

    const ccs = await _getAnnotationContentControls(context, range);

    console.log("found:", ccs);

    if (ccs.length === 0) {
        const html = range.getHtml();
        await context.sync();

        return [getHTMLBody(html.value)];
    }

    const start = ccs[0];
    start.load();
    await context.sync();

    const pre_range = range.getRange(Word.RangeLocation.start).expandTo(start.getRange(Word.RangeLocation.before));
    pre_range.load();
    await context.sync();

    if (!pre_range.isEmpty) {
        const pre_html = pre_range.getHtml();
        await context.sync();

        ret.push(getHTMLBody(pre_html.value));
    }

    const end_ccs = context.document.contentControls.getByTag(start.tag.replace("_s", "_e"));
    end_ccs.load("items");
    await context.sync();

    const end = end_ccs.items[0];
    end.load();
    await context.sync();

    if (end_ccs.items.length === 0) {
        // TODO loop back
        console.error("End Tag could not be found.");
        return [];
    }

    const aRange = _getAnnotationRange(
        start.getRange(Word.RangeLocation.after),
        end.getRange(Word.RangeLocation.before),
    );

    ret = ret.concat(await helper(aRange, context)); // TODO templating

    const eRange = aRange.getRange(Word.RangeLocation.after).expandTo(range.getRange(Word.RangeLocation.end));
    ret = ret.concat(await helper(eRange, context));

    return ret;
}

async function getHTMLBody(html: string) {
    const parser = new DOMParser();
    return parser.parseFromString(html, "text/html").body.innerHTML.replace(/\n\n/g, "\n");
}

async function getHTMLHead(html: string) {
    const parser = new DOMParser();
    return parser.parseFromString(html, "text/html").head.innerHTML.replace(/\n\n/g, "\n");
}
