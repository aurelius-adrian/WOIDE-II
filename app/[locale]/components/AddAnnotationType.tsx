import Form, { AnnotationFormApi } from "./Form";
import { Button } from "@fluentui/react-button";
import { useRef, useState } from "react";
import { AnnotationType } from "../../lib/utils/annotations";
import {
  setDocumentSetting,
  getAllDocumentSettings,
} from "../../lib/settings-api/settings";
import ErrorMessage from "./ErrorMessage";

interface AddAnnotationFormProps {
  onClose: () => void;
}

export const AddAnnotationForm = ({ onClose }: AddAnnotationFormProps) => {
  const [annotationType, setAnnotationType] = useState<AnnotationType | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formApi = useRef<AnnotationFormApi>(null);

  const handleSave = async () => {
    try {
      const formData = await formApi.current?.submit();
      const existingSettings = await getAllDocumentSettings();
      if (formData && formData.name) {
        const trimmedName = String(formData.name).replace(/\s+/g, "");
        if (existingSettings[trimmedName]) {
          setErrorMessage(
            "* An annotation type with this name already exists."
          );
          return;
        }
        const annotationTypeData = {
          ...formData,
          id: trimmedName,
        };
        await setDocumentSetting(trimmedName, annotationTypeData);
        console.log("Annotation Type saved successfully:", annotationTypeData);
        setAnnotationType(null);
        onClose();
      } else {
        setErrorMessage(
          "* Invalid form data. Please fill out all required fields."
        );
      }
    } catch (error) {
      console.error("Failed to save annotation type:", error);
      setErrorMessage("* An error occurred while saving the annotation type.");
    }
  };

  return (
    <>
      {errorMessage && <ErrorMessage errorMessage={errorMessage} />}
      <div
        className={"flex flex-col gap-2 items-start border p-4 rounded shadow"}
      >
        <div className={"w-full"}>
          <Form
            ref={formApi}
            formMode="add"
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
          />
        </div>

        <Button onClick={handleSave}>Save Annotation Type</Button>
      </div>
    </>
  );
};
