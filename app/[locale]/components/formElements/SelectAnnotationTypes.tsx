import { useId, useEffect, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Select as SelectComponent, Label } from "@fluentui/react-components";
import { FormElementDescription } from "../Form";
import { getAllDocumentSettings } from "../../../lib/settings-api/settings"; // Adjust the relative path if needed

export type SelectAnnotationTypes = {
  description: FormElementDescription;
  currentAnnotationType?: String;
};

export const SelectAnnotationTypes = ({
  description,
  currentAnnotationType,
}: SelectAnnotationTypes) => {
  const id = useId();
  const { control } = useFormContext();
  const [annotationTypes, setAnnotationTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnotationTypes = async () => {
      try {
        const allSettings = await getAllDocumentSettings();

        let types = Object.keys(allSettings);
        if (currentAnnotationType) {
          types = types.filter((type) => type !== currentAnnotationType);
        }
        setAnnotationTypes(types);
      } catch (error) {
        console.error("Failed to fetch annotation types:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnotationTypes();
  }, [currentAnnotationType]);

  return (
    <div>
      <Controller
        control={control}
        name={description.id}
        render={({ field }) => (
          <div className={"flex flex-col gap-0.5"}>
            <Label htmlFor={id} disabled={field.disabled}>
              {description.label}
            </Label>
            {loading ? (
              <span>Loading...</span>
            ) : annotationTypes.length > 0 ? (
              <SelectComponent
                id={id}
                {...field}
                defaultValue={
                  !currentAnnotationType ? "selectorOption" : undefined
                }
              >
                {!currentAnnotationType && (
                  <option value="selectorOption" disabled>
                    Select an Annotation Type
                  </option>
                )}
                {annotationTypes.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </SelectComponent>
            ) : (
              <span>Add an annotation type first before selecting.</span>
            )}
          </div>
        )}
      />
    </div>
  );
};

export default SelectAnnotationTypes;
