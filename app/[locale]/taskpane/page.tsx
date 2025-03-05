'use client'
import React, {useEffect, useState} from "react";
import {Accordion, AccordionHeader, AccordionItem, AccordionPanel} from "@fluentui/react-accordion";
import {EyeFilled, InfoRegular} from "@fluentui/react-icons";
import {Button, ToggleButton} from "@fluentui/react-button";
import {getAnnotations} from "../../lib/annotation-api/annotations";
import {highlightAnnotationID, removeHighlightAnnotationID} from "../../lib/annotation-api/navigation";
import {
    EditRegular
} from "@fluentui/react-icons";
import {Annotation} from "../../lib/annotation-api/types";
import AnnotationEditor from "../components/AnnotationEditor";
import { useTranslations } from "next-intl"

export default function TaskPanePage() {
    const  t = useTranslations('TaskPane')

    const [edit, setEdit] = useState<boolean>(true);
    const [annotations, setAnnotations] = useState<Annotation[]>([]);

    useEffect(() => {
        if (edit) _getAnnotations()
    }, [edit]);

    const _getAnnotations = async () => {
        getAnnotations().then(setAnnotations);
    }

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
        <div className={"mb-4"}>
            <Button icon={!edit ? <EditRegular/> : <EyeFilled/>}
                    onClick={() => setEdit(!edit)}>{!edit ? "Add Annotation" : "View Annotations"}</Button>
        </div>
        {edit ?
            <AnnotationEditor/> :
            <div className={"flex flex-col space-y-2"}>
                {annotations.map((a, i) => (
                    <ToggleButton key={i} onClick={(e) => {
                        if ((e.target as (EventTarget & {
                            ariaPressed: string
                        })).ariaPressed == "false") highlightAnnotationID(a);
                        else removeHighlightAnnotationID(a);
                    }}>id: {a.id}</ToggleButton>
                ))}
            </div>
        }
    </div>;
}