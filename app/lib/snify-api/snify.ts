import { Catalog, ReferenceEntry } from "./catalog";
import { stem } from "porter2";

export type SniffyResult = {
    select: () => Promise<void>;
    text: string;
    possibleAnnotations: ReferenceEntry[];
};

export async function FindMatches(catalog: Catalog): Promise<SniffyResult[]> {
    try {
        return await Word.run(async (context) => {
            const ret: SniffyResult[] = [];

            const doc = context.document.body.getRange(Word.RangeLocation.whole).split([" "], undefined, true);
            doc.load("items");
            await context.sync();

            type cache = { [startIdx: string]: Catalog };
            let cache: cache = {};

            for (let i = 0; i < doc.items.length; i++) {
                let c = doc.items[i].text.toLowerCase().replace("❭", "").replace("❬", "");
                c = stem(c);

                if (c === "") continue;

                const _cache: cache = {};

                const res = catalog[c];
                if (res) {
                    if (res.ancestors && Object.keys(res.ancestors).length !== 0) {
                        _cache[i] = res.ancestors;
                    }

                    if (res.references && res.references.length !== 0) {
                        ret.push({
                            select: async () => {
                                doc.items[i].select();
                                await context.sync();
                            },
                            text: doc.items[i].text,
                            possibleAnnotations: res.references,
                        });
                    }
                }

                //check ancestors
                for (const [idx, a] of Object.entries(cache)) {
                    const _res = a[c];
                    if (_res) {
                        if (_res.ancestors && Object.keys(_res.ancestors).length !== 0) {
                            _cache[idx] = _res.ancestors;
                        }

                        if (_res.references && _res.references.length !== 0) {
                            const _range = doc.items[+idx]
                                .getRange(Word.RangeLocation.start)
                                .expandTo(doc.items[i].getRange(Word.RangeLocation.end));
                            _range.load();
                            await context.sync();

                            ret.push({
                                select: async () => {
                                    doc.items[+idx]
                                        .getRange(Word.RangeLocation.start)
                                        .expandTo(doc.items[i].getRange(Word.RangeLocation.end))
                                        .select();
                                    await context.sync();
                                },
                                text: _range.text,
                                possibleAnnotations: _res.references,
                            });
                        }
                    }
                }

                cache = { ..._cache };
            }

            return ret;
        });
    } catch (error) {
        throw new Error(`Failed to find matches in document: ${(error as Error).message}`);
    }
}
