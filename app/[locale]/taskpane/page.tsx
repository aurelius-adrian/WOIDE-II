'use client'
import React, {useState} from "react";
import {Accordion, AccordionHeader, AccordionItem, AccordionPanel} from "@fluentui/react-accordion";
import {InfoRegular} from "@fluentui/react-icons";
import {useId} from "@fluentui/react-utilities";
import {Select} from "@fluentui/react-select";
import {Button} from "@fluentui/react-button";
import {insertAnnotation} from "../lib/annotation-api/annotations";
import {highlightAnnotationID} from "../lib/annotation-api/navigation";
import { useTranslations } from "next-intl"


export default function TaskPanePage() {
    const  t = useTranslations('TaskPane')
    const selectId = useId();

    const [tmp, setTmp] = useState<string>("Red");

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
            if (r != null) highlightAnnotationID(r);
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

    return <div>
        <Accordion collapsible={true} className={"-ml-3 mb-3"}>
            <AccordionItem value="1">
                <AccordionHeader expandIconPosition="end" expandIcon={<InfoRegular/>}>
                {t('header')}
                </AccordionHeader>
                <AccordionPanel>
                    <div>{t('description')}
                    </div>
                    <div>{t('sub-desc1')} <a href={"https://github.com/aurelius-adrian/WOIDE-II"}>{t('sub-desc2')}</a></div>
                </AccordionPanel>
            </AccordionItem>
        </Accordion>
        <label htmlFor={selectId}>{t('annotationType')}</label>
        <Select id={selectId} className={"mb-6"} onChange={(e) => setTmp(e.target.value)} value={tmp}>
            <option value={"Red"}>{t('red')} </option>
            <option value={"Green"}>{t('green')} </option>
            <option value={"Blue"}>{t('blue')} </option>
        </Select>
        <Button onClick={() => insertText("loaded")}>
        {t('addText')} 
        </Button>
        <div className={"rounded-lg border-red-700 border-2 p-2 mt-4 space-y-2"}>
            <div className={"font-bold text-xl text-red-700"}>{t('testing')}</div>
            <div className={"space-x-2"}>
                <Button onClick={() => test_1()}>
                {t('test1')}                </Button>
                <Button onClick={() => test_2()}>
                {t('test2')}                </Button>
                <Button onClick={() => test_3()}>
                {t('test3')}                </Button>
            </div>
            <div className={"font-bold text-xl text-red-700"}>{t('output')}</div>
            <div id={"ouput"}/>
        </div>
    </div>;
}