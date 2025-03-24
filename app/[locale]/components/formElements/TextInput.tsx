import { useId } from "react";
import { FormElementDescription } from "../Form";
import { Controller, useFormContext } from "react-hook-form";
import { Input, Label } from "@fluentui/react-components";

interface TextInputProps {
  description: FormElementDescription;
  disabled?: boolean;
}

export const TextInput = ({ description, disabled }: TextInputProps) => {
  const id = useId();
  const { control } = useFormContext();

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
            <Input
              id={id}
              disabled={disabled}
              type="text"
              {...field}
              value={field.value ?? ""}
            />
          </div>
        )}
      />
    </div>
  );
};

export default TextInput;
