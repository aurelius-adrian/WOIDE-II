import { FormElementDescription } from "./Form";
import TextInput from "./formElements/TextInput";
import Select from "./formElements/Select";
import FormElementSelector from "./formElements/FormElementSelector";
import SelectOptions from "./formElements/SelectOptions";
import SelectAnnotationTypes from "./formElements/SelectAnnotationTypes";

interface FormElementProps {
  description: FormElementDescription;
  disabled?: boolean;
  currentAnnotationType?: string;
}

export const FormElement = ({
  description,
  disabled,
  currentAnnotationType,
}: FormElementProps) => {
  const renderElement = () => {
    switch (description.type) {
      case "textInput":
        return <TextInput description={description} disabled={disabled} />;
      case "select":
        return <Select description={description} />;
      case "selectOptions":
        return <SelectOptions description={description} />;
      case "formElementSelector":
        return (
          <FormElementSelector
            currentAnnotationType={currentAnnotationType}
            description={description}
          />
        );
      case "AnnotationTypes":
        return (
          <SelectAnnotationTypes
            description={description}
            currentAnnotationType={currentAnnotationType}
          />
        );
      default:
        return <div>Error Loading Element</div>;
    }
  };

  return <div className={"mt-3"}>{renderElement()}</div>;
};

export default FormElement;
