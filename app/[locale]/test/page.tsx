'use client'
import Editor from "@monaco-editor/react";
import React, {useEffect, useRef, useState} from "react";
import {useSearchParams} from "next/navigation";
import Form, {AnnotationFormApi} from "../components/Form";
import {Button} from "@fluentui/react-button";

export default function Test() {

    const searchParams = useSearchParams();
    const data = JSON.parse(atob(searchParams.get("data") || ""));

    const [formData, setFormData] = useState();
    const formRef = useRef<AnnotationFormApi>(null);

    const Mustache = require('mustache');
    const [code, setCode] = useState<string | undefined>('');

    useEffect(() => {
        Office.onReady(() => {
            Office.context.ui.addHandlerAsync(Office.EventType.DialogParentMessageReceived, onMessageFromParent);
        });
    }, []);

    function onMessageFromParent(arg: any) {
        const messageFromParent = JSON.parse(arg.message);
        console.log(messageFromParent.name);
    }

    const renderOut = (code: string | undefined, view: any) => {
        try {
            return Mustache.render(code, view);
        } catch (error) {
            return <p>⚠️Something went wrong</p>
        }
    }

    return (<div className={"space-y-2"}>
        <div className={"h-96 border-blue-900 border-2 rounded-md py-2"}>
            <Editor
                height="100%"
                language="html"
                theme="light"
                value={code}
                options={{
                    lineNumbers: "on",
                    formatOnType: true,
                }}
                onChange={(s) => setCode(s)}
            />
        </div>
        <div className={"border-blue-900 border-2 rounded-md py-2"}>
            <Button/>
        </div>
        <div className={"border-blue-900 border-2 rounded-md pb-2 px-2"}>
            <Form
                formDescription={data?.formDescription ?? []}
                ref={formRef}
                onChange={(v) => {
                    console.log(v);
                    setFormData(v);
                }}
            />
        </div>
        <div className={"border-blue-900 border-2 rounded-md p-2"}>{renderOut(code, formData)}</div>
    </div>)
}