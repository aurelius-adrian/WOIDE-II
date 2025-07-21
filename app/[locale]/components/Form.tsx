import React, { forwardRef, useImperativeHandle } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import FormElement from "./FormElement";
import { FormElementSelectorData } from "./formElements/FormElementSelector";
import { SelectOptionsData } from "./formElements/SelectOptions";

export const ExternalFormElementTypesList = ["textInput", "select", "selectAnnotation", "colorPicker"] as const;
export const InternalFormElementTypesList = ["formElementSelector", "selectOptions"] as const;
export const FormElementTypesList = [...ExternalFormElementTypesList, ...InternalFormElementTypesList] as const;
export type FormElementTypes = (typeof FormElementTypesList)[number];
export type FormFieldData =
    | string
    | FormElementSelectorData
    | SelectOptionsData[]
    | { [key: string]: string | undefined };

export type FormElementDescription = {
    id: string;
    label: string;
    type: FormElementTypes;
    options?: { value: string; label: string }[]; // select
    allowedAnnotationTypes?: string[]; // selectAnnotation
    required?: boolean; // textInput, select, selectAnnotation
};

export type FormDescription = FormElementDescription[];

export type FormData = {
    [key: string]: FormFieldData;
};

export type AnnotationFormApi = {
    submit: () => Promise<FormData | null>;
    getFormData: () => FormData;
    reset: () => void;
    update: (data: FormData) => void;
};

export const Form = forwardRef<
    AnnotationFormApi,
    {
        formDescription: FormDescription;
        formData?: FormData;
        onChange?: (e: any) => void;
    }
>(({ formDescription, formData, onChange }, ref) => {
    const methods = useForm({
        defaultValues: formData,
    });
    const { handleSubmit, getValues } = methods;

    useImperativeHandle(ref, () => ({
        submit: async () => {
            let ret = null;
            await methods.handleSubmit((data) => (ret = data))();
            return ret;
        },
        reset: () => {
            methods.reset();
        },
        update: (data: FormData) => {
            methods.reset(data);
        },
        getFormData: () => {
            return getValues();
        },
    }));

    const onSubmit: SubmitHandler<any> = (data) => {
        console.debug(data);
    };

    const onChangeWrapper = () => {
        if (onChange) onChange(getValues());
    };

    return (
        <>
            <FormProvider {...methods}>
                <form onSubmit={handleSubmit(onSubmit)} onChange={onChangeWrapper}>
                    <div className={"flex flex-col"}>
                        {formDescription.map((e, i) => (
                            <FormElement key={i} description={e} />
                        ))}
                    </div>
                </form>
            </FormProvider>
        </>
    );
});

Form.displayName = "Form";
export default Form;
