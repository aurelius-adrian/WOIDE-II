import {AnnotationType} from "../../lib/utils/annotations";
import {Accordion, AccordionHeader, AccordionItem, AccordionPanel} from "@fluentui/react-accordion";
import React, {Dispatch, SetStateAction, useEffect, useState} from "react";
import {Button} from "@fluentui/react-button";
import {EditRegular} from "@fluentui/react-icons";
import {getDocumentSetting} from "../../lib/settings-api/settings";


export const ViewAnnotationTypes = ({setAnnotationType}: {
    setAnnotationType: Dispatch<SetStateAction<AnnotationType | null>>
}) => {
    const [data, setData] = useState<AnnotationType[]>([]);

    useEffect(() => {
        const _getData = async () => {
            setData(((await getDocumentSetting('annotationTypes')) ?? []) as AnnotationType[])
        };

        _getData();
    }, [setData]);

    return (<div>
        <div className={"mb-2"}>Annotation Types:</div>
        <Button onClick={() => setAnnotationType({formDescription: [], name: "New Annotation Type"})}>
            Add Annotation Type
        </Button>
        <Accordion collapsible>
            {data.map((e: AnnotationType, idx: number) =>
                <AccordionItem key={idx} value={idx}>
                    <AccordionHeader>{e.name}</AccordionHeader>
                    <AccordionPanel>
                        <div className={"mb-2"}>
                            <code
                                className={"p-0.5 rounded-md bg-blue-900 border-blue-900 border-0.5 text-white text-xs"}>{`id: ${e.id}`}</code>
                        </div>
                        <div className={"mb-2"}>{e.description || "No description provided"}</div>
                        <Button icon={<EditRegular/>} onClick={() => setAnnotationType(e)}>Edit</Button>
                    </AccordionPanel>
                </AccordionItem>
            )}
        </Accordion>
    </div>)
}