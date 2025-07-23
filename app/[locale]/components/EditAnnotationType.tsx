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

export const EditAnnotationType = ({ annotationType }: { annotationType: AnnotationType }) => {
    const formApi = useRef<AnnotationFormApi>(null);
    const [tmpId, setTmpId] = useState<string | null>(null);
    const [exportData, setExportData] = useState<{ [key: string]: string } | undefined>(annotationType.exportData);
    const [annotationTypes, setAnnotationTypes] = useState<AnnotationType[]>([]);
    const [selectedReferenceAnnotationTypeId, setSelectedReferenceAnnotationTypeId] = useState<string>(
        annotationType.referenceAnnotationTypeId ?? "",
    );
    const [enableSniffy, setEnableSniffy] = useState<boolean>(annotationType.enableSniffy ?? false);
    const [dataTemplateData, setDataTemplateData] = useState<undefined | string>(annotationType.referenceDataTemplate);
    const officeReady = useOfficeReady();

    const dialog = useRef<Office.Dialog>();

    useEffect(() => {
        const _getData = async () => {
            setAnnotationTypes(((await getDocumentSetting("annotationTypes")) ?? []) as AnnotationType[]);
        };

        if (officeReady) _getData();
    }, [officeReady, setAnnotationTypes]);

    useEffect(() => {
        setTmpId(annotationType.id ?? v4());
    }, [annotationType]);

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
            const data = JSON.parse(arg.message);
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
                        default: JSON.stringify(getEmptyJSON(aT)),
                    },
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
                    formData={annotationType as Omit<AnnotationType, "enableSniffy">}
                />
            </div>
            <div>
                <Button onClick={openExportSettingDialog}>Edit Export Settings</Button>
            </div>
            <Divider />
            <div>
                <Checkbox
                    label="Enable Sniffy"
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
            <div className={"flex flex-row space-x-2"}>
                <Button onClick={() => saveAnnotationType()}>Save Annotation Type</Button>
                <Button onClick={deleteAnnotationType}>Delete Annotation Type</Button>
            </div>
        </div>
    );
};
