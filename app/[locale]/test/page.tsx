'use client'
import Editor from "@monaco-editor/react";
import {useEffect, useState} from "react";

export default function Test() {
    const Mustache = require('mustache');
    const [code, setCode] = useState<string | undefined>('');

    useEffect(() => {
        Office.onReady(() => {
            Office.context.ui.addHandlerAsync(Office.EventType.DialogParentMessageReceived,onMessageFromParent);
        });
    }, []);

    function onMessageFromParent(arg: any) {
        const messageFromParent = JSON.parse(arg.message);
        console.log(messageFromParent.name);
    }

    const view = {
        title: "Joe",
        test: 1,
        calc: (offs: string) => (2 + 4 - Number(offs))
    };

    const renderOut = (code: string | undefined, view: any) => {
        try {
            return Mustache.render(code, view);
        } catch (error) {
            return <p>⚠️Something went wrong</p>
        }
    }

    return (<>
    <div className={"h-96"}>
            <Editor
                height="100%"
                language="html"
                theme="light"
                value={code}
                options={{
                    lineNumbers: "on",
                    formatOnType: true,
                    minimap: {
                        scale: 1,
                        size: "proportional",
                        maxColumn: 200,
                    },
                }}
                onChange={(s) => setCode(s)}
            /></div>
        {renderOut(code, view)}
    </>)
}