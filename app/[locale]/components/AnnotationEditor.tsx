"use client";
import { Select } from "@fluentui/react-select";
import { Button } from "@fluentui/react-button";
import { getAnnotations, insertAnnotation, updateAnnotation } from "../../lib/annotation-api/annotations";
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
    const [editAnnotationData, setEditAnnotationData] = useState<any>(null);

    useEffect(() => {
        const _getData = async () => {
            setAnnotationTypes(((await getDocumentSetting("annotationTypes")) ?? []) as AnnotationType[]);
        };

        if (officeReady) _getData();
    }, [officeReady, setAnnotationTypes]);

    useEffect(() => {
        if (editAnnotation) {
            const filterdData = Object.fromEntries(
                Object.entries(JSON.parse(editAnnotation.data ?? "{}")).filter(
                    ([key]) => key !== "formDescription" && key !== "id",
                ),
            );
            const { name, ...formDataSelectedAnnotation } = filterdData;
            const indexToEdit = annotationTypes.findIndex((e) => e.name === name);
            if (indexToEdit !== -1 && name !== "") {
                setAnnotationIndex(indexToEdit.toString());
                setSelectedAnnotationType(annotationTypes[indexToEdit]);
            }
            setEditAnnotationData(formDataSelectedAnnotation);
        }
    }, [editAnnotation, annotationTypes]);

    useEffect(() => {
        if (selectedAnnotationType && editAnnotationData !== null) {
            formRef.current?.update({
                ...editAnnotationData,
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

            const annotationDetailedData = {
                ...data,
                ...selectedAnnotationType,
                annotationTypeId: selectedAnnotationType?.id,
            };

            await insertAnnotation({
                data: JSON.stringify(annotationDetailedData),
            });
            enqueueSnackbar({
                message: "Annotation Successfully Added.",
                variant: "success",
                autoHideDuration: 2000,
            });
            _getAnnotations();
            setEditMode(false);
        } catch {
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

            const annotationDetailedData = {
                ...data,
                ...selectedAnnotationType,
                annotationTypeId: selectedAnnotationType?.id,
            };

            await updateAnnotation(editAnnotation?.id ?? "", {
                data: JSON.stringify(annotationDetailedData),
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
                    {...(editAnnotationData && { formData: { ...editAnnotationData } })}
                />
            </div>
            {editAnnotation ? (
                <Button onClick={updateAnnotationData}>Update Annotation</Button>
            ) : (
                <>
                    <Button onClick={addAnnotation}>Add Annotation</Button>
                    {process.env.NEXT_PUBLIC_DEV === "true" ? <Test /> : null}
                </>
            )}
        </div>
    );
};

export default AnnotationEditor;
