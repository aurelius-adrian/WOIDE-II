import { FormElementDescription } from "../Form";
import { Controller, useFormContext } from "react-hook-form";
import { Checkbox as _Checkbox } from "@fluentui/react-components";
import { RequiredLabel } from "./ImportantFieldIndicator";

interface CheckboxProps {
    description: FormElementDescription;
}

export const Checkbox = ({ description }: CheckboxProps) => {
    const { control } = useFormContext();
    return (
        <div>
            <Controller
                control={control}
                name={description.id}
                rules={{
                    required: description.required || false,
                }}
                render={({ field }) => (
                    <div className={"flex flex-col gap-0.5"}>
                        <_Checkbox
                            {...field}
                            checked={field.value || false}
                            label={<RequiredLabel required={description.required} label={description.label} />}
                        />
                    </div>
                )}
            />
        </div>
    );
};

export default Checkbox;
