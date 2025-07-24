import { getAnnotationTypesAsDict } from "../settings-api/settings";
import { AnnotationType } from "../utils/annotations";
import { getAnnotations } from "../annotation-api/annotations";
import { getAnnotationTextByID } from "../annotation-api/navigation";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mustache = require("mustache");

export type Glossary = { [term: string]: GlossaryEntry[] };
export type GlossaryEntry = { refTypeId: string; data: Record<string, any> };

export async function GetGlossary(): Promise<Glossary> {
    const types = await getAnnotationTypesAsDict();

    const sniffyTypes = Object.keys(types)
        .filter((key) => types[key].enableSniffy)
        .reduce((res: { [id: string]: AnnotationType }, key) => {
            res[key] = types[key];
            return res;
        }, {});

    const glossary: Glossary = {};

    const annotations = await getAnnotations();
    for (const a of annotations) {
        const type = sniffyTypes[a.annotationTypeId];
        if (type === undefined) continue;

        const text = (await getAnnotationTextByID(a.id))?.replace(/^❭\s|\s❬$/g, "");
        if (!text) {
            console.debug("Could not get text for annotation", a.id);
            continue;
        }

        if (type.referenceDataTemplate === undefined) {
            console.error("Reference data template is undefined for annotation type: ", type.id);
            continue;
        }

        try {
            if (!glossary[text]) glossary[text] = [];

            glossary[text].push({
                refTypeId: type.referenceAnnotationTypeId as string,
                data: JSON.parse(Mustache.render(type.referenceDataTemplate, a.data)),
            });
        } catch (e) {
            console.error("Could not parse glossary entry: ", e);
        }
    }

    return glossary;
}
