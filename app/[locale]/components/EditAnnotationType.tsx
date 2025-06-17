import Form, { AnnotationFormApi } from "./Form";
import { Button } from "@fluentui/react-button";
import { useEffect, useRef, useState } from "react";
import { AnnotationType } from "../../lib/utils/annotations";
import { getDocumentSetting, setDocumentSetting } from "../../lib/settings-api/settings";
import { v4 } from "uuid";
import { enqueueSnackbar } from "notistack";

export const EditAnnotationType = ({
                                       annotationType,
                                   }: {
    annotationType: AnnotationType;
}) => {
    const formApi = useRef<AnnotationFormApi>(null);
    const [tmpId, setTmpId] = useState<string | null>(null);
    const [exportData, setExportData] = useState<{ [key: string]: string } | undefined>(annotationType.exportData);

    const dialog = useRef<Office.Dialog>();

    useEffect(() => {
        setTmpId(annotationType.id ?? v4());
    }, [annotationType]);

    const saveAnnotationType = async (_exportData?: unknown) => {
        try {
            const data = await formApi.current?.submit();
            if (!data) {
                console.error("Error getting AnnotationTypeData");
                return;
            }

            const prevAnnotationTypes = ((await getDocumentSetting(
                "annotationTypes",
            )) ?? []) as AnnotationType[];
            const idx = prevAnnotationTypes.findIndex((e) => e.id == tmpId);
            if (idx != -1) {
                setDocumentSetting(
                    "annotationTypes",
                    prevAnnotationTypes.with(idx, {
                        ...data,
                        exportData: _exportData || exportData,
                        id: tmpId,
                    } as AnnotationType),
                );
            } else {
                setDocumentSetting("annotationTypes", [
                    ...prevAnnotationTypes,
                    {
                        ...data,
                        exportData: _exportData || exportData,
                        id: tmpId,
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
            const prevAnnotationTypes = ((await getDocumentSetting(
                "annotationTypes",
            )) ?? []) as AnnotationType[];
            setDocumentSetting(
                "annotationTypes",
                prevAnnotationTypes.filter((e) => e.id != annotationType.id),
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

    function processMessage(arg: any) {
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

    const openDialog = () => {
        Office.context.ui.displayDialogAsync(`https://localhost:3050/templating?data=${btoa(JSON.stringify({
            ...formApi.current?.getFormData(),
            exportData,
        }))}`, {
            height: 80,
            width: 80,
            displayInIframe: false,
        }, (res) => {
            dialog.current = res.value;
            dialog.current.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);
        });
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
                        },
                        {
                            id: "formDescription",
                            type: "formElementSelector",
                            label: "Form Description",
                        },
                    ]}
                    formData={annotationType}
                />
            </div>
            <div>
                <Button onClick={openDialog}>
                    Edit Export Settings
                </Button>
            </div>
            <div className={"flex flex-row space-x-2"}>
                <Button onClick={saveAnnotationType}>Save Annotation Type</Button>
                <Button onClick={deleteAnnotationType}>Delete Annotation Type</Button>
            </div>
        </div>
    );
};
