/* eslint-disable max-len */
import { insertAnnotation } from "../../lib/annotation-api/annotations";
import { highlightAnnotationID } from "../../lib/annotation-api/navigation";
import { Button } from "@fluentui/react-button";
import React, { useRef } from "react";
import { Export } from "../../lib/export-api/export";

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
        Export();
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
