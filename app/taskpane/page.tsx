'use client'
import React, {useEffect, useState} from "react";
import {Accordion, AccordionHeader, AccordionItem, AccordionPanel} from "@fluentui/react-accordion";
import {EyeFilled, InfoRegular} from "@fluentui/react-icons";
import {useId} from "@fluentui/react-utilities";
import {Select} from "@fluentui/react-select";
import {Button, ToggleButton} from "@fluentui/react-button";
import {getAnnotations, insertAnnotation} from "../lib/annotation-api/annotations";
import {highlightAnnotationID, removeHighlightAnnotationID} from "../lib/annotation-api/navigation";
import {
    EditRegular
} from "@fluentui/react-icons";
import {Annotation} from "../lib/annotation-api/types";

export default function TaskPanePage() {
    const selectId = useId();

    const [tmp, setTmp] = useState<string>("#000099");
    const [edit, setEdit] = useState<boolean>(false);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);

    useEffect(() => {
        if (!edit) _getAnnotations()
    }, [edit]);

    const test_1 = async () => {
        await Word.run(async (context) => {
            const text = `Einfluss von Temperaturänderungen auf die Photosyntheseleistung von Pflanzen

Die Photosynthese ist ein zentraler biochemischer Prozess, der die Grundlage für das Leben auf der Erde bildet. Sie ermöglicht die Umwandlung von Lichtenergie in chemische Energie, die in Form von Glukose gespeichert wird. In der vorliegenden Arbeit wird untersucht, wie Temperaturänderungen die Effizienz der Photosynthese beeinflussen.

Hintergrund
Die Photosynthese erfolgt in zwei Hauptphasen: den lichtabhängigen Reaktionen, die in den Thylakoidmembranen der Chloroplasten ablaufen, und den lichtunabhängigen Reaktionen (Calvin-Zyklus), die im Stroma der Chloroplasten stattfinden. Beide Prozesse sind enzymatisch gesteuert, was sie anfällig für Temperaturschwankungen macht. Insbesondere Enzyme wie RubisCO, das für die Fixierung von CO₂ verantwortlich ist, zeigen eine deutliche Temperaturabhängigkeit.

Methodik
Für die Untersuchung wurden zwei Pflanzenarten, Arabidopsis thaliana und Zea mays, unter kontrollierten Bedingungen analysiert. Die Pflanzen wurden Temperaturen von 15°C, 25°C und 35°C ausgesetzt, wobei die Photosyntheserate mithilfe eines Infrarot-Gasanalyzers gemessen wurde. Zusätzlich wurden Chlorophyllfluoreszenz und die Aktivität des Enzyms RubisCO erfasst, um mögliche Mechanismen hinter den beobachteten Effekten zu identifizieren.`
            context.document.body.insertText(text, Word.InsertLocation.start)
        });
    }

    const test_2 = () => {
        insertAnnotation().then(r => {
            if (r != null) highlightAnnotationID(r).then(() => {
            });
        })
    }

    const test_3 = async () => {
        await Word.run(async (context) => {
            const range: Word.Range = context.document.getSelection().getRange();
            const ooxml = range.getOoxml();
            await context.sync();
            let e = document.getElementById("output");
            if (e) e.innerHTML += ooxml.value;
            console.log(ooxml.value);
        });
    }

    const test_4 = async () => {
        _getAnnotations();
    }

    const insertText = async (text: string) => {
        // Write text to the document.
        await Word.run(async (context) => {
            const paragraph = context.document.getSelection().paragraphs.getFirst();
            const critique1 = {
                colorScheme: Word.CritiqueColorScheme.red,
                start: 1,
                length: 3
            };
            const critique2 = {
                colorScheme: Word.CritiqueColorScheme.green,
                start: 6,
                length: 1
            };
            const critique3 = {
                colorScheme: Word.CritiqueColorScheme.blue,
                start: 10,
                length: 3
            };
            const critique4 = {
                colorScheme: Word.CritiqueColorScheme.lavender,
                start: 14,
                length: 3
            };
            const critique5 = {
                colorScheme: Word.CritiqueColorScheme.berry,
                start: 18,
                length: 10
            };
            const annotationSet: Word.AnnotationSet = {
                critiques: [critique1, critique2, critique3, critique4, critique5]
            };

            const annotationIds = paragraph.insertAnnotations(annotationSet);

            await context.sync();

            console.log("Annotations inserted:", annotationIds.value);
        });
    };

    const _getAnnotations = async () => {
        getAnnotations().then(setAnnotations);
    }

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
                    <div>Lern how to use WOIDE here: <a href={"https://github.com/aurelius-adrian/WOIDE-II"}>See WOIDE
                        II on GitHub</a></div>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
        <div className={"mb-4"}>
            <Button icon={edit ? <EditRegular/> : <EyeFilled/>}
                    onClick={() => setEdit(!edit)}>{edit ? "Add Annotation" : "View Annotations"}</Button>
        </div>
        {!edit ?
            <div>
                <label htmlFor={selectId}>Annotation Type</label>
                <Select id={selectId} className={"mb-6"} onChange={(e) => setTmp(e.target.value)} value={tmp}>
                    <option value={"#ff0000"}>Red</option>
                    <option value={"#009933"}>Green</option>
                    <option value={"#000056"}>Blue</option>
                </Select>
                <Button onClick={() => insertAnnotation({color: tmp})}>
                    Add Annotation
                </Button>
            </div> :
            <div className={"flex flex-col space-y-2"}>
                {annotations.map((a, i) => (
                    <ToggleButton key={i} onClick={(e) => {
                        if ((e.target as (EventTarget & {ariaPressed: string})).ariaPressed == "false") highlightAnnotationID(a);
                        else removeHighlightAnnotationID(a);
                    }}>id: {a.id}</ToggleButton>
                ))}
            </div>
        }
        <div className={"rounded-lg border-red-700 border-2 p-2 mt-4 space-y-2"}>
            <div className={"font-bold text-xl text-red-700"}>Testing</div>
            <div className={"space-x-2"}>
                <Button onClick={() => test_1()}>
                    Test 1
                </Button>
                <Button onClick={() => test_2()}>
                    Test 2
                </Button>
                <Button onClick={() => test_3()}>
                    Test 3
                </Button>
                <Button onClick={() => test_4()}>
                    Test 4
                </Button>
            </div>
            <div className={"font-bold text-xl text-red-700"}>Output</div>
            <div id={"ouput"}/>
        </div>
    </div>;
}