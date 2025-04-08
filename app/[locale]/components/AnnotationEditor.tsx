'use client'
import {Select} from "@fluentui/react-select";
import {Button} from "@fluentui/react-button";
import {insertAnnotation} from "../../lib/annotation-api/annotations";
import React, {useEffect, useRef, useState} from "react";
import Form, {AnnotationFormApi} from "./Form";
import {useId} from "@fluentui/react-utilities";
import {AnnotationType} from "../../lib/utils/annotations";
import {getDocumentSetting} from "../../lib/settings-api/settings";
import {useOfficeReady} from "./Setup";
import Test from "./Test";


export const AnnotationEditor = () => {
    const selectId = useId();
    const officeReady = useOfficeReady();

    const formRef = useRef<AnnotationFormApi>(null);
    const [selectedAnnotationType, setSelectedAnnotationType] = useState<AnnotationType | undefined>(undefined);
    const [annotationTypes, setAnnotationTypes] = useState<AnnotationType[]>([]);

    useEffect(() => {
        const _getData = async () => {
            setAnnotationTypes(((await getDocumentSetting('annotationTypes')) ?? []) as AnnotationType[])
        };

        if (officeReady) _getData();
    }, [officeReady, setAnnotationTypes]);

    const addAnnotation = async () => {
        const data = await formRef.current?.submit();
        insertAnnotation({data: JSON.stringify(data)});
    }

    return <div>
        <label htmlFor={selectId}>Annotation Type</label>
        <Select id={selectId} className={"mb-6"}
                onChange={(e) => setSelectedAnnotationType(annotationTypes[e.target.value as unknown as number])}>
            {annotationTypes.map((e, idx) => (<option key={idx} value={idx}>{e.name}</option>))}
        </Select>
        <div className={"mb-4"}>
            <Form formDescription={(selectedAnnotationType?.formDescription) ?? []}
                  ref={formRef}/>
        </div>
        <Button onClick={addAnnotation}>
            Add Annotation
        </Button>
        <Test/>
    </div>
}

export default AnnotationEditor;