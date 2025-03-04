export type Annotation = {
    id: string;
    properties: AnnotationProperties;
}

export type AnnotationProperties = {
    color?: string | undefined,
    startSymbol?: string | undefined,
    endSymbol?: string | undefined,
}