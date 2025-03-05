import Form, {AnnotationFormApi} from "./Form";
import {Button} from "@fluentui/react-button";
import {useRef} from "react";
import {AnnotationType} from "../../lib/utils/annotations";
import {getDocumentSetting, setDocumentSetting} from "../../lib/settings-api/settings";


export const EditAnnotationType = ({annotationType}: {annotationType: AnnotationType}) => {
    const formApi = useRef<AnnotationFormApi>(null);

    const saveAnnotationType = async () => {
        const data = await formApi.current?.submit();
        if (!data) {
            console.error("Error getting AnnotationTypeData");
            return;
        }

        const prevAnnotationTypes = ((await getDocumentSetting('annotationTypes')) ?? []) as AnnotationType[]
        setDocumentSetting('annotationTypes', [...prevAnnotationTypes, data])
    }

    return <div className={"flex flex-col gap-2 items-start"}>
        <div className={"w-full"}><Form
            ref={formApi}
            formDescription={[
                {
                    id: "name",
                    type: "textInput",
                    label: "Annotation Type Name"
                },
                {
                    id: "formDescription",
                    type: "formElementSelector",
                    label: "Form Description",
                }
            ]} formData={annotationType}/></div>
        <Button onClick={saveAnnotationType}>
            Save Annotation Type
        </Button>
    </div>
}