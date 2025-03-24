import { AnnotationType } from "../../lib/utils/annotations";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from "@fluentui/react-accordion";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Button } from "@fluentui/react-button";
import { DeleteRegular, EditRegular } from "@fluentui/react-icons";
import {
  deleteAllDocumentSettings,
  getAllDocumentSettings,
  deleteDocumentSetting,
} from "../../lib/settings-api/settings";

export const ViewAnnotationTypes = ({
  setAnnotationType,
}: {
  setAnnotationType: Dispatch<SetStateAction<AnnotationType | null>>;
}) => {
  const [existingSettings, setExistingSettings] = useState<Record<
    string,
    AnnotationType
  > | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const settings = await getAllDocumentSettings();
      setExistingSettings(settings);
    };

    fetchSettings();
  }, []);

  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      console.error("No ID provided for deletion");
      return;
    }
    try {
      await deleteDocumentSetting(id);
      const updatedSettings = await getAllDocumentSettings();
      setExistingSettings(updatedSettings);
    } catch (error) {
      console.error(`Failed to delete setting with id ${id}:`, error);
    }
  };
  // DELETE ALL FUNCTION START
  const handleDeleteAll = async () => {
    try {
      await deleteAllDocumentSettings();
      setExistingSettings(null);
    } catch (error) {
      console.error("Failed to delete all settings:", error);
    }
  };
  // DELETE ALL FUNCTION END
  const annotationTypes = existingSettings
    ? Object.values(existingSettings)
    : [];

  return (
    <div>
      Annotation Types:
      {annotationTypes.length > 0 ? (
        <Accordion collapsible>
          {annotationTypes.map((e: AnnotationType, idx: number) => (
            <AccordionItem key={idx} value={idx}>
              <AccordionHeader>{e.name}</AccordionHeader>
              <AccordionPanel>
                <div className={"mb-2"}>
                  <code
                    className={
                      "p-0.5 rounded-md bg-blue-900 border-blue-900 border-0.5 text-white text-xs"
                    }
                  >{`id: ${e.id || "No ID provided"}`}</code>
                </div>

                <div className={"mb-2"}>
                  {Array.isArray(e.formDescription) &&
                  e.formDescription.length > 0 &&
                  Object.keys(e.formDescription).length > 0 ? (
                    <div>
                      {Object.entries(e.formDescription).map(
                        ([key, value], index) => (
                          <div key={key} className={"mb-2"}>
                            <code
                              className={
                                "p-0.5 rounded-md bg-blue-900 border-blue-900 border-0.5 text-white text-xs"
                              }
                            >{`${value.type}: ${String(value.label)}`}</code>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    "No description provided"
                  )}
                </div>
                <div className="flex gap-2 items-start">
                  <Button
                    icon={<EditRegular />}
                    onClick={() => setAnnotationType(e)}
                  >
                    Edit
                  </Button>
                  <Button
                    icon={<DeleteRegular />}
                    onClick={() => handleDelete(e.id)}
                  >
                    Delete
                  </Button>
                </div>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p className="text-gray-300 mt-2 mb-4 italic">
          No Annotation Types Added
        </p>
      )}
      {/* DELETE ALL BUTTON START */}
      <div className="mb-4">
        <Button onClick={handleDeleteAll}>Delete All</Button>
      </div>
      {/* DELETE ALL BUTTON END */}
    </div>
  );
};
