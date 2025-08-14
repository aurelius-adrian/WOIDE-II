import { getAnnotationTypesAsDict, getDocumentSetting } from "../settings-api/settings";
import { AnnotationType } from "../utils/annotations";
import { getAnnotations } from "../annotation-api/annotations";
import { getAnnotationTextByID } from "../annotation-api/navigation";
import { stem } from "porter2";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const Mustache = require("mustache");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const _ = require("lodash");

export type Catalog = { [term: string]: CatalogEntry };
export type CatalogEntry = { references?: ReferenceEntry[]; ancestors?: Catalog };
export type ReferenceEntry = { refTypeId: string; data: Record<string, any> };
export type ExternalCatalogData = {
    entries: {
        verb: string;
        [key: string]: any;
    }[];
    [key: string]: any;
};
export type ExternalCatalog = {
    fileName: string;
    created: string;
    data: Catalog;
};

export async function GetInternalCatalog(): Promise<Catalog> {
    const types = await getAnnotationTypesAsDict();

    const sniffyTypes = Object.keys(types)
        .filter((key) => types[key].enableSniffy)
        .reduce((res: { [id: string]: AnnotationType }, key) => {
            res[key] = types[key];
            return res;
        }, {});

    const catalog: Catalog = {};

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

        const components = text.split(" ");
        let leaf = undefined;

        try {
            for (let i = 0; i < components.length; i++) {
                let c = components[i].toLowerCase();
                c = stem(c);

                if (i === 0) {
                    if (!catalog[c]) catalog[c] = {};
                    leaf = catalog[c];
                } else if (leaf) {
                    if (!leaf.ancestors) leaf.ancestors = { [c]: {} };
                    else leaf.ancestors[c] = {};

                    leaf = leaf.ancestors[c];
                }

                if (i === components.length - 1 && leaf) {
                    if (!leaf.references) leaf.references = [];

                    const data = JSON.parse(Mustache.render(type.referenceDataTemplate, a.data));

                    const searchRes = leaf.references.findIndex(
                        (e) =>
                            e.refTypeId === type.referenceAnnotationTypeId &&
                            JSON.stringify(e.data) === JSON.stringify(data),
                    );
                    if (searchRes !== -1) {
                        console.debug("Duplicate reference found, skipping: ", data);
                        continue;
                    }

                    leaf.references.push({
                        refTypeId: type.referenceAnnotationTypeId as string,
                        data: data,
                    });

                    leaf = undefined;
                    break;
                }
            }
        } catch (e) {
            console.error("Could not parse catalog entry: ", e);
        }
    }

    return catalog;
}

export async function GetExternalCatalog(
    data: ExternalCatalogData,
    refTypeId: string,
    template: string,
): Promise<Catalog> {
    const catalog: Catalog = {};

    if (!template) {
        throw new Error("Template is undefined");
    }

    if (!refTypeId) {
        throw new Error("Reference ID is undefined");
    }

    for (const e of data.entries) {
        if (!e.verb) {
            console.debug("Entry is missing verbalization 'verb'");
            continue;
        }

        const text = e.verb?.replace(/^❭\s|\s❬$/g, "");
        if (!text) {
            console.debug("Could not get text for entry", e.verb);
            continue;
        }

        const components = text.split(" ");
        let leaf = undefined;

        try {
            for (let i = 0; i < components.length; i++) {
                let c = components[i].toLowerCase();
                c = stem(c);

                if (i === 0) {
                    if (!catalog[c]) catalog[c] = {};
                    leaf = catalog[c];
                } else if (leaf) {
                    if (!leaf.ancestors) leaf.ancestors = { [c]: {} };
                    else leaf.ancestors[c] = {};

                    leaf = leaf.ancestors[c];
                }

                if (i === components.length - 1 && leaf) {
                    if (!leaf.references) leaf.references = [];

                    const data = JSON.parse(Mustache.render(template, e));

                    const searchRes = leaf.references.findIndex(
                        (e) => e.refTypeId === refTypeId && JSON.stringify(e.data) === JSON.stringify(data),
                    );
                    if (searchRes !== -1) {
                        console.debug("Duplicate reference found, skipping: ", data);
                        continue;
                    }

                    leaf.references.push({
                        refTypeId: refTypeId as string,
                        data: data,
                    });

                    leaf = undefined;
                    break;
                }
            }
        } catch (e) {
            console.error("Could not parse catalog entry: ", e);
        }
    }

    return catalog;
}

export async function GetGlobalCatalog(internal: Catalog): Promise<Catalog> {
    const externalCatalogs = (await getDocumentSetting("externalCatalogs")) as ExternalCatalog[];

    let res = internal;

    for (const e of externalCatalogs) {
        res = CombineCatalogs(internal, e.data);
    }

    return res;
}

export function CombineCatalogs(first: Catalog, second: Catalog): Catalog {
    function customizer(objValue: any, srcValue: any) {
        if (_.isArray(objValue)) {
            return objValue.concat(srcValue);
        }
    }

    return _.mergeWith(first, second, customizer) as Catalog;
}
