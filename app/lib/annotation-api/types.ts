export type Annotation = {
    id: string;
    annotationTypeId: string;
} & AnnotationProperties;

export type AnnotationProperties = {
    color?: string | undefined;
    startSymbol?: string | undefined;
    endSymbol?: string | undefined;
    data?: string | undefined;
};
