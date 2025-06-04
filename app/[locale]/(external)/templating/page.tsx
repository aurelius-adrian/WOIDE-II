"use client";
import Editor from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Form, { AnnotationFormApi } from "../../components/Form";
import { ToggleButton } from "@fluentui/react-components";
import { useOfficeReady } from "../../components/Setup";

export default function Test() {

    const officeReady = useOfficeReady();
    const searchParams = useSearchParams();
    const data = JSON.parse(atob(searchParams.get("data") || ""));

    const [formData, setFormData] = useState();
    const formRef = useRef<AnnotationFormApi>(null);

    const Mustache = require("mustache");
    const [code, setCode] = useState<string | undefined>("");
    const [isFormVisible, setIsFormVisible] = useState(true);
    const [isOutputVisible, setIsOutputVisible] = useState(true);
    const [isJsonVisible, setIsJsonVisible] = useState(true);

    useEffect(() => {
        if (officeReady) Office.onReady(() => {
            Office.context.ui.addHandlerAsync(Office.EventType.DialogParentMessageReceived, onMessageFromParent);
        });
    }, [officeReady]);

    function onMessageFromParent(arg: any) {
        const messageFromParent = JSON.parse(arg.message);
        console.log(messageFromParent.name);
    }

    const renderOut = (code: string | undefined, view: any) => {
        try {
            return Mustache.render(code, view);
        } catch (error) {
            return <p>⚠️Something went wrong</p>;
        }
    };

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

        <div className={"border-blue-900 border-2 rounded-md py-2 px-2 flex space-x-4"}>
            <ToggleButton
                checked={isFormVisible}
                onClick={() => setIsFormVisible(!isFormVisible)}
            >
                Toggle Form
            </ToggleButton>
            <ToggleButton
                checked={isOutputVisible}
                onClick={() => setIsOutputVisible(!isOutputVisible)}
            >
                Toggle Output
            </ToggleButton>
            <ToggleButton
                checked={isJsonVisible}
                onClick={() => setIsJsonVisible(!isJsonVisible)}
            >
                Toggle JSON
            </ToggleButton>
        </div>
        <div className="flex space-x-2">
            {isOutputVisible && (
                <div className={"border-blue-900 border-2 rounded-md p-2 flex-1"}>{renderOut(code, formData)}</div>
            )}
            {isFormVisible && (
                <div className={"border-blue-900 border-2 rounded-md pb-2 px-2 flex-1"}>
                    <Form
                        formDescription={data?.formDescription ?? []}
                        ref={formRef}
                        onChange={(v) => {
                            console.log(v);
                            setFormData(v);
                        }}
                    />
                </div>
            )}
            {isJsonVisible && (
                <div className={"border-blue-900 border-2 rounded-md p-2 flex-1"}>
                    <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
                        <code className="text-sm">
                            {JSON.stringify(formData, null, 2)}
                        </code>
                    </pre>
                </div>
            )}
        </div>
    </div>);
}