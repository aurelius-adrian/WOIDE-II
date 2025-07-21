import { FormElementDescription } from "./Form";
import TextInput from "./formElements/TextInput";
import Select from "./formElements/Select";
import FormElementSelector from "./formElements/FormElementSelector";
import SelectOptions from "./formElements/SelectOptions";
import SelectAnnotation from "./formElements/SelectAnnotation";
import ColorPicker from "./formElements/ColorPicker";

interface FormElementProps {
    description: FormElementDescription;
}

export const FormElement = ({ description }: FormElementProps) => {
    const renderElement = () => {
        switch (description.type) {
            case "textInput":
                return <TextInput description={description} />;
            case "select":
                return <Select description={description} />;
            case "selectOptions":
                return <SelectOptions description={description} />;
            case "formElementSelector":
                return <FormElementSelector description={description} />;
            case "selectAnnotation":
                return <SelectAnnotation description={description} />;
            case "colorPicker":
                return <ColorPicker description={description} />;
            default:
                return <div>Error Loading Element</div>;
        }
    };

    return <div className={"mt-3"}>{renderElement()}</div>;
};

export default FormElement;
