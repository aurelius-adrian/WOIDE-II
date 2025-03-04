import {useFieldArray, useFormContext} from "react-hook-form";
import {Accordion, AccordionHeader, AccordionItem, AccordionPanel, Label} from "@fluentui/react-components";
import {useId} from "react";
import {FormDescription, FormElementDescription} from "../Form";
import {Button} from "@fluentui/react-button";
import {AddFilled, DeleteRegular} from "@fluentui/react-icons";
import FormElement from "../FormElement";

export type SelectOptionsData = {
    value: string;
    label: string;
}

interface SelectOptionsProps {
    description: FormElementDescription
}

export const SelectOptions = ({description}: SelectOptionsProps) => {
    const id = useId();

    return <div className={"flex flex-col gap-0.5"}>
        <Label htmlFor={id}>
            {description.label}
        </Label>
        <Accordion collapsible>
            <SelectOption description={description}/>
        </Accordion>
    </div>
}

export default SelectOptions;

const SelectOption = ({description}: SelectOptionsProps) => {
    const {watch, control} = useFormContext();

    const {
        insert: insertFormElementField,
        append: appendFormElementField,
        remove: removeFormElementField,
    } = useFieldArray({
        control: control,
        name: description.id,
    });

    const getDescription = (path: string): FormDescription => {
        return [
            {
                id: `${path}.value`,
                label: "Value",
                type: "textInput",
            },
            {
                id: `${path}.label`,
                label: "Label",
                type: "textInput",
            }
        ];
    }

    const defaultEntryData = {value: "value", label: "Label"};

    const getItem = (e: SelectOptionsData, idx: number) => {
        return <AccordionItem key={idx} value={idx}>
            <AccordionHeader size={"medium"}>
                <div className="flex flex-row gap-2 items-center">
                    <code
                        className={"p-0.5 rounded-md bg-blue-900 border-blue-900 border-0.5 text-white text-xs"}>{e.value}</code>
                    <div className={""}>{e.label}</div>
                </div>
            </AccordionHeader>
            <AccordionPanel>
                <div className={"w-full flex flex-row -mb-2 gap-2"}>
                    <Button size={"small"} appearance={"outline"} onClick={() => insertFormElementField(idx, defaultEntryData)}
                            icon={<AddFilled/>}>Add Before</Button>
                    <Button size={"small"} appearance={"transparent"} onClick={() => removeFormElementField(idx)}
                            icon={<DeleteRegular/>}/>
                </div>
                {getDescription(`${description.id}.${idx}`).map((e, idx) => {
                        console.log(e);
                        return <FormElement key={idx} description={e}/>
                    }
                )}
            </AccordionPanel>
        </AccordionItem>
    }

    const data = watch(description.id);

    return <>
        <div className={"mb-4"}>
            {data && (data as unknown as SelectOptionsData[]).map(getItem)}
        </div>
        <Button onClick={() => appendFormElementField(defaultEntryData)}>
            Append Option
        </Button>
    </>
}