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
import { Select } from "@fluentui/react-select";
import { useId } from "@fluentui/react-utilities";
import { getAllExportLayers } from "../../../lib/settings-api/settings";
import { Export, getTimestamp, saveStringToFile } from "../../../lib/export-api/export";

export default function TaskPanePage() {
    const t = useTranslations("TaskPane");

    const officeReady = useOfficeReady();
    const [edit, setEdit] = useState<boolean>(true);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);
    const [annotationToEdit, setannotationToEdit] = useState<Annotation | null>(null);
    const [exportLoading, setExportLoading] = useState<boolean>(false);

    const select2Id = useId();

    const [exportLayers, setExportLayers] = useState<string[]>([]);
    const [selectedExportLayer, setSelectedExportLayer] = useState<string>("default");

    useEffect(() => {
        const _getData = async () => {
            setExportLayers(await getAllExportLayers());
        };

        if (officeReady) _getData();
    }, [officeReady]);

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
                    <div className={"mb-4"}>
                        <label htmlFor={select2Id}>Export document for &#34;{selectedExportLayer}&#34; layer</label>
                        <Select
                            value={selectedExportLayer}
                            id={select2Id}
                            className={"mb-2"}
                            onChange={(e) => {
                                setSelectedExportLayer(e.target.value);
                            }}
                        >
                            {exportLayers.map((e, idx) => (
                                <option key={idx} value={e}>
                                    {e}
                                </option>
                            ))}
                        </Select>
                        <Button
                            disabled={exportLoading}
                            onClick={async () => {
                                setExportLoading(true);
                                try {
                                    saveStringToFile(
                                        await Export(selectedExportLayer),
                                        `${selectedExportLayer}-${getTimestamp()}.html`,
                                        "text/html",
                                    );
                                } finally {
                                    setExportLoading(false);
                                }
                            }}
                        >
                            Export
                        </Button>
                    </div>
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
