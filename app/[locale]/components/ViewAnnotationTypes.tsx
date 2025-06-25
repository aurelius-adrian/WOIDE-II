import { AnnotationType } from "../../lib/utils/annotations";
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel } from "@fluentui/react-accordion";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@fluentui/react-button";
import { EditRegular } from "@fluentui/react-icons";
import { getDocumentSetting } from "../../lib/settings-api/settings";
import { useOfficeReady } from "./Setup";

export const ViewAnnotationTypes = ({
                                        setAnnotationType,
                                    }: {
    setAnnotationType: Dispatch<SetStateAction<AnnotationType | null>>;
}) => {
    const [annotationTypes, setAnnotationTypes] = useState<AnnotationType[]>([]);
    const officeReady = useOfficeReady();

    useEffect(() => {
        const _getData = async () => {
            setAnnotationTypes(((await getDocumentSetting("annotationTypes")) ?? []) as AnnotationType[]);
        };

        if (officeReady) _getData();
    }, [officeReady, setAnnotationTypes]);

    return (
        <div>
            <div className={"mb-2"}>Annotation Types:</div>
            <Button onClick={() => setAnnotationType(
                { formDescription: [], name: "New Annotation Type", exportData: {} } as AnnotationType)}>
                Add Annotation Type
            </Button>
            <Accordion collapsible>
                {annotationTypes.map((e: AnnotationType, idx: number) => (
                    <AccordionItem key={idx} value={idx}>
                        <AccordionHeader>{e.name}</AccordionHeader>
                        <AccordionPanel>
                            <div className={"mb-2"}>
                                <code
                                    className={
                                        "p-0.5 rounded-md bg-blue-900 border-blue-900 border-0.5 text-white text-xs"
                                    }
                                >{`id: ${e.id}`}</code>
                            </div>
                            <div className={"mb-2"}>{e.description || "No description provided"}</div>
                            <Button icon={<EditRegular />} onClick={() => setAnnotationType(e)}>
                                Edit
                            </Button>
                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};
