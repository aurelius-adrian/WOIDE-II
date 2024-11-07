import {useEffect, useState} from "react";
import {Accordion, AccordionHeader, AccordionItem, AccordionPanel} from "@fluentui/react-accordion";
import {InfoRegular} from "@fluentui/react-icons";
import {useId} from "@fluentui/react-utilities";
import {Select} from "@fluentui/react-select";
import {Button} from "@fluentui/react-button";

export default function TaskPanePage() {
    const selectId = useId();

    const [tmp, setTmp] = useState<string>("Red");

    useEffect(() => {
        window.Office.onReady(() => {
            console.log('TaskPainePage');
        });
    });

    const insertText = async (text: string) => {
        // Write text to the document.
        await Word.run(async (context) => {
            // let body = context.document.body;
            // body.insertParagraph(text, Word.InsertLocation.end);
            // await context.sync();

            const range = context.document.getSelection();
            await context.sync();
            //@ts-ignore
            range.highlight();

            const critique1: Word.Critique = {
                colorScheme: "Red",
                start: 1,
                length: 3
            };
            const critique2: Word.Critique = {
                colorScheme: "Green",
                start: 6,
                length: 1
            };
            const critique3: Word.Critique = {
                colorScheme: "Blue",
                start: 10,
                length: 3
            };
            const critique4: Word.Critique = {
                colorScheme: "Lavender",
                start: 14,
                length: 3
            };
            const critique5: Word.Critique = {
                colorScheme: "Berry",
                start: 18,
                length: 10
            };
            const annotationSet: Word.AnnotationSet = {
                critiques: [critique1, critique2, critique3, critique4, critique5]
            };

            // // @ts-ignore
            // const annotationIds = paragraph.insertAnnotations(annotationSet);




            // console.log("Annotations inserted:", annotationIds.value);
        });
    };

    return <div>
        <Accordion collapsible={true} className={"-ml-3 mb-3"}>
            <AccordionItem value="1">
                <AccordionHeader expandIconPosition="end" expandIcon={<InfoRegular/>}>
                    WOIDE - A Word OMDoc IDE
                </AccordionHeader>
                <AccordionPanel>
                    <div>WOIDE is a tool, which brings semantic annotation to Microsoft Office Word. Use its features to
                        create active documents and more.
                    </div>
                    <div>Lern how to use WOIDE here: <a>TODO Link</a></div>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
        <label htmlFor={selectId}>Annotation Type</label>
        <Select id={selectId} className={"mb-6"} onChange={(e) => setTmp(e.target.value)} value={tmp}>
            <option value={"Red"}>Red</option>
            <option value={"Green"}>Green</option>
            <option value={"Blue"}>Blue</option>
        </Select>
        <Button onClick={() => insertText("loaded")}>
            Add Text
        </Button>
    </div>;
}