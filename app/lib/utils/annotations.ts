import { FormDescription } from "../../[locale]/components/Form";

export type AnnotationType = {
    id?: string;
    name: string;
    description?: string;
    formDescription: FormDescription;
};
