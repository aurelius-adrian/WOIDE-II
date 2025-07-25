import { useId } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Select as SelectComponent, Label } from "@fluentui/react-components";
import { FormElementDescription } from "../Form";
import { ImportantFieldIndicator } from "./ImportantFieldIndicator";

export type SelectProps = {
    description: FormElementDescription;
};

export const Select = ({ description }: SelectProps) => {
    const id = useId();
    const { control } = useFormContext();

    return (
        <div>
            <Controller
                control={control}
                name={description.id}
                rules={{
                    required: description.required ?? false,
                }}
                render={({ field }) => (
                    <div className={"flex flex-col gap-0.5"}>
                        <Label htmlFor={id} disabled={field.disabled}>
                            {description.label}
                            {description.required && <ImportantFieldIndicator />}
                        </Label>
                        <SelectComponent id={id} {...field}>
                            {description.options &&
                                description.options.map((e, idx) => (
                                    <option key={idx} value={e.value}>
                                        {e.label}
                                    </option>
                                ))}
                        </SelectComponent>
                    </div>
                )}
            />
        </div>
    );
};

export default Select;
