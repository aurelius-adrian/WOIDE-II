"use client";

import { useState } from "react";
import { ViewAnnotationTypes } from "../../components/ViewAnnotationTypes";
import { AnnotationType } from "../../../lib/utils/annotations";
import { EditAnnotationType } from "../../components/EditAnnotationType";
import { Button } from "@fluentui/react-button";
import { ArrowReplyRegular } from "@fluentui/react-icons";

export default function SettingsPage() {
    const [annotationType, setAnnotationType] = useState<AnnotationType | null>(null);

    return (
        <>
            {annotationType ? (
                <>
                    <div className={"text-xl font-bold"}>Edit Annotation Type</div>
                    <div className={"-mb-3 -ml-3"}>
                        <Button
                            appearance={"transparent"}
                            icon={<ArrowReplyRegular />}
                            onClick={() => setAnnotationType(null)}
                        >
                            View Annotations
                        </Button>
                    </div>
                    <EditAnnotationType annotationType={annotationType} />
                </>
            ) : (
                <ViewAnnotationTypes setAnnotationType={setAnnotationType} />
            )}
        </>
    );
}
