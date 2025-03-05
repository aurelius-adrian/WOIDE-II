import {Select} from "@fluentui/react-select";
import {Button} from "@fluentui/react-button";
import {insertAnnotation} from "../../lib/annotation-api/annotations";
import React, {useRef, useState} from "react";
import Form, {AnnotationFormApi} from "./Form";
import {useId} from "@fluentui/react-utilities";
import {highlightAnnotationID} from "../../lib/annotation-api/navigation";


export const AnnotationEditor = () => {
    const selectId = useId();

    const [tmp, setTmp] = useState<string>("#000099");
    const formRef = useRef<AnnotationFormApi>(null);

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
        console.log(await formRef.current?.submit());
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

    const addAnnotation = async () => {
        const data = await formRef.current?.submit();
        console.log(data);
        insertAnnotation({color: tmp});
    }

    return <div>
        <label htmlFor={selectId}>Annotation Type</label>
        <Select id={selectId} className={"mb-6"} onChange={(e) => setTmp(e.target.value)} value={tmp}>
            <option value={"#ff0000"}>Red</option>
            <option value={"#009933"}>Green</option>
            <option value={"#000056"}>Blue</option>
        </Select>
        <div className={"mb-4"}>
            <Form formDescription={[
                {id: "hello1", type: "textInput", label: "Hello 1"},
                {id: "hello2", type: "textInput", label: "Hello 2"},
                {id: "hello3", type: "textInput", label: "Hello 3"},
                {id: "hello4", type: "textInput", label: "Hello 4"},
                {id: "hello5", type: "textInput", label: "Hello 5"},
            ]} ref={formRef}/>
        </div>
        <Button onClick={addAnnotation}>
            Add Annotation
        </Button>
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
    </div>
}

export default AnnotationEditor;