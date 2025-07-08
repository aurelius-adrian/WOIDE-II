"use client";
import React, { useEffect, useState } from "react";
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel } from "@fluentui/react-accordion";
import { EditRegular, EyeFilled, InfoRegular } from "@fluentui/react-icons";
import { Button } from "@fluentui/react-button";
import { getAnnotations } from "../../../lib/annotation-api/annotations";
import { Annotation } from "../../../lib/annotation-api/types";
import AnnotationEditor from "../../components/AnnotationEditor";
import { useTranslations } from "next-intl";
import AnnotationView from "../../components/AnnotationView";
import { highlightAnnotationID, removeHighlightAnnotationID } from "../../../lib/annotation-api/navigation";
import { useOfficeReady } from "../../components/Setup";

export default function TaskPanePage() {
    const t = useTranslations("TaskPane");

    const officeReady = useOfficeReady();
    const [edit, setEdit] = useState<boolean>(true);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [annotationToEdit, setannotationToEdit] = useState<Annotation | null>(null);

    useEffect(() => {
        if (edit && officeReady) _getAnnotations();
    }, [edit, annotations.length, officeReady]);

    useEffect(() => {
        if (annotationToEdit) {
            highlightAnnotationID(annotationToEdit?.id);
        }
    }, [annotationToEdit]);

    const _getAnnotations = async () => {
        getAnnotations().then(setAnnotations);
    };

    return (
        <div>
            <Accordion collapsible={true} className={"-ml-3 mb-3"}>
                <AccordionItem value="1">
                    <AccordionHeader expandIconPosition="end" expandIcon={<InfoRegular />}>
                        {t("header")}
                    </AccordionHeader>
                    <AccordionPanel>
                        <div>{t("description")}</div>
                        <div>
                            {t("sub-desc1")}{" "}
                            <a href={"https://github.com/aurelius-adrian/WOIDE-II"}>{t("sub-desc2")}</a>
                        </div>
                    </AccordionPanel>
                </AccordionItem>
            </Accordion>
            <div className={"mb-4"}>
                <Button
                    icon={!edit ? <EditRegular /> : <EyeFilled />}
                    onClick={() => {
                        setEdit(!edit);
                        if (annotationToEdit) {
                            removeHighlightAnnotationID(annotationToEdit.id);
                            setannotationToEdit(null);
                        }
                    }}
                >
                    {!edit ? "Add Annotation" : "View Annotations"}
                </Button>
            </div>
            {edit ? (
                <AnnotationEditor
                    setEditMode={setEdit}
                    updateAnnotations={setAnnotations}
                    editAnnotation={annotationToEdit}
                />
            ) : (
                <div className={"flex flex-col space-y-2"}>
                    {annotations.map((a, i) => (
                        <AnnotationView
                            key={i}
                            currentAnnotation={a}
                            currentAnnotationIndex={i}
                            updateAnnotations={setAnnotations}
                            setEditMode={setEdit}
                            setEditAnnotation={setannotationToEdit}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
