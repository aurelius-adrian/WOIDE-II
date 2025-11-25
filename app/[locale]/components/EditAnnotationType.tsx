import Form, { AnnotationFormApi } from "./Form";
import { Button } from "@fluentui/react-button";
import { Checkbox, Divider, Label } from "@fluentui/react-components";
import { useEffect, useRef, useState } from "react";
import { AnnotationType } from "../../lib/utils/annotations";
import { getDocumentSetting, setDocumentSetting } from "../../lib/settings-api/settings";
import { v4 } from "uuid";
import { enqueueSnackbar } from "notistack";
import { Select as SelectComponent } from "@fluentui/react-select";
import { useOfficeReady } from "./Setup";
import { getEmptyJSON } from "../../lib/annotation-api/annotations";
import { getAllExportLayers } from "../../lib/settings-api/settings";


export const EditAnnotationType = ({ annotationType }: { annotationType: AnnotationType }) => {
    const formApi = useRef<AnnotationFormApi>(null);
    const [tmpId, setTmpId] = useState<string | null>(null);
    const [exportData, setExportData] = useState<{ [key: string]: string } | undefined>(annotationType.exportData);
    const [allowedParents, setAllowedParents] = useState<AnnotationType["allowedParents"]>(annotationType.allowedParents ?? {});
    const [exportLayers, setExportLayers] = useState<string[]>([]);
    const [annotationTypes, setAnnotationTypes] = useState<AnnotationType[]>([]);
    const [globalDocumentData, setGlobalDocumentData] = useState<{ [key: string]: string }>({});
    const [selectedReferenceAnnotationTypeId, setSelectedReferenceAnnotationTypeId] = useState<string>(
        annotationType.referenceAnnotationTypeId ?? "",
    );
    const [enableSniffy, setEnableSniffy] = useState<boolean>(annotationType.enableSniffy ?? false);
    const [dataTemplateData, setDataTemplateData] = useState<undefined | string>(annotationType.referenceDataTemplate);
    const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
    const [currentSelections, setCurrentSelections] = useState<string[]>([]);
    const [isSelectAll, setIsSelectAll] = useState(false);
    const officeReady = useOfficeReady();

    const dialog = useRef<Office.Dialog>();

    useEffect(() => {
        const _getData = async () => {
            setAnnotationTypes(((await getDocumentSetting("annotationTypes")) ?? []) as AnnotationType[]);
            setGlobalDocumentData((await getDocumentSetting("globalDocumentData")) ?? {});
        };

        if (officeReady) _getData();
    }, [officeReady, setAnnotationTypes]);

    useEffect(() => {
        setTmpId(annotationType.id ?? v4());
    }, [annotationType]);

    useEffect(() => {
        const _getData = async () => {
            setExportLayers(await getAllExportLayers());
            setAnnotationTypes((await getDocumentSetting<AnnotationType[]>("annotationTypes")) ?? []);
        };
        _getData();
    }, []);

    const handleAllowedParentsChange = (layer: string, value: string[]) => {
        setAllowedParents((prev) => ({
            ...prev,
            [layer]: value.includes("any") ? "any" : value,
        }));
    };

    const saveAnnotationType = async (_exportData?: unknown, _dataTemplateData?: unknown) => {
        try {
            const data = await formApi.current?.submit();
            const hasMissingId =
                data?.formDescription && Object.values(data?.formDescription).some((field) => !field.id);

            if (!data || hasMissingId) {
                enqueueSnackbar({
                    message: "Complete the form to add annotation type.",
                    variant: "error",
                    autoHideDuration: 5000,
                });
                return;
            }
            if (selectedLayer) {
                saveLayerSelections(selectedLayer, currentSelections, isSelectAll);
                }

            const prevAnnotationTypes = ((await getDocumentSetting("annotationTypes")) ?? []) as AnnotationType[];
            const idx = prevAnnotationTypes.findIndex((e) => e.id === tmpId);
            if (idx !== -1) {
                setDocumentSetting(
                    "annotationTypes",
                    prevAnnotationTypes.with(idx, {
                        ...data,
                        exportData: _exportData || exportData,
                        id: tmpId,
                        enableSniffy: enableSniffy,
                        referenceAnnotationTypeId:
                            selectedReferenceAnnotationTypeId === "" ? undefined : selectedReferenceAnnotationTypeId,
                        referenceDataTemplate: _dataTemplateData || dataTemplateData,
                        allowedParents,
                    } as AnnotationType),
                );
            } else {
                setDocumentSetting("annotationTypes", [
                    ...prevAnnotationTypes,
                    {
                        ...data,
                        exportData: _exportData || exportData,
                        id: tmpId,
                        enableSniffy: enableSniffy,
                        referenceAnnotationTypeId:
                            selectedReferenceAnnotationTypeId === "" ? undefined : selectedReferenceAnnotationTypeId,
                        referenceDataTemplate: _dataTemplateData || dataTemplateData,
                        allowedParents
                    },
                ]);
            }
            enqueueSnackbar({
                message: "Saving Annotation Successful.",
                variant: "success",
                autoHideDuration: 2000,
            });
        } catch (error) {
            console.error(error);
            enqueueSnackbar({
                message: "Saving Annotation Type Failed.",
                variant: "error",
                autoHideDuration: 5000,
            });
        }
    };

    const deleteAnnotationType = async () => {
        try {
            const prevAnnotationTypes = ((await getDocumentSetting("annotationTypes")) ?? []) as AnnotationType[];
            setDocumentSetting(
                "annotationTypes",
                prevAnnotationTypes.filter((e) => e.id !== annotationType.id),
            );
            enqueueSnackbar({
                message: "Deleting Annotation Successful.",
                variant: "success",
                autoHideDuration: 2000,
            });
        } catch (e) {
            enqueueSnackbar({
                message: "Deleting Annotation Type Failed.",
                variant: "error",
                autoHideDuration: 5000,
            });
        }
    };

    function processExportDataMessage(arg: any) {
        try {
            const data = JSON.parse(arg.message);
            setExportData(data);
            saveAnnotationType(data);
        } catch (e) {
            console.error("could not parse/save export template data: ", e);
            dialog.current?.messageChild("error");
            return;
        }
        dialog.current?.messageChild("success");
    }

    function processDataTemplateDataMessage(arg: any) {
        try {
            const data = JSON.parse(arg.message)?.default;
            setDataTemplateData(data);
            saveAnnotationType(undefined, data);
        } catch (e) {
            console.error("could not parse/save export template data: ", e);
            dialog.current?.messageChild("error");
            return;
        }
        dialog.current?.messageChild("success");
    }

    const openExportSettingDialog = () => {
        const url = new URL("/templating", window.origin);
        url.searchParams.append(
            "data",
            btoa(
                JSON.stringify({
                    ...formApi.current?.getFormData(),
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
                dialog.current.addEventHandler(Office.EventType.DialogMessageReceived, processExportDataMessage);
            },
        );
    };

    const openReferenceSettingDialog = () => {
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
                    ...formApi.current?.getFormData(),
                    exportData: {
                        default: dataTemplateData || JSON.stringify(getEmptyJSON(aT)),
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
// Save current layer’s state into allowedParents when switching layers
const saveLayerSelections = (layer: string, selections: string[], selectAll: boolean) => {
  setAllowedParents((prev) => ({
    ...prev,
    [layer]: selectAll ? "any" : selections,
  }));
};

const handleLayerChange = (newLayer: string) => {
  if (selectedLayer) {
    saveLayerSelections(selectedLayer, currentSelections, isSelectAll);
  }

  setSelectedLayer(newLayer);

  const layerData = allowedParents?.[newLayer];
  if (layerData === "any") {
    setIsSelectAll(true);
    setCurrentSelections([]);
  } else {
    setIsSelectAll(false);
    setCurrentSelections((layerData as string[]) ?? []);
  }
};

const toggleSelectAll = () => {
  const newValue = !isSelectAll;
  setIsSelectAll(newValue);
  if (newValue) {
    setCurrentSelections([]);
  }
};

const handleCheckboxChange = (annotationId: string) => {
  setCurrentSelections((prev) =>
    prev.includes(annotationId)
      ? prev.filter((id) => id !== annotationId)
      : [...prev, annotationId],
  );
};

    return (
        <div className={"flex flex-col gap-2 items-start"}>
            <div className={"w-full"}>
                <Form
                    ref={formApi}
                    formDescription={[
                        {
                            id: "name",
                            type: "textInput",
                            label: "Annotation Type Name",
                            required: true,
                        },
                        {
                            id: "formDescription",
                            type: "formElementSelector",
                            label: "Form Description",
                            required: true,
                        },
                        {
                            id: "color",
                            type: "colorPicker",
                            label: "Annotation Type Color",
                            required: true,
                        },
                    ]}
                    formData={annotationType as Omit<AnnotationType, "enableSniffy" | "allowedParents">}
                />
            </div>
            <div>
                <Button onClick={openExportSettingDialog}>Edit Export Settings</Button>
            </div>
            <Divider />
            <div>
                <Checkbox
                    label="Enable Snify"
                    checked={enableSniffy}
                    onChange={(e, data) => {
                        setEnableSniffy(!!data.checked);
                    }}
                />
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
            <Divider />
               {/* <div className="mt-4">
                <h4>Allowed Parents (per export layer)</h4>
                {exportLayers.map((layer) => (
                    <div key={layer} className="mb-2">
                        <Label>{layer}</Label>
                        <SelectComponent
                            multiple
                            value={
                                allowedParents?.[layer] === "any"
                                    ? ["any"]
                                    : (allowedParents?.[layer] as string[]) ?? []
                            }
                            onChange={(e) => {
                                const options = Array.from(e.target.selectedOptions).map((o) => o.value);
                                handleAllowedParentsChange(layer, options);
                            }}
                        >
                            <option value="any">Any</option>
                            {annotationTypes
                                .filter((t) => t.id !== annotationType.id)
                                .map((t) => (
                                    <option key={t.id} value={t.id}>
                                        {t.name}
                                    </option>
                                ))}
                        </SelectComponent>
                    </div>
                ))}
            </div> */}
            <div className="mt-4 w-full">
  <h4 className="text-lg font-semibold mb-2">Allowed Parents (per export layer)</h4>

  <div className="flex flex-row gap-2 items-center mb-4">
    <Label>Select Export Layer:</Label>
    <SelectComponent
      value={selectedLayer || ""}
      onChange={(e) => handleLayerChange(e.target.value)}
    >
      <option value="" disabled>
        Select a layer
      </option>
      {exportLayers.map((layer) => (
        <option key={layer} value={layer}>
          {layer}
        </option>
      ))}
    </SelectComponent>
  </div>

  {selectedLayer && (
    <div className="flex flex-col gap-2 border rounded-lg p-3 bg-gray-50">
      <div className="flex items-center gap-2">
        <Checkbox
          checked={isSelectAll}
          onChange={toggleSelectAll}
          label="Select All (Any)"
        />
      </div>

      {!isSelectAll && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mt-2 max-h-60 overflow-y-auto">
          {annotationTypes
            .filter((t) => t.id !== annotationType.id)
            .map((t) => (
              <label
                key={t.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
              >
                <input
                  type="checkbox"
                  checked={currentSelections.includes(t.id!)}
                  onChange={() => handleCheckboxChange(t.id!)}
                />
                <span>{t.name}</span>
              </label>
            ))}
        </div>
      )}
    </div>
  )}
</div>

            
            <div className={"flex flex-row space-x-2"}>
                <Button onClick={() => saveAnnotationType()}>Save Annotation Type</Button>
                <Button onClick={deleteAnnotationType}>Delete Annotation Type</Button>
            </div>
        </div>
    );
};
