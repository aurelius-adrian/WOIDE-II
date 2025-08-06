import { Button } from "@fluentui/react-button";
import React, { useEffect, useRef, useState } from "react";
import { Select as SelectComponent } from "@fluentui/react-select";
import { useOfficeReady } from "./Setup";
import { AnnotationType } from "../../lib/utils/annotations";
import { enqueueSnackbar } from "notistack";
import { getEmptyJSON } from "../../lib/annotation-api/annotations";
import { Divider, Label } from "@fluentui/react-components";
import { ExternalCatalog, ExternalCatalogData, GetExternalCatalog } from "../../lib/snify-api/catalog";
import { getDocumentSetting, setDocumentSetting } from "../../lib/settings-api/settings";
import { ArrowReplyRegular, DeleteRegular } from "@fluentui/react-icons";

export type ImportCatalogDialogProps = { open: boolean; onOpenChange: (v: boolean) => void };

export default function ImportCatalogDialog({ open, onOpenChange }: ImportCatalogDialogProps) {
    const officeReady = useOfficeReady();
    const [annotationTypes, setAnnotationTypes] = useState<AnnotationType[]>([]);
    const [externalCatalogs, setExternalCatalogs] = useState<ExternalCatalog[]>([]);
    const [globalDocumentData, setGlobalDocumentData] = useState<{ [key: string]: string }>({});
    const [selectedReferenceAnnotationTypeId, setSelectedReferenceAnnotationTypeId] = useState<string>("");
    const [dataTemplateData, setDataTemplateData] = useState<undefined | string>(undefined);

    const [fileName, setFileName] = useState<string | undefined>(undefined);
    const [importData, setImportData] = useState<undefined | ExternalCatalogData>(undefined);

    const dialog = useRef<Office.Dialog>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const _getData = async () => {
            setAnnotationTypes(((await getDocumentSetting("annotationTypes")) ?? []) as AnnotationType[]);
            setGlobalDocumentData((await getDocumentSetting("globalDocumentData")) ?? {});
            setExternalCatalogs((await getDocumentSetting("externalCatalogs")) ?? []);
        };

        if (officeReady) _getData();
    }, [officeReady, setAnnotationTypes]);

    function processDataTemplateDataMessage(arg: any) {
        try {
            const data = JSON.parse(arg.message)?.default;
            setDataTemplateData(data);
        } catch (e) {
            console.error("could not parse/save export template data: ", e);
            dialog.current?.messageChild("error");
            return;
        }
        dialog.current?.messageChild("success");
    }

    const openReferenceSettingDialog = () => {
        if (!importData?.entries || !importData.entries.length) {
            enqueueSnackbar("Upload external catalog first.", { variant: "error", autoHideDuration: 5000 });
            return;
        }

        if (selectedReferenceAnnotationTypeId === "") {
            enqueueSnackbar("Select a reference annotation type first.", { variant: "error", autoHideDuration: 5000 });
            return;
        }

        const aT = annotationTypes.find((e) => e.id === selectedReferenceAnnotationTypeId);
        if (!aT) {
            enqueueSnackbar("Select a valid reference annotation type first.", {
                variant: "error",
                autoHideDuration: 5000,
            });
            return;
        }

        const url = new URL("/templating", window.origin);
        url.searchParams.append(
            "data",
            btoa(
                JSON.stringify({
                    initData: importData.entries[0],
                    exportData: {
                        default: JSON.stringify(getEmptyJSON(aT)),
                    },
                    globalDocumentData,
                    singleLayer: true,
                    allowedMarkup: ["json"],
                }),
            ),
        );

        Office.context.ui.displayDialogAsync(
            url.href,
            {
                height: 80,
                width: 80,
                displayInIframe: false,
            },
            (res) => {
                dialog.current = res.value;
                dialog.current.addEventHandler(Office.EventType.DialogMessageReceived, processDataTemplateDataMessage);
            },
        );
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        try {
            setFileName(selectedFile.name);

            const fileContent = await selectedFile.text();
            const parsedData = JSON.parse(fileContent);

            if (
                !parsedData?.entries ||
                !Array.isArray(parsedData.entries) ||
                parsedData.entries.length === 0 ||
                !parsedData.entries[0].verb
            ) {
                throw new Error("Invalid file format. Please upload a valid catalog file.");
            }

            setImportData(parsedData);

            enqueueSnackbar({
                message: "entries imported successfully!",
                variant: "success",
                autoHideDuration: 2500,
            });
        } catch (err) {
            setFileName(undefined);
            enqueueSnackbar({
                message: err instanceof Error ? err.message : "Failed to import annotations.",
                variant: "error",
                autoHideDuration: 5000,
            });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const runImport = async () => {
        if (!importData?.entries || !importData.entries.length) {
            enqueueSnackbar("Upload external catalog first.", { variant: "error", autoHideDuration: 5000 });
            return;
        }

        if (!dataTemplateData) {
            enqueueSnackbar("Set data template first.", { variant: "error", autoHideDuration: 5000 });
            return;
        }

        if (!selectedReferenceAnnotationTypeId) {
            enqueueSnackbar("Select reference type ID first", { variant: "error", autoHideDuration: 5000 });
            return;
        }

        try {
            const res = await GetExternalCatalog(importData, selectedReferenceAnnotationTypeId, dataTemplateData);
            const _tmp = ((await getDocumentSetting("externalCatalogs")) || []) as ExternalCatalog[];
            _tmp.push({
                fileName: fileName ?? "unknown",
                created: Date.now().toString(),
                data: res,
            });
            await setDocumentSetting("externalCatalogs", _tmp);
            setExternalCatalogs(_tmp);
            enqueueSnackbar({
                message: "External catalog imported successfully!",
                variant: "success",
                autoHideDuration: 2500,
            });
        } catch (e) {
            console.error(e);
            enqueueSnackbar({
                message: "Failed to import annotations.",
                variant: "error",
                autoHideDuration: 5000,
            });
        }
    };

    const deleteCatalog = async (idx: number) => {
        try {
            const tmp = externalCatalogs.toSpliced(idx, 1);
            setExternalCatalogs(tmp);
            await setDocumentSetting("externalCatalogs", tmp);
        } catch (e) {
            console.error(e);
            enqueueSnackbar({
                message: "Failed to delete external catalog.",
                variant: "error",
                autoHideDuration: 5000,
            });
        }
    };

    return (
        <div>
            <div className={"font-bold text-xl"}>Manage External Catalogs</div>
            <div className={"-mb-3 -ml-3"}>
                <Button appearance={"transparent"} icon={<ArrowReplyRegular />} onClick={() => onOpenChange(false)}>
                    Return to Settings
                </Button>
            </div>
            <div className={"mt-4"}>Import new catalogs:</div>
            <div className="space-y-4 text-sm text-gray-800">
                <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                />
                <div className={"flex overflow-ellipsis"}>
                    <p className={"font-bold mr-2"}>File:</p>
                    {fileName ?? "No file uploaded"}
                </div>
                <div>
                    <Button onClick={() => fileInputRef.current?.click()}>Upload Catalog</Button>
                </div>
                <div className={"flex flex-col gap-0.5 mb-2"}>
                    <Label htmlFor={"referenceAnnotationTypeIdSelect"} disabled={false}>
                        Select Reference Annotation Type:
                    </Label>
                    <SelectComponent
                        id={"referenceAnnotationTypeIdSelect"}
                        onChange={(e) => setSelectedReferenceAnnotationTypeId(e.target.value)}
                        value={selectedReferenceAnnotationTypeId}
                        disabled={false}
                    >
                        <option disabled value={""}>
                            No Selection
                        </option>
                        {annotationTypes.map((e, idx) => (
                            <option key={idx} value={e.id}>
                                {e.name}
                            </option>
                        ))}
                    </SelectComponent>
                </div>
                <div>
                    <Button onClick={openReferenceSettingDialog}>Edit Reference Default Data</Button>
                </div>
            </div>
            <div className="flex space-x-2 pt-4">
                <Button appearance="primary" onClick={runImport}>
                    Apply & Import
                </Button>
                <Button appearance="secondary" onClick={() => onOpenChange(false)}>
                    Cancel
                </Button>
            </div>
            <Divider className={"mt-3"} />
            <div className={"mt-3"}>External Catalogs:</div>
            {externalCatalogs.map((e, idx) => (
                <div key={idx} className="flex space-x-2 w-full">
                    <div className={"flex flex-row justify-between items-center w-full"}>
                        <div className="flex flex-col gap-0.5">
                            <div className={"flex overflow-ellipsis"}>
                                <div className={"mr-1 font-bold"}>File Name:</div>
                                <p>{e.fileName}</p>
                            </div>
                            <div className={"flex overflow-ellipsis"}>
                                <div className={"font-bold mr-1"}>Created:</div>
                                <p>{e.created}</p>
                            </div>
                        </div>
                        <Button icon={<DeleteRegular />} onClick={() => deleteCatalog(idx)} />
                    </div>
                </div>
            ))}
        </div>
    );
}
