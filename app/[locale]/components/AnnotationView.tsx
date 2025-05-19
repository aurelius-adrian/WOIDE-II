"use client";
import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionHeader,
  AccordionItem,
  AccordionPanel,
} from "@fluentui/react-accordion";
import { DeleteRegular, EyeFilled, InfoRegular } from "@fluentui/react-icons";
import { Button, ToggleButton } from "@fluentui/react-button";
import {
  deleteAnnotation,
  getAnnotations,
} from "../../lib/annotation-api/annotations";
import {
  getAnnotationTextByID,
  highlightAnnotationID,
  removeHighlightAnnotationID,
} from "../../lib/annotation-api/navigation";
import { EditRegular } from "@fluentui/react-icons";
import { Annotation } from "../../lib/annotation-api/types";
import { enqueueSnackbar } from "notistack";

interface AnnotationViewProps {
  currentAnnotation: Annotation;
  currentAnnotationIndex: number;
  updateAnnotations: Function;
  setEditMode: Function;
  setEditAnnotation: Function;
}

export const AnnotationView = ({
  currentAnnotation,
  currentAnnotationIndex,
  updateAnnotations,
  setEditMode,
  setEditAnnotation,
}: AnnotationViewProps) => {
  const _getAnnotations = async () => {
    getAnnotations().then((ann) => updateAnnotations(ann));
  };
  const _deleteAnnotation = async (annotationID: string) => {
    try {
      await deleteAnnotation(annotationID);
      enqueueSnackbar({
        message: "Annotation Successfully Deleted.",
        variant: "success",
        autoHideDuration: 2000,
      });
      _getAnnotations();
    } catch {
      enqueueSnackbar({
        message: "Failed to delete annotation.",
        variant: "error",
        autoHideDuration: 2000,
      });
    }
  };
  const getAnnotationText = async () => {
    const text = await getAnnotationTextByID(currentAnnotation.id);
    return text ? text.replace(/[❭❬]/g, "") : "";
  };

  const editAnnotation = (annotationToEdit: Annotation) => {
    setEditAnnotation(annotationToEdit);
    setEditMode(true);
  };
  return (
    <>
      <div className="annotationList">
        <div className="annotationListItem rounded-xl shadow-md p-4 border mb-1 mt-1 max-w-md">
          <div className="text-sm font-semibold  mb-2">
            {currentAnnotation.data
              ? JSON.parse(currentAnnotation.data).name
              : "Annotation Type Misssing"}
          </div>

          <div className="text-xs line-clamp-2">{getAnnotationText()}</div>
          <div className="mt-3 ml-auto flex justify-end space-x-2">
            <Button
              icon={<EditRegular />}
              onClick={() => editAnnotation(currentAnnotation)}
            />
            <ToggleButton
              key={currentAnnotationIndex}
              onClick={async (e) => {
                if (
                  (
                    e.target as EventTarget & {
                      ariaPressed: string;
                    }
                  ).ariaPressed == "false"
                )
                  highlightAnnotationID(currentAnnotation);
                else removeHighlightAnnotationID(currentAnnotation);
              }}
              icon={<EyeFilled />}
            />
            <Button
              icon={<DeleteRegular />}
              onClick={() => _deleteAnnotation(currentAnnotation.id)}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AnnotationView;
