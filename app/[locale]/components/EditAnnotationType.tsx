import Form, { AnnotationFormApi } from "./Form";
import { Button } from "@fluentui/react-button";
import { useRef } from "react";
import { AnnotationType } from "../../lib/utils/annotations";
import { setDocumentSetting } from "../../lib/settings-api/settings";

export const EditAnnotationType = ({
  annotationType,
  setAnnotationType,
}: {
  annotationType: AnnotationType;
  setAnnotationType: (annotationType: AnnotationType | null) => void;
}) => {
  const formApi = useRef<AnnotationFormApi>(null);

  const handleSave = async () => {
    try {
      const formData = await formApi.current?.submit();
      if (formData && formData.name) {
        const trimmedName = String(formData.name).replace(/\s+/g, "");
        await setDocumentSetting(trimmedName, formData);
        console.log("Annotation Type saved successfully:", formData);
        setAnnotationType(null);
      } else {
        console.error("Invalid form data:", formData);
      }
    } catch (error) {
      console.error("Failed to save annotation type:", error);
    }
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
          formMode="edit"
          currentAnnotationType={annotationType.id}
        />
      </div>
      <Button onClick={handleSave}>Save Annotation Type</Button>
    </div>
  );
};
