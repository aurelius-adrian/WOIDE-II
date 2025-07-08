import { AnnotationType } from "../../../lib/utils/annotations";

const ALLOWED_FORM_ELEMENT_TYPES = ["textInput", "select", "selectAnnotation"] as const;

export function validateAnnotationTypes(data: unknown): {
    isValid: boolean;
    validatedData?: AnnotationType[];
    error?: string;
} {
    try {
        if (!Array.isArray(data)) {
            throw new Error("Invalid data format");
        }

        const validatedData: AnnotationType[] = [];

        for (const item of data) {
            if (typeof item !== "object" || item === null) {
                throw new Error("Invalid item format");
            }

            const { id, name, formDescription, exportData, description } = item as any;

            if (typeof name !== "string" || !name.trim()) {
                throw new Error("Invalid name field");
            }

            if (typeof id !== "string" || !id.trim()) {
                throw new Error("Invalid ID field");
            }

            if (!Array.isArray(formDescription)) {
                throw new Error("Invalid form description format");
            }

            for (const element of formDescription) {
                if (typeof element !== "object" || element === null) {
                    throw new Error("Invalid form element format");
                }

                const { label, type, options, allowedAnnotationTypes } = element;

                if (typeof label !== "string" || !label.trim()) {
                    throw new Error("Invalid label field");
                }

                if (!ALLOWED_FORM_ELEMENT_TYPES.includes(type)) {
                    throw new Error("Invalid element type");
                }

                if (type === "select" && !Array.isArray(options)) {
                    throw new Error("Invalid select options");
                }

                if (type === "selectAnnotation" && allowedAnnotationTypes !== undefined) {
                    if (typeof allowedAnnotationTypes !== "string") {
                        throw new Error("Invalid annotation type filter");
                    }
                }
            }

            if (exportData !== undefined && (typeof exportData !== "object" || exportData === null)) {
                throw new Error("Invalid export data format");
            }

            if (description !== undefined && typeof description !== "string") {
                throw new Error("Invalid description format");
            }

            validatedData.push(item as AnnotationType);
        }

        return { isValid: true, validatedData };
    } catch (error) {
        return {
            isValid: false,
            error: error instanceof Error ? error.message : "Validation error occurred",
        };
    }
}
