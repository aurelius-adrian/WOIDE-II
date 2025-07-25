import { AnnotationType } from "../../lib/utils/annotations";
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel } from "@fluentui/react-accordion";
import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Button } from "@fluentui/react-button";
import { AddFilled, ArrowDownloadFilled, ArrowUploadFilled, EditRegular } from "@fluentui/react-icons";
import { getDocumentSetting, setDocumentSetting } from "../../lib/settings-api/settings";
import { useOfficeReady } from "./Setup";
import { v4 } from "uuid";
import {
    Dialog,
    DialogActions,
    DialogBody,
    DialogContent,
    DialogSurface,
    DialogTitle,
    Radio,
    RadioGroup,
} from "@fluentui/react-components";
import { validateAnnotationTypes } from "./utils/AnnotationTypeValidation";
import { enqueueSnackbar } from "notistack";
import GlobalDocumentDataEditor from "./GlobalDocumentDataEditor";

type ImportResolution = {
    [name: string]: "replace" | "skip";
};
export const ViewAnnotationTypes = ({
    setAnnotationType,
}: {
    setAnnotationType: Dispatch<SetStateAction<AnnotationType | null>>;
}) => {
    const [annotationTypes, setAnnotationTypes] = useState<AnnotationType[]>([]);
    const [duplicates, setDuplicates] = useState<{ original: AnnotationType; imported: AnnotationType }[]>([]);
    const [importResolution, setImportResolution] = useState<ImportResolution>({});
    const [showResolutionDialog, setShowResolutionDialog] = useState(false);
    const [pendingImport, setPendingImport] = useState<AnnotationType[]>([]);
    const [globalDocumentData, setGlobalDocumentData] = useState<{ [key: string]: string }>({});
    const officeReady = useOfficeReady();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const dialog = useRef<Office.Dialog>();
    const [exportData, setExportData] = useState<{ [key: string]: string } | undefined>();

    useEffect(() => {
        const _getData = async () => {
            setAnnotationTypes(((await getDocumentSetting("annotationTypes")) ?? []) as AnnotationType[]);
            setExportData(
                ((await getDocumentSetting("documentExportSettings")) ?? { default: "{{{getInnerHTML}}}" }) as {
                    [key: string]: string;
                },
            );
            setGlobalDocumentData((await getDocumentSetting("globalDocumentData")) ?? {});
        };

        if (officeReady) _getData();
    }, [officeReady, setAnnotationTypes, setGlobalDocumentData]);

    const openDialog = () => {
        const url = new URL("/templating", window.origin);
        url.searchParams.append(
            "data",
            btoa(
                JSON.stringify({
                    formDescription: [],
                    exportData,
                    globalDocumentData,
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
                dialog.current.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
            },
        );
    };

    async function processMessage(arg: any) {
        try {
            const data = JSON.parse(arg.message);
            await setDocumentSetting("documentExportSettings", data);
            setExportData(data);
        } catch (e) {
            console.error("could not parse/save export template data: ", e);
            dialog.current?.messageChild("error");
            return;
        }
        dialog.current?.messageChild("success");
        enqueueSnackbar({
            message: "Saved Document Export Settings.",
            variant: "success",
            autoHideDuration: 2000,
        });
    }

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        try {
            const fileContent = await selectedFile.text();
            const parsedData = JSON.parse(fileContent);

            const rawAnnotationTypes = Array.isArray(parsedData) ? parsedData : parsedData.annotationTypes || [];

            if (rawAnnotationTypes.length === 0) {
                throw new Error("No annotation types found in the file.");
            }

            // Validate
            const { isValid, error, validatedData } = validateAnnotationTypes(rawAnnotationTypes);
            if (!isValid || !validatedData) {
                throw new Error(error || "Invalid annotation types format.");
            }

            // Clean + re-ID
            const processedAnnotationTypes = validatedData.map((type) => ({
                ...type,
                id: v4(),
                name: type.name?.trim() || `Unnamed Type ${v4().slice(0, 4)}`,
                description: type.description?.trim() || "",
                formDescription: type.formDescription.map((el) => ({
                    ...el,
                    options: el.type === "select" ? (el as any).options || [] : undefined,
                })),
            }));

            // Check for duplicates
            const existingMap = new Map(annotationTypes.map((t) => [t.name.toLowerCase(), t]));
            const duplicates = processedAnnotationTypes.filter((t) => existingMap.has(t.name.toLowerCase()));

            if (duplicates.length > 0) {
                const defaultResolutions = Object.fromEntries(duplicates.map((t) => [t.name, "replace" as const]));

                setImportResolution(defaultResolutions);
                setDuplicates(
                    duplicates.map((d) => ({
                        original: existingMap.get(d.name.toLowerCase())!,
                        imported: d,
                    })),
                );
                setPendingImport(processedAnnotationTypes);
                setShowResolutionDialog(true);
                return;
            }

            // No duplicates: merge and save
            const merged = [...annotationTypes, ...processedAnnotationTypes];
            await setDocumentSetting("annotationTypes", merged);
            setAnnotationTypes(merged);
            enqueueSnackbar({
                message: `${processedAnnotationTypes.length} annotation types imported successfully!`,
                variant: "success",
                autoHideDuration: 2500,
            });
        } catch (err) {
            enqueueSnackbar({
                message: err instanceof Error ? err.message : "Failed to import annotations.",
                variant: "error",
                autoHideDuration: 2500,
            });
        } finally {
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleResolutionComplete = async () => {
        try {
            const updatedTypes = [...annotationTypes];

            duplicates.forEach(({ original, imported }) => {
                const resolution = importResolution[imported.name];

                switch (resolution) {
                    case "replace":
                        {
                            const index = updatedTypes.findIndex((t) => t.id === original.id);
                            if (index >= 0) {
                                updatedTypes[index] = imported;
                            }
                        }
                        break;

                    case "skip":
                        break;
                }
            });

            // Add non-duplicate types
            const duplicateNames = new Set(duplicates.map((d) => d.imported.name.toLowerCase()));
            const nonDuplicates = pendingImport.filter((type) => !duplicateNames.has(type.name.toLowerCase()));

            const finalTypes = [...updatedTypes, ...nonDuplicates];
            await setDocumentSetting("annotationTypes", finalTypes);
            setAnnotationTypes(finalTypes);

            // Reset state
            setShowResolutionDialog(false);
            setDuplicates([]);
            setPendingImport([]);
            setImportResolution({});
            enqueueSnackbar({
                message: "Successfully imported annotation types!",
                variant: "success",
                autoHideDuration: 2500,
            });
        } catch (error) {
            enqueueSnackbar({
                message: "Failed to complete the import process",
                variant: "error",
                autoHideDuration: 2500,
            });
        }
    };

    const handleExportClick = () => {
        if (annotationTypes.length === 0) {
            enqueueSnackbar({
                message: "No annotation types to export",
                variant: "warning",
                autoHideDuration: 2500,
            });
            return;
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `export-annotations-${timestamp}.json`;
        const data = {
            annotationTypes: annotationTypes,
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        enqueueSnackbar({
            message: `Exported ${annotationTypes.length} annotation types to ${filename}`,
            variant: "success",
            autoHideDuration: 2500,
        });
    };

    return (
        <div>
            <div className={"mb-2"}>Document Export Settings:</div>
            <div className={"mb-2"}>
                <Button onClick={openDialog}>Edit Export Settings</Button>
            </div>
            <div className={"mb-4"}>
                <GlobalDocumentDataEditor
                    data={globalDocumentData}
                    setData={async (value) => {
                        const _value = value === "" ? {} : value;
                        setGlobalDocumentData(_value);
                        console.log(_value);
                        await setDocumentSetting("globalDocumentData", _value);
                    }}
                />
            </div>

            <div className={"mb-2"}>Annotation Types:</div>
            <div className="flex gap-2 mb-4 justify-between">
                <Button
                    icon={<AddFilled />}
                    onClick={() =>
                        setAnnotationType({
                            formDescription: [],
                            name: "New Annotation Type",
                            exportData: {},
                            color: "",
                        } as AnnotationType)
                    }
                >
                    Add
                </Button>
                <Button icon={<ArrowUploadFilled />} onClick={handleUploadClick} aria-label="Import from JSON">
                    Import
                </Button>
                <Button icon={<ArrowDownloadFilled />} onClick={handleExportClick} aria-label="Export to JSON">
                    Export
                </Button>

                <input
                    type="file"
                    accept=".json"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{ display: "none" }}
                />
            </div>

            <Dialog open={showResolutionDialog} onOpenChange={(_, data) => setShowResolutionDialog(data.open)}>
                <DialogSurface>
                    <DialogBody>
                        <DialogTitle>Duplicate Annotation Types</DialogTitle>

                        <DialogContent className="space-y-4 text-sm text-gray-800">
                            <p>
                                Some annotation types you are trying to import already exist. Please choose how you
                                would like to handle each:
                            </p>

                            <div className="max-h-96 overflow-y-auto space-y-6">
                                {duplicates.map(({ original, imported }, index) => (
                                    <div key={index} className="border border-gray-200 rounded-lg p-4 shadow-sm">
                                        <label className="block font-medium text-gray-900 mb-2">
                                            Conflict: <span className="italic text-blue-600">{original.name}</span>
                                        </label>

                                        <RadioGroup
                                            value={importResolution[imported.name] || "replace"}
                                            onChange={(_, data) =>
                                                setImportResolution({
                                                    ...importResolution,
                                                    [imported.name]: data.value as "replace" | "skip",
                                                })
                                            }
                                        >
                                            <div className="flex gap-6">
                                                <Radio value="replace" label="Replace" />
                                                <Radio value="skip" label="Keep" />
                                            </div>
                                        </RadioGroup>

                                        <div className="mt-3 text-xs text-gray-600 space-y-1">
                                            <div>
                                                <strong>Existing:</strong>{" "}
                                                {original.description?.trim() || <em>No description</em>}
                                            </div>
                                            <div>
                                                <strong>Imported:</strong>{" "}
                                                {imported.description?.trim() || <em>No description</em>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>

                        <DialogActions className="pt-4">
                            <Button appearance="primary" onClick={handleResolutionComplete}>
                                Apply & Import
                            </Button>
                            <Button onClick={() => setShowResolutionDialog(false)} appearance="secondary">
                                Cancel
                            </Button>
                        </DialogActions>
                    </DialogBody>
                </DialogSurface>
            </Dialog>

            <Accordion collapsible>
                {annotationTypes.map((e: AnnotationType, idx: number) => (
                    <AccordionItem key={idx} value={idx}>
                        <AccordionHeader>{e.name}</AccordionHeader>
                        <AccordionPanel>
                            <div className={"mb-2"}>
                                <code
                                    className={
                                        "p-0.5 rounded-md bg-blue-900 border-blue-900 border-0.5 text-white text-xs"
                                    }
                                >{`id: ${e.id}`}</code>
                            </div>
                            <div className={"mb-2"}>{e.description || "No description provided"}</div>
                            <Button icon={<EditRegular />} onClick={() => setAnnotationType(e)}>
                                Edit
                            </Button>
                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </Accordion>
        </div>
    );
};
