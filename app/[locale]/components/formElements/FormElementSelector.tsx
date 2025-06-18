import { useFieldArray, useFormContext } from "react-hook-form";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
  Label,
} from "@fluentui/react-components";
import { useId } from "react";
import {
  ExternalFormElementTypesList,
  FormDescription,
  FormElementDescription,
  FormElementTypes,
} from "../Form";
import { Button } from "@fluentui/react-button";
import { AddFilled, DeleteRegular } from "@fluentui/react-icons";
import FormElement from "../FormElement";

export type FormElementSelectData = {
  type: FormElementTypes;
  label: string;
};

export type FormElementSelectorData = FormElementSelectData[];

interface FormElementSelectorProps {
  description: FormElementDescription;
}

export const FormElementSelector = ({
  description,
}: FormElementSelectorProps) => {
  const id = useId();

  return (
    <div className={"flex flex-col gap-0.5"}>
      <Label htmlFor={id}>{description.label}</Label>
      <Accordion collapsible>
        <FormElementSelect description={description} />
      </Accordion>
    </div>
  );
};

export default FormElementSelector;

const FormElementSelect = ({ description }: FormElementSelectorProps) => {
  const { watch, control } = useFormContext();

  const {
    insert: insertFormElementField,
    append: appendFormElementField,
    remove: removeFormElementField,
  } = useFieldArray({
    control: control,
    name: description.id,
  });

  type mapType = { [key: string]: FormDescription };

  const getDescription = (path: string, type: string): FormDescription => {
    const defaultElements: FormDescription = [
      {
        id: `${path}.type`,
        label: "Type",
        type: "select",
        options: ExternalFormElementTypesList.map((e) => ({
          label: e, // TODO use translation
          value: e,
        })),
        required: true,
      },
      {
        id: `${path}.id`,
        label: "ID",
        type: "textInput",
        required: true,
      },
      {
        id: `${path}.label`,
        label: "Label",
        type: "textInput",
        required: true,
      },
    ];

    const elementsDescription: mapType = {
      textInput: defaultElements,
      select: [
        ...defaultElements,
        {
          id: `${path}.options`,
          label: "Options",
          type: "selectOptions",
          required: true,
        },
      ],
      selectAnnotation: [
        ...defaultElements,
        {
          id: `${path}.allowedAnnotationTypes`,
          label: "Erlaubter Annotations Typ",
          type: "select",
          required: true,
          options: [
            {
              label: "Alle",
              value: "",
            },
            ...ExternalFormElementTypesList.map((e) => ({
              label: e, // TODO use translation
              value: e,
            })),
          ],
        },
      ],
    };
    return elementsDescription[type];
  };
  const defaultEntryData = {
    type: "textInput",
    label: "Label",
    required: true,
  };

  const getItem = (e: FormElementSelectData, idx: number) => {
    return (
      <AccordionItem key={idx} value={idx}>
        <AccordionHeader size={"medium"}>
          <div className="flex flex-row gap-2 items-center">
            <code
              className={
                "p-0.5 rounded-md bg-blue-900 border-blue-900 border-0.5 text-white text-xs"
              }
            >
              {e.type}
            </code>
            <div className={""}>{e.label}</div>
          </div>
        </AccordionHeader>
        <AccordionPanel>
          <div className={"w-full flex flex-row -mb-2 gap-2"}>
            <Button
              size={"small"}
              appearance={"outline"}
              onClick={() => insertFormElementField(idx, defaultEntryData)}
              icon={<AddFilled />}
            >
              Add Before
            </Button>
            <Button
              size={"small"}
              appearance={"transparent"}
              onClick={() => removeFormElementField(idx)}
              icon={<DeleteRegular />}
            />
          </div>
          {getDescription(`${description.id}.${idx}`, e.type).map((e, idx) => {
            console.log(e);
            return <FormElement key={idx} description={e} />;
          })}
        </AccordionPanel>
      </AccordionItem>
    );
  };
  const data = watch(description.id);

  return (
    <>
      <div className={"mb-4"}>
        {data && (data as unknown as FormElementSelectData[]).map(getItem)}
      </div>
      <Button onClick={() => appendFormElementField(defaultEntryData)}>
        Append Element
      </Button>
    </>
  );
};
