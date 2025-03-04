import {AnnotationType} from "../lib/utils/annotations";
import {Accordion, AccordionHeader, AccordionItem, AccordionPanel} from "@fluentui/react-accordion";
import React, {Dispatch, SetStateAction} from "react";
import {Button} from "@fluentui/react-button";
import {EditRegular} from "@fluentui/react-icons";


export const ViewAnnotationTypes = ({setAnnotationType}: {
    setAnnotationType: Dispatch<SetStateAction<AnnotationType | null>>
}) => {
    const demoData: AnnotationType[] = [
        {
            "id": "id 0",
            "name": "Test",
            "formDescription": [
                {
                    "type": "textInput",
                    "label": "Text 1 Label",
                    "id": "id0"
                },
                {
                    "type": "textInput",
                    "label": "Text 2 Label",
                    "id": "id1"
                },
                {
                    "type": "select",
                    "label": "Select Label",
                    "id": "id2",
                    "options": [
                        {
                            "value": "value0",
                            "label": "Option 1"
                        },
                        {
                            "value": "value1",
                            "label": "Option 2"
                        }
                    ]
                }
            ]
        }
    ]

    return (<div>
        Annotation Types:
        <Accordion collapsible>
            {demoData.map((e: AnnotationType, idx: number) =>
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