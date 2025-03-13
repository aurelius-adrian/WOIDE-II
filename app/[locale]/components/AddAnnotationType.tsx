import React, { useState, useEffect } from "react";
import { Form } from "./Form";
import { Button } from "@fluentui/react-button";
import { AnnotationType, FormElementTypes, FormDescription, FormData } from "./Form"; // Make sure the path is correct

export const EditAnnotationType = ({
  annotationType,
  onSave,
}: {
  annotationType: AnnotationType;
  onSave: (updatedAnnotation: AnnotationType) => void;
}) => {
  const [formDescription, setFormDescription] = useState<FormDescription>(annotationType.formDescription || []);
  const [annotationName, setAnnotationName] = useState(annotationType.name || "");

  // Update form description if the passed annotationType changes
  useEffect(() => {
    setAnnotationDescription(annotationType.formDescription);
    setAnnotationName(annotationType.name);
  }, [annotationType]);

  // Function to dynamically add a new field to the formDescription array
  const addField = (type: FormElementTypes) => {
    const newField: FormElementDescription = {
      id: `id${formDescription.length}`,
      label: `${type} Label`,
      type: type,
    };

    if (type === "select" || type === "selectOptions") {
      newField.options = [{ value: "value1", label: "Option 1" }];
    }

    setFormDescription([...formDescription, newField]);
  };

  const handleSave = async (formData: FormData | null) => {
    if (!formData) return;

    const updatedAnnotation: AnnotationType = {
      ...annotationType,  // Retain other properties of the annotation
      name: annotationName,  // Update the name
      formDescription: formDescription,  // Update the formDescription
    };

    onSave(updatedAnnotation);  // Pass the updated annotation to the parent
  };

  return (
    <div>
      <h2>Edit Annotation Type</h2>

      {/* Annotation Name Input */}
      <input
        type="text"
        value={annotationName}
        onChange={(e) => setAnnotationName(e.target.value)}
        placeholder="Annotation Name"
      />

      {/* Form for Dynamic Fields */}
      <Form
        formDescription={formDescription}
        onChange={(e) => console.log(e)} // Optional, to track changes
        formData={{}}  // Pass initial empty data
        ref={null}  // We don't need a ref here for submitting the form
      />

      {/* Buttons to Add Different Types of Fields */}
      <Button onClick={() => addField("textInput")}>Add Text Input</Button>
      <Button onClick={() => addField("select")}>Add Select Field</Button>
      <Button onClick={() => addField("formElementSelector")}>Add Form Element Selector</Button>

      {/* Save Button */}
      <Button onClick={async () => await handleSave({})}>
        Save Updated Annotation Type
      </Button>
    </div>
  );
};
