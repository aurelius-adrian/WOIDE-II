import Editor from "@monaco-editor/react";
import { cn } from "../../lib/utils/tailwind";
import { Button } from "@fluentui/react-button";
import { useEffect, useState } from "react";
import { enqueueSnackbar } from "notistack";
import { useDarkModeContext } from "./Setup";

interface GlobalDocumentDataEditorProps {
    data: any;
    setData: (data: any) => void | Promise<void>;
    className?: string;
}

export default function GlobalDocumentDataEditor({ data, setData, className = "" }: GlobalDocumentDataEditorProps) {
    const [value, setValue] = useState<string | undefined>(JSON.stringify(data, null, 2));
    const { darkMode } = useDarkModeContext();

    useEffect(() => {
        setValue(JSON.stringify(data, null, 2));
    }, [data]);

    const onChange = async (value: string | undefined) => {
        if (!value) {
            await setData("");
            enqueueSnackbar("Saved Data", { autoHideDuration: 2000, variant: "success" });
            return;
        }

        if (JSON.stringify(data, null, 2) === value) {
            enqueueSnackbar("Data Unchanged", { autoHideDuration: 2000 });
            return;
        }

        try {
            console.log("data: ", value);
            await setData(JSON.parse(value));
            enqueueSnackbar("Saved Data", { autoHideDuration: 2000, variant: "success" });
        } catch (e) {
            console.debug(e);
            enqueueSnackbar("Invalid JSON", { autoHideDuration: 5000, variant: "error" });
        }
    };

    return (
        <div className={cn("h-36 flex flex-col space-y-2", className)}>
            <Editor
                value={value}
                onChange={setValue}
                className={"flex-grow"}
                language={"json"}
                theme={darkMode ? "vs-dark" : "light"}
            />
            <div className={"flex-grow-0"}>
                <Button onClick={() => onChange(value)} className={"h-8"}>
                    Save Data
                </Button>
            </div>
        </div>
    );
}
