import React, { forwardRef, useImperativeHandle } from "react";
import { FormProvider, SubmitHandler, useForm } from "react-hook-form";
import FormElement from "./FormElement";
import { FormElementSelectorData } from "./formElements/FormElementSelector";
import { SelectOptionsData } from "./formElements/SelectOptions";

export type FormElementTypes =
  | "textInput"
  | "formElementSelector"
  | "select"
  | "selectOptions"
  | "AnnotationTypes";
export type FormFieldData =
  | string
  | FormElementSelectorData
  | SelectOptionsData[];

export type FormElementDescription = {
  id: string;
  label: string;
  type: FormElementTypes;
  options?: { value: string; label: string }[];
};

export type FormDescription = FormElementDescription[];

export type FormData = {
  [key: string]: FormFieldData;
};

export type AnnotationFormApi = {
  submit: () => Promise<FormData | null>;
};

export const Form = forwardRef<
  AnnotationFormApi,
  {
    formDescription: FormDescription;
    formData?: FormData;
    onChange?: (e: any) => void;
    formMode?: string;
    currentAnnotationType?: string;
  }
>(
  (
    { formDescription, formData, onChange, formMode, currentAnnotationType },
    ref
  ) => {
    const methods = useForm({
      defaultValues: formData,
    });
    const { handleSubmit } = methods;

    useImperativeHandle(ref, () => ({
      submit: async () => {
        let ret = null;
        await methods.handleSubmit((data) => (ret = data))();
        return ret;
      },
    }));

    const onSubmit: SubmitHandler<any> = (data) => {
      console.log(data);
    };

    return (
      <>
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} onChange={onChange}>
            <div className={"flex flex-col"}>
              {formDescription.map((e, i) => {
                return (
                  <FormElement
                    key={i}
                    description={e}
                    disabled={formMode === "edit" && e.id === "name"}
                    currentAnnotationType={currentAnnotationType}
                  />
                );
              })}
            </div>
          </form>
        </FormProvider>
      </>
    );
  }
);

Form.displayName = "Form";
export default Form;
