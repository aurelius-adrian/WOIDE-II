import { Glossary, GlossaryEntry } from "./glossary";

export type SniffyResult = {
    select: () => Promise<void>;
    text: string;
    possibleAnnotations: GlossaryEntry[];
};

const options: Partial<Word.SearchOptions> = {
    matchCase: false,
    matchWholeWord: false,
    matchWildcards: false,
    matchPrefix: false,
    matchSuffix: false,
    ignorePunct: false,
    ignoreSpace: false,
};

export async function FindMatches(glossary: Glossary): Promise<SniffyResult[]> {
    try {
        return await Word.run(async (context) => {
            const ret: SniffyResult[] = [];
            for (const term in glossary) {
                const ranges = context.document.body.search(term, options);
                ranges.load();
                await context.sync();

                for (const range of ranges.items) {
                    range.load();
                    await context.sync();

                    ret.push({
                        select: async () => {
                            range.select();
                            await context.sync();
                        },
                        text: range.text,
                        possibleAnnotations: glossary[term],
                    });
                }

                console.log("found: ", ranges.items);
            }

            return ret;
        });
    } catch (error) {
        throw new Error(`Failed to find matches in document: ${(error as Error).message}`);
    }
}
