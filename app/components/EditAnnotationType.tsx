import Form, {AnnotationFormApi} from "./Form";
import {Button} from "@fluentui/react-button";
import {useRef} from "react";
import {AnnotationType} from "../lib/utils/annotations";


export const EditAnnotationType = ({annotationType}: {annotationType: AnnotationType}) => {
    const formApi = useRef<AnnotationFormApi>(null);

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
        <Button onClick={() => console.log(formApi.current?.submit())}>
            Save Annotation Type
        </Button>
    </div>
}