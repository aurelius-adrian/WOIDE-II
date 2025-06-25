import React, { useId } from "react";
import { FormElementDescription } from "../Form";
import { Controller, useFormContext } from "react-hook-form";
import { Input, Label } from "@fluentui/react-components";
import { Button } from "@fluentui/react-button";
import { getAnnotationsInSelection } from "../../../lib/annotation-api/annotations";
import { enqueueSnackbar } from "notistack";
import { timedHighlightAnnotationID } from "../../../lib/annotation-api/navigation";
import { EyeFilled, InfoRegular } from "@fluentui/react-icons";
import { useTranslations } from "next-intl";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from "@fluentui/react-accordion";
import { ImportantFieldIndicator } from "./ImportantFieldIndicator";

interface TextInputProps {
  description: FormElementDescription;
}

export const TextInput = ({ description }: TextInputProps) => {
  const t = useTranslations("form.selectAnnotation");

  const id = useId();
  const { control } = useFormContext();

  const select = async (onChange: (...event: any[]) => void) => {
    const annotations = await getAnnotationsInSelection();
    if (annotations.length === 0) {
      enqueueSnackbar({
        message: "Selection did not contain annotations",
        variant: "error",
        autoHideDuration: 5000,
      });
    }
    onChange(annotations[0].id);
    enqueueSnackbar({
      message: "Found annotations: " + annotations.map((e) => e.id),
      variant: "success",
      autoHideDuration: 2000,
    });
  };

  const highlight = (id: string | undefined) => {
    if (!id) return;
    timedHighlightAnnotationID(id, 5000);
  };

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
            <Accordion collapsible={true} className={"-ml-3"}>
              <AccordionItem value="1">
                <AccordionHeader
                  expandIconPosition="end"
                  expandIcon={<InfoRegular />}
                  className={"h-7"}
                >
                  <Label htmlFor={id} disabled={field.disabled}>
                    {description.label}
                    {description.required && <ImportantFieldIndicator />}
                  </Label>
                </AccordionHeader>
                <AccordionPanel>
                  <div className={"mt-2"}>{t("notice")}</div>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
            <div className={"flex flex-row gap-x-0.5 py-2"}>
              <Button onClick={() => select(field.onChange)}>
                {t("select")}
              </Button>
              <Button
                onClick={() => highlight(field.value)}
                appearance={"transparent"}
                icon={<EyeFilled />}
              />
            </div>
            <Input id={id} type="text" {...field} value={field.value ?? ""} />
          </div>
        )}
      />
    </div>
  );
};

export default TextInput;
