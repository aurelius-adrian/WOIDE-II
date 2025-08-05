import { Select } from "@fluentui/react-select";
import { Button } from "@fluentui/react-button";
import {
    getAnnotations,
    insertAnnotation,
    updateAnnotation,
    updateAnnotationRange,
} from "../../lib/annotation-api/annotations";
import React, { useEffect, useRef, useState } from "react";
import Form, { AnnotationFormApi } from "./Form";
import { useId } from "@fluentui/react-utilities";
import { AnnotationType } from "../../lib/utils/annotations";
import { getDocumentSetting } from "../../lib/settings-api/settings";
import { useOfficeReady } from "./Setup";
import Test from "./Test";
import { enqueueSnackbar } from "notistack";
import { Annotation } from "../../lib/annotation-api/types";
import { removeHighlightAnnotationID } from "../../lib/annotation-api/navigation";
import { CatalogEntry, GetInternalCatalog, GlossaryEntry, ReferenceEntry } from "../../lib/snify-api/catalog";
import { FindMatches, SniffyResult } from "../../lib/snify-api/snify";
import { AddFilled, EyeFilled } from "@fluentui/react-icons";

interface AnnotationEditorProps {
    setEditMode: (v: boolean) => void;
    updateAnnotations: (a: Annotation[]) => void;
    editAnnotation?: Annotation | null;
}

export const AnnotationEditor = ({ setEditMode, updateAnnotations, editAnnotation }: AnnotationEditorProps) => {
    const _getAnnotations = async () => {
        await getAnnotations().then((ann) => updateAnnotations(ann));
    };

    const selectId = useId();
    const officeReady = useOfficeReady();

    const formRef = useRef<AnnotationFormApi>(null);
    const [selectedAnnotationType, setSelectedAnnotationType] = useState<AnnotationType | null>(null);
    const [annotationTypes, setAnnotationTypes] = useState<AnnotationType[]>([]);
    const [annotationIndex, setAnnotationIndex] = useState<string>("defaultSelector");

    //Sniffy Data
    const [sniffyView, setSniffyView] = useState<boolean>(false);
    const [glossary, setGlossary] = useState<{ [word: string]: any } | undefined>();
    const [sniffyResult, setSniffyResult] = useState<SniffyResult[] | undefined>();

    const [isUpdatingRange, setIsUpdatingRange] = useState<boolean>(false);

    useEffect(() => {
        const _getData = async () => {
            setAnnotationTypes(((await getDocumentSetting("annotationTypes")) ?? []) as AnnotationType[]);
        };

        if (officeReady) _getData();
    }, [officeReady, setAnnotationTypes]);

    useEffect(() => {
        if (editAnnotation) {
            const indexToEdit = annotationTypes.findIndex((e) => e.id === editAnnotation.annotationTypeId);
            if (indexToEdit !== -1) {
                setAnnotationIndex(indexToEdit.toString());
                setSelectedAnnotationType(annotationTypes[indexToEdit]);
            }
        }
    }, [editAnnotation, annotationTypes]);

    useEffect(() => {
        if (selectedAnnotationType && editAnnotation !== null) {
            formRef.current?.update({
                ...editAnnotation?.data,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAnnotationType]);

    const addAnnotation = async () => {
        try {
            const data = await formRef.current?.submit();

            if (!data) {
                enqueueSnackbar({
                    message: "Complete the form to add annotation type.",
                    variant: "error",
                    autoHideDuration: 5000,
                });
                return;
            }

            await insertAnnotation({
                data: { ...data },
                annotationTypeId: selectedAnnotationType?.id,
                color: selectedAnnotationType?.color,
            });
            enqueueSnackbar({
                message: "Annotation Successfully Added.",
                variant: "success",
                autoHideDuration: 2000,
            });
            _getAnnotations();
            setEditMode(false);
        } catch (e) {
            console.error(e);
            enqueueSnackbar({
                message: "Select text and complete the form to add annotation.",
                variant: "error",
                autoHideDuration: 2000,
            });
        }
    };

    const updateAnnotationData = async () => {
        try {
            const data = await formRef.current?.submit();
            if (!data) {
                enqueueSnackbar({
                    message: "Complete the form to add annotation type.",
                    variant: "error",
                    autoHideDuration: 5000,
                });
                return;
            }

            await updateAnnotation(editAnnotation?.id ?? "", {
                data: { ...data },
                annotationTypeId: selectedAnnotationType?.id,
                color: selectedAnnotationType?.color,
            });
            enqueueSnackbar({
                message: "Annotation successfully updated.",
                variant: "success",
                autoHideDuration: 2000,
            });
            _getAnnotations();
            if (editAnnotation?.id) {
                removeHighlightAnnotationID(editAnnotation?.id);
                setEditMode(false);
            }
        } catch {
            enqueueSnackbar({
                message: "Failed to update annotation.",
                variant: "error",
                autoHideDuration: 2000,
            });
        }
    };

    const updateAnnotationRangeHandler = async () => {
        if (!editAnnotation?.id) return;
        await removeHighlightAnnotationID(editAnnotation?.id);

        setIsUpdatingRange(true);
        try {
            await updateAnnotationRange(editAnnotation.id);
            enqueueSnackbar({
                message: "Annotation range successfully updated.",
                variant: "success",
                autoHideDuration: 2000,
            });
            _getAnnotations();
        } catch (error) {
            console.error("Failed to update annotation range:", error);
            enqueueSnackbar({
                message: "Failed to update annotation range. Please select text first.",
                variant: "error",
                autoHideDuration: 5000,
            });
        } finally {
            setIsUpdatingRange(false);
        }
    };

    const runSniffy = async () => {
        const _glossary = await GetInternalCatalog();
        setGlossary(_glossary);

        console.log("glossary: ", _glossary);
        setSniffyResult(await FindMatches(_glossary));
        setSniffyView(true);
    };

    const RenderEditor = () => {
        return (
            <div>
                <label htmlFor={selectId}>Annotation Type</label>
                <Select
                    value={annotationIndex}
                    id={selectId}
                    className={"mb-6"}
                    onChange={(e) => {
                        formRef.current?.reset();
                        const selectedId = e.target.value;
                        const selected = annotationTypes[parseInt(selectedId)];
                        setAnnotationIndex(String(selectedId));
                        setSelectedAnnotationType(selected);
                    }}
                >
                    <option disabled value="defaultSelector">
                        Select an Annotation Type
                    </option>
                    {annotationTypes.map((e, idx) => (
                        <option key={idx} value={idx}>
                            {e.name}
                        </option>
                    ))}
                </Select>
                <div className={"mb-4"}>
                    <Form
                        formDescription={selectedAnnotationType?.formDescription ?? []}
                        ref={formRef}
                        formData={editAnnotation?.data}
                    />
                </div>

                {editAnnotation ? (
                    <div className="space-y-2 ">
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <Button onClick={updateAnnotationData}>Update Annotation Data</Button>
                            <Button
                                onClick={updateAnnotationRangeHandler}
                                disabled={isUpdatingRange}
                                appearance="secondary"
                            >
                                {isUpdatingRange ? "Updating Range..." : "Update Annotation Range"}
                            </Button>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                            To update the range, select the new text in the document and click Update Annotation Range
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={"flex flex-row space-x-2"}>
                            <Button onClick={addAnnotation}>Add Annotation</Button>
                            <Button
                                onClick={() => {
                                    if (!sniffyResult) runSniffy();
                                    else setSniffyView(true);
                                }}
                            >
                                Run Sniffy
                            </Button>
                        </div>
                    </>
                )}
            </div>
        );
    };

    const annotateEntry = async (
        entry: ReferenceEntry,
        annotationType: AnnotationType,
        select: () => Promise<void>,
    ) => {
        try {
            await select();
            await insertAnnotation({
                data: entry.data,
                annotationTypeId: annotationType.id,
                color: annotationType.color,
            });
            enqueueSnackbar("Inserted Annotation", { variant: "success", autoHideDuration: 2000 });
        } catch (e) {
            console.error("failed to insert annotation: ", e);
            enqueueSnackbar({
                message: "Failed to insert annotation.",
                variant: "error",
                autoHideDuration: 5000,
            });
        }
    };

    const CatalogEntry = ({ entry, select }: { entry: ReferenceEntry; select: () => Promise<void> }) => {
        const annotationType = annotationTypes.find((e) => e.id === entry.refTypeId);

        if (!annotationType) {
            return <div className={"border-l-2 mb-1 text-red-500"}>Invalid Annotation Type!</div>;
        }

        return (
            <div className={"border-l-2 mb-1"}>
                <div className={"flex flex-row space-x-2 items-center"}>
                    <Button
                        icon={<AddFilled />}
                        onClick={() => annotateEntry(entry, annotationType, select)}
                        appearance={"transparent"}
                    />
                    {annotationType?.name || "Could not find reference annotation type."}
                </div>
                <div className={"ml-2"}>
                    {Object.keys(entry.data).map((e, idx) => (
                        <div key={idx}>
                            {e}: {`${entry.data[e]}`}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const RenderSniffyResult = ({ result }: { result: SniffyResult }) => {
        return (
            <div className={"m-2 border-2 rounded p-1"}>
                <div className={"flex flex-row space-x-2 items-center justify-between mb-2"}>
                    <div className={"italic"}>{result.text}</div>
                    <Button icon={<EyeFilled />} onClick={result.select} appearance={"transparent"} />
                </div>
                Annotate as:
                {result.possibleAnnotations.map((e, idx) => (
                    <CatalogEntry entry={e} select={result.select} key={idx} />
                ))}
            </div>
        );
    };

    const RenderSniffy = () => {
        return (
            <div>
                <div className={"h-96 overflow-y-scroll mb-2"}>
                    {sniffyResult?.map((e, idx) => <RenderSniffyResult key={idx} result={e} />)}
                </div>
                <div className={"flex flex-row space-x-2"}>
                    <Button onClick={() => setSniffyView(false)}>Close</Button>
                    <Button onClick={() => runSniffy()}>Refresh Results</Button>
                </div>
            </div>
        );
    };

    return (
        <>
            {sniffyView ? <RenderSniffy /> : <RenderEditor />}
            {process.env.NEXT_PUBLIC_DEV === "true" ? <Test /> : null}
        </>
    );
};

export default AnnotationEditor;
