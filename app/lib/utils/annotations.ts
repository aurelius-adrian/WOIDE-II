import {FormDescription} from "../../[locale]/components/Form";

export class Annotations {
    constructor() {
    }


}

export type AnnotationType = {
    id?: string,
    name: string,
    description?: string,
    formDescription: FormDescription,
    exportData: {[key: string]: string}
}

export type InputField = {}