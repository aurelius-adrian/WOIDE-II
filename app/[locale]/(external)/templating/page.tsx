"use client";
import Editor from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Form, { AnnotationFormApi } from "../../components/Form";
import { ToggleButton } from "@fluentui/react-components";
import { Select } from "@fluentui/react-select";
import { useId } from "@fluentui/react-utilities";
import { useDarkModeContext, useOfficeReady } from "../../components/Setup";
import { AddRegular, DeleteRegular, SaveRegular } from "@fluentui/react-icons";
import { Button } from "@fluentui/react-button";
import { enqueueSnackbar } from "notistack";

export default function TemplateRenderer() {
    const officeReady = useOfficeReady();
    const searchParams = useSearchParams();
    const data = JSON.parse(atob(searchParams.get("data") || ""));
    const { darkMode } = useDarkModeContext();

    const [_formData, _setFormData] = useState(data.initData);
    const formData = {
        ...(data.globalDocumentData || {}),
        ...(_formData || {}),
        getInnerHTML: () => "{inner HTML}",
        getChildrenEval: () => "{children eval}",
    };
    const formRef = useRef<AnnotationFormApi>(null);

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const Mustache = require("mustache");
    const [exportLayers, setExportLayers] = useState<{
        [key: string]: string;
    }>({ default: "", ...(data.exportData || {}) });
    const [selectedCodeKey, setSelectedCodeKey] = useState<string>("default");
    const [editingKeyValue, setEditingKeyValue] = useState<undefined | string>(undefined);
    const [isFormVisible, setIsFormVisible] = useState(true);
    const [isOutputVisible, setIsOutputVisible] = useState(true);
    const [isJsonVisible, setIsJsonVisible] = useState(true);
    const [language, setLanguage] = useState<string>(data?.allowedMarkup?.length ? data?.allowedMarkup[0] : "html");

    const selectId = useId();
    const selectId1 = useId();

    useEffect(() => {
        if (officeReady)
            Office.onReady(() => {
                Office.context.ui.addHandlerAsync(Office.EventType.DialogParentMessageReceived, onMessageFromParent);
            });
    }, [officeReady]);

    function onMessageFromParent(arg: any) {
        if (arg.message === "success") {
            enqueueSnackbar("Export Settings Changed", { variant: "success", autoHideDuration: 2000 });
        } else {
            enqueueSnackbar("An Error Occurred", { variant: "error", autoHideDuration: 5000 });
        }
    }

    const renderOut = (code: string | undefined, view: any) => {
        try {
            return Mustache.render(code, view);
        } catch (error) {
            return <p>⚠️Something went wrong</p>;
        }
    };

    const handleCodeChange = (newCode: string | undefined) => {
        setExportLayers((prev) => ({
            ...prev,
            [selectedCodeKey]: newCode || "",
        }));
    };

    const handleKeySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCodeKey(e.target.value);
    };

    const handleDeleteLayer = () => {
        if (editingKeyValue !== undefined) {
            setEditingKeyValue(undefined);
        } else setExportLayers((prev) => ({ ...prev, [selectedCodeKey]: undefined }) as { [key: string]: string });
    };

    const addNewCodeState = () => {
        if (editingKeyValue !== undefined) {
            setExportLayers((prev) => ({
                ...prev,
                [editingKeyValue]: "",
            }));
            setEditingKeyValue(undefined);
        } else setEditingKeyValue("");
    };

    const handleSaveAllLayers = () => {
        Office.context.ui.messageParent(JSON.stringify(exportLayers));
    };

    return (
        <div className={"space-y-2"}>
            <div className={"flex items-center space-x-4"}>
                <label htmlFor={selectId} className={"font-medium"}>
                    {editingKeyValue === undefined ? "Selected Export Layer:" : "New Layer Name:"}
                </label>
                {editingKeyValue !== undefined ? (
                    <input
                        type="text"
                        value={editingKeyValue}
                        onChange={(e) => setEditingKeyValue(e.target.value)}
                        className="flex-1 border rounded px-2 py-1"
                        autoFocus
                    />
                ) : (
                    <Select
                        id={selectId}
                        value={selectedCodeKey}
                        onChange={handleKeySelection}
                        className={"flex-1"}
                        disabled={data?.singleLayer}
                    >
                        {Object.keys(exportLayers).map((key) => (
                            <option key={key} value={key}>
                                {key}
                            </option>
                        ))}
                    </Select>
                )}
                {!data?.singleLayer && (
                    <Button
                        onClick={handleDeleteLayer}
                        disabled={exportLayers[selectedCodeKey] === undefined && editingKeyValue === undefined}
                        appearance="secondary"
                        icon={editingKeyValue === undefined ? <DeleteRegular /> : undefined}
                    >
                        {editingKeyValue === undefined ? "Delete" : "Cancel"}
                    </Button>
                )}
                {!data?.singleLayer && (
                    <Button
                        onClick={addNewCodeState}
                        appearance="primary"
                        icon={editingKeyValue === undefined ? <AddRegular /> : undefined}
                    >
                        {editingKeyValue === undefined ? "Add new Layer" : "Save"}
                    </Button>
                )}
            </div>

            <div className={"h-96 border-blue-900 border-2 rounded-md pt-2 pb-10"}>
                <Select
                    id={selectId1}
                    value={language}
                    onChange={(e) => {
                        setLanguage(e.target.value);
                    }}
                    className={"mb-2 px-2"}
                >
                    {(!data?.allowedMarkup || data.allowedMarkup.includes("html")) && (
                        <option value={"html"}>HTML</option>
                    )}
                    {(!data?.allowedMarkup || data.allowedMarkup.includes("json")) && (
                        <option value={"json"}>JSON</option>
                    )}
                    {(!data?.allowedMarkup || data.allowedMarkup.includes("typescript")) && (
                        <option value={"typescript"}>typescript</option>
                    )}
                </Select>
                <Editor
                    height="100%"
                    language={language}
                    theme={darkMode ? "vs-dark" : "light"}
                    value={exportLayers[selectedCodeKey] || ""}
                    options={{
                        lineNumbers: "on",
                        formatOnType: true,
                    }}
                    onChange={handleCodeChange}
                />
            </div>

            <div className={"py-2 px-2 flex space-x-4"}>
                <Button icon={<SaveRegular />} onClick={handleSaveAllLayers} appearance={"primary"}>
                    Save All Layers
                </Button>
                <ToggleButton checked={isFormVisible} onClick={() => setIsFormVisible(!isFormVisible)}>
                    Toggle Form
                </ToggleButton>
                <ToggleButton checked={isOutputVisible} onClick={() => setIsOutputVisible(!isOutputVisible)}>
                    Toggle Output
                </ToggleButton>
                <ToggleButton checked={isJsonVisible} onClick={() => setIsJsonVisible(!isJsonVisible)}>
                    Toggle JSON
                </ToggleButton>
            </div>
            <div className="flex space-x-2">
                {isOutputVisible && (
                    <div className={"border-blue-900 border-2 rounded-md p-2 flex-1"}>
                        {renderOut(exportLayers[selectedCodeKey], formData)}
                    </div>
                )}
                {isFormVisible && (
                    <div className={"border-blue-900 border-2 rounded-md pb-2 px-2 flex-1"}>
                        <Form
                            formDescription={data?.formDescription ?? []}
                            ref={formRef}
                            onChange={(v) => {
                                _setFormData(v);
                            }}
                        />
                    </div>
                )}
                {isJsonVisible && (
                    <div className={"border-blue-900 border-2 rounded-md p-2 flex-1"}>
                        <div className="mb-2">Available Keys/Test Values:</div>
                        <pre className="bg-gray-100 dark:bg-black p-4 rounded-lg overflow-auto whitespace-pre-wrap break-words">
                            <code className="text-sm">{JSON.stringify(_formData, null, 2)}</code>
                        </pre>
                        <div className="my-2">Available Functions:</div>
                        <pre className="bg-gray-100 dark:bg-black p-4 rounded-lg overflow-auto whitespace-pre-wrap break-words">
                            <code className="text-sm">
                                {"getInnerHTML: Gets the HTML content within the annotation and evaluates all " +
                                    "children with the same layer key returning the export result." +
                                    "\n\n" +
                                    "getChildrenEval: Evaluates all children with the same layer key " +
                                    "returning the export result."}
                            </code>
                        </pre>
                        {data.globalDocumentData && (
                            <>
                                <div className="my-2">Global Document Data:</div>
                                <pre className="bg-gray-100 dark:bg-black p-4 rounded-lg overflow-auto whitespace-pre-wrap break-words">
                                    <code className="text-sm">{JSON.stringify(data.globalDocumentData, null, 2)}</code>
                                </pre>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
