import {FormDescription} from "../../components/Form";

export class Annotations {
    constructor() {
    }


}

export type AnnotationType = {
    id?: string,
    name: string,
    description?: string,
    formDescription: FormDescription,
}

export type InputField = {}