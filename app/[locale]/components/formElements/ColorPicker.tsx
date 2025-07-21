import React, { useId } from "react";
import { FormElementDescription } from "../Form";
import { Controller, useFormContext } from "react-hook-form";
import { Label } from "@fluentui/react-components";

interface ColorPickerProps {
    description: FormElementDescription;
}

export const ColorPicker = ({ description }: ColorPickerProps) => {
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
                    <div className="flex items-center gap-4 mb-4">
                        <div className="relative size-4">
                            <input
                                type="color"
                                id={id}
                                value={field.value ?? ""}
                                onChange={(e) => field.onChange(e.target.value)}
                                className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div
                                className="w-full h-full rounded-full shadow border border-gray-300"
                                style={{ backgroundColor: field.value ?? "" }}
                            />
                        </div>
                        <Label htmlFor={id} className="font-medium">
                            Select Annotation Color
                        </Label>
                    </div>
                )}
            />
        </div>
    );
};

export default ColorPicker;
