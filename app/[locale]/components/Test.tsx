/* eslint-disable max-len */
import { insertAnnotation } from "../../lib/annotation-api/annotations";
import { highlightAnnotationID } from "../../lib/annotation-api/navigation";
import { Button } from "@fluentui/react-button";
import React, { useRef } from "react";
import { AnnotationType } from "../../lib/utils/annotations";

const Test = () => {
    const dialog = useRef<Office.Dialog>();

    const test_1 = async () => {
        await Word.run(async (context) => {
            const text = `Einfluss von Temperaturänderungen auf die Photosyntheseleistung von Pflanzen

Die Photosynthese ist ein zentraler biochemischer Prozess, der die Grundlage für das Leben auf der Erde bildet. Sie ermöglicht die Umwandlung von Lichtenergie in chemische Energie, die in Form von Glukose gespeichert wird. In der vorliegenden Arbeit wird untersucht, wie Temperaturänderungen die Effizienz der Photosynthese beeinflussen.

Hintergrund
Die Photosynthese erfolgt in zwei Hauptphasen: den lichtabhängigen Reaktionen, die in den Thylakoidmembranen der Chloroplasten ablaufen, und den lichtunabhängigen Reaktionen (Calvin-Zyklus), die im Stroma der Chloroplasten stattfinden. Beide Prozesse sind enzymatisch gesteuert, was sie anfällig für Temperaturschwankungen macht. Insbesondere Enzyme wie RubisCO, das für die Fixierung von CO₂ verantwortlich ist, zeigen eine deutliche Temperaturabhängigkeit.

Methodik
Für die Untersuchung wurden zwei Pflanzenarten, Arabidopsis thaliana und Zea mays, unter kontrollierten Bedingungen analysiert. Die Pflanzen wurden Temperaturen von 15°C, 25°C und 35°C ausgesetzt, wobei die Photosyntheserate mithilfe eines Infrarot-Gasanalyzers gemessen wurde. Zusätzlich wurden Chlorophyllfluoreszenz und die Aktivität des Enzyms RubisCO erfasst, um mögliche Mechanismen hinter den beobachteten Effekten zu identifizieren.`;
            context.document.body.insertText(text, Word.InsertLocation.start);
        });
    };

    const test_2 = () => {
        insertAnnotation({
            data: "",
        }).then((r) => {
            if (r !== null) highlightAnnotationID(r).then(() => {});
        });
    };

    const test_3 = async () => {
        dialog.current?.messageChild("Test!!!! Woaaa");
    };

    const test_4 = async () => {
        const data: AnnotationType = {
            id: "123-456-7890",
            name: "Test",
            formDescription: [
                {
                    id: "first",
                    type: "textInput",
                    label: "First Field",
                },
                {
                    id: "second",
                    type: "textInput",
                    label: "Second Field",
                },
                {
                    id: "third",
                    type: "select",
                    label: "Third Field",
                    options: [
                        {
                            value: "value 1",
                            label: "Value 1",
                        },
                        {
                            value: "value 2",
                            label: "Value 2",
                        },
                    ],
                },
            ],
            exportData: {},
            description: "Test Annotation Type",
        };

        Office.context.ui.displayDialogAsync(
            `https://localhost:3050/templating?data=${btoa(JSON.stringify(data))}`,
            {
                height: 80,
                width: 80,
                displayInIframe: false,
            },
            (res) => {
                dialog.current = res.value;
                dialog.current.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
                dialog.current?.messageChild("Test!!!! Woaaa");
            },
        );
    };

    function processMessage(arg: any) {
        dialog.current?.close();
    }

    return (
        <div className={"rounded-lg border-red-700 border-2 p-2 mt-4 space-y-2"}>
            <div className={"font-bold text-xl text-red-700"}>Testing</div>
            <div className={"space-x-2"}>
                <Button onClick={() => test_1()}>Test 1</Button>
                <Button onClick={() => test_2()}>Test 2</Button>
                <Button onClick={() => test_3()}>Test 3</Button>
                <Button onClick={() => test_4()}>Test 4</Button>
            </div>
            <div className={"font-bold text-xl text-red-700"}>Output</div>
            <div id={"output"} />
        </div>
    );
};

export default Test;
