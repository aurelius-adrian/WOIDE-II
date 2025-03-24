"use client";

import { useState } from "react";
import { ViewAnnotationTypes } from "../components/ViewAnnotationTypes";
import { AnnotationType } from "../../lib/utils/annotations";
import { EditAnnotationType } from "../components/EditAnnotationType";
import { Button } from "@fluentui/react-button";
import { AddRegular, ArrowReplyRegular } from "@fluentui/react-icons";
import { AddAnnotationForm } from "../components/AddAnnotationType";

export default function SettingsPage() {
  const [annotationType, setAnnotationType] = useState<AnnotationType | null>(
    null
  );
  const [isAddingAnnotationType, setIsAddingAnnotationType] = useState(false); // New state

  return (
    <>
      <div className={"text-xl font-bold"}>Settings</div>
      {annotationType ? (
        <>
          <div className={"-mb-3 -ml-3"}>
            <Button
              appearance={"transparent"}
              icon={<ArrowReplyRegular />}
              onClick={() => setAnnotationType(null)}
            >
              View Annotation Types
            </Button>
          </div>
          <EditAnnotationType
            annotationType={annotationType}
            setAnnotationType={setAnnotationType}
          />
        </>
      ) : isAddingAnnotationType ? (
        <>
          <div className={"mb-3 -ml-3"}>
            <Button
              appearance={"transparent"}
              icon={<ArrowReplyRegular />}
              onClick={() => setIsAddingAnnotationType(false)}
            >
              Back to Annotation Types
            </Button>
          </div>

          <AddAnnotationForm onClose={() => setIsAddingAnnotationType(false)} />
        </>
      ) : (
        <>
          <div className={"mb-5 mt-2"}>
            <Button
              icon={<AddRegular />}
              onClick={() => setIsAddingAnnotationType(true)}
            >
              Add Annotation Type
            </Button>
          </div>
          <ViewAnnotationTypes setAnnotationType={setAnnotationType} />
        </>
      )}
    </>
  );
}
