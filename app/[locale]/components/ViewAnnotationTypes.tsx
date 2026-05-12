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
    Label,
    Radio,
    RadioGroup,
    Select as SelectComponent,
} from "@fluentui/react-components";
import { validateAnnotationTypes } from "./utils/AnnotationTypeValidation";
import { enqueueSnackbar } from "notistack";
import GlobalDocumentDataEditor from "./GlobalDocumentDataEditor";
import ImportCatalogDialog from "./ImportCatalogDialog";

type ImportResolution = {
    [name: string]: "replace" | "skip";
};

type WoideDomainPreset = {
    id: string;
    label: string;
    path: string;
};

const WOIDE_DOMAIN_PRESETS: WoideDomainPreset[] = [
    {
        id: "legal",
        label: "Legal",
        path: "/woide-presets/legal-woide.json",
    },
];

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
    const [selectedPresetId, setSelectedPresetId] = useState("");
    const [isLoadingPreset, setIsLoadingPreset] = useState(false);

    const dialog = useRef<Office.Dialog>();
    const [exportData, setExportData] = useState<{ [key: string]: string } | undefined>();

    const [showImportCatalogDialog, setShowImportCatalogDialog] = useState(false);

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

    const sanitizeImportedAnnotationTypes = (types: AnnotationType[]) =>
        types.map((type) => ({
            ...type,
            name: type.name?.trim() || `Unnamed Type ${v4().slice(0, 4)}`,
            description: type.description?.trim() || "",
            formDescription: type.formDescription.map((el) => ({
                ...el,
                options: el.type === "select" ? (el as any).options || [] : undefined,
            })),
        }));

    const resolveImportedAnnotationTypes = (types: AnnotationType[], resolutions: ImportResolution = {}) => {
        const existingByName = new Map(annotationTypes.map((t) => [t.name.toLowerCase(), t]));
        const importedBySourceId = new Map(
            types.filter((type) => type.id).map((type) => [type.id as string, type] as const),
        );
        const targetIdByName = new Map<string, string>();

        types.forEach((type) => {
            const normalizedName = type.name.toLowerCase();
            const existing = existingByName.get(normalizedName);
            const resolution = resolutions[type.name];

            if (existing && (resolution === "replace" || resolution === "skip")) {
                targetIdByName.set(normalizedName, existing.id as string);
                return;
            }

            targetIdByName.set(normalizedName, v4());
        });

        const remapLinkedAnnotationId = (id?: string) => {
            if (!id) {
                return undefined;
            }

            const importedType = importedBySourceId.get(id);
            if (!importedType) {
                return id;
            }

            return targetIdByName.get(importedType.name.toLowerCase()) ?? id;
        };

        const remapAllowedParents = (allowedParents: AnnotationType["allowedParents"]) => {
            if (!allowedParents) {
                return allowedParents;
            }

            const remappedAllowedParents: NonNullable<AnnotationType["allowedParents"]> = {};

            Object.entries(allowedParents).forEach(([layer, value]) => {
                if (value === undefined) {
                    remappedAllowedParents[layer] = undefined;
                    return;
                }

                if (value === "any") {
                    remappedAllowedParents[layer] = "any";
                    return;
                }

                remappedAllowedParents[layer] = value
                    .map((parentId) => remapLinkedAnnotationId(parentId))
                    .filter((parentId): parentId is string => !!parentId);
            });

            return remappedAllowedParents;
        };

        return types
            .filter((type) => {
                const existing = existingByName.get(type.name.toLowerCase());
                return !(existing && resolutions[type.name] === "skip");
            })
            .map((type) => ({
                ...type,
                id: targetIdByName.get(type.name.toLowerCase()) ?? v4(),
                referenceAnnotationTypeId: remapLinkedAnnotationId(type.referenceAnnotationTypeId),
                allowedParents: remapAllowedParents(type.allowedParents),
            }));
    };

    const importAnnotationTypesFromPayload = async (parsedData: unknown, successMessage: string) => {
        const rawAnnotationTypes = Array.isArray(parsedData)
            ? parsedData
            : ((parsedData as { annotationTypes?: unknown[] })?.annotationTypes ?? []);

        if (rawAnnotationTypes.length === 0) {
            throw new Error("No annotation types found in the file.");
        }

        const { isValid, error, validatedData } = validateAnnotationTypes(rawAnnotationTypes);
        if (!isValid || !validatedData) {
            throw new Error(error || "Invalid annotation types format.");
        }

        const processedAnnotationTypes = sanitizeImportedAnnotationTypes(validatedData);

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

        const resolvedImportedTypes = resolveImportedAnnotationTypes(processedAnnotationTypes);
        const merged = [...annotationTypes, ...resolvedImportedTypes];
        await setDocumentSetting("annotationTypes", merged);
        setAnnotationTypes(merged);
        enqueueSnackbar({
            message: successMessage,
            variant: "success",
            autoHideDuration: 2500,
        });
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = event.target.files?.[0];
        if (!selectedFile) return;

        try {
            const fileContent = await selectedFile.text();
            const parsedData = JSON.parse(fileContent);
            await importAnnotationTypesFromPayload(
                parsedData,
                `${Array.isArray(parsedData) ? parsedData.length : parsedData.annotationTypes?.length || 0} annotation types imported successfully!`,
            );
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

    const handleLoadPreset = async () => {
        if (!selectedPresetId) {
            enqueueSnackbar({
                message: "Select a domain preset first.",
                variant: "warning",
                autoHideDuration: 2500,
            });
            return;
        }

        const preset = WOIDE_DOMAIN_PRESETS.find((entry) => entry.id === selectedPresetId);
        if (!preset) {
            enqueueSnackbar({
                message: "Could not find the selected domain preset.",
                variant: "error",
                autoHideDuration: 2500,
            });
            return;
        }

        setIsLoadingPreset(true);
        try {
            const response = await fetch(preset.path);
            if (!response.ok) {
                throw new Error(`Failed to load the ${preset.label} preset.`);
            }
            const parsedData = await response.json();
            const count = Array.isArray(parsedData) ? parsedData.length : parsedData.annotationTypes?.length || 0;
            await importAnnotationTypesFromPayload(parsedData, `Loaded the ${preset.label} preset (${count} types).`);
        } catch (err) {
            enqueueSnackbar({
                message: err instanceof Error ? err.message : "Failed to load domain preset.",
                variant: "error",
                autoHideDuration: 2500,
            });
        } finally {
            setIsLoadingPreset(false);
        }
    };

    const handleResolutionComplete = async () => {
        try {
            const resolvedImportedTypes = resolveImportedAnnotationTypes(pendingImport, importResolution);
            const importedNames = new Set(resolvedImportedTypes.map((type) => type.name.toLowerCase()));
            const untouchedExistingTypes = annotationTypes.filter((type) => !importedNames.has(type.name.toLowerCase()));
            const finalTypes = [...untouchedExistingTypes, ...resolvedImportedTypes];

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

    return showImportCatalogDialog ? (
        <ImportCatalogDialog
            open={showImportCatalogDialog}
            onOpenChange={() => setShowImportCatalogDialog(!showImportCatalogDialog)}
        />
    ) : (
        <div>
            <div className={"text-xl font-bold"}>Settings</div>
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

            <div className={"mb-2"}>snify Catalogs:</div>
            <div className={"mb-2"}>
                <Button onClick={() => setShowImportCatalogDialog(true)}>Manage/Import External Catalog</Button>
            </div>

            <div className={"mb-2"}>Domain Presets:</div>
            <div className="mb-4 flex flex-col gap-2">
                <div className="flex min-w-64 flex-col gap-0.5">
                    <Label htmlFor="woide-domain-preset">Domain-specific WOIDE version</Label>
                    <SelectComponent
                        id="woide-domain-preset"
                        value={selectedPresetId}
                        onChange={(event) => setSelectedPresetId(event.target.value)}
                    >
                        <option value="">Select a preset</option>
                        {WOIDE_DOMAIN_PRESETS.map((preset) => (
                            <option key={preset.id} value={preset.id}>
                                {preset.label}
                            </option>
                        ))}
                    </SelectComponent>
                </div>
                <Button className="w-fit" onClick={handleLoadPreset} disabled={!selectedPresetId || isLoadingPreset}>
                    {isLoadingPreset ? "Loading..." : "Load Preset"}
                </Button>
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
