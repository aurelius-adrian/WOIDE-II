'use client'

import React, { useState } from "react";
import { Button } from "@fluentui/react-button";

interface AddAnnotationFormProps {
    onClose: () => void; // Callback to close the form
}

export function AddAnnotationForm({ onClose }: AddAnnotationFormProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const handleSubmit = () => {
        // Logic to handle form submission (e.g., API call)
        console.log("Annotation Type Added:", { name, description });
        onClose(); // Close the form after submission
    };

    return (
        <div className="p-4 border rounded shadow">
            <h2 className="text-lg font-bold mb-4">Add Annotation Type</h2>
            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter annotation type name"
                />
            </div>
            <div className="mb-3">
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="Enter annotation type description"
                />
            </div>
            <div className="flex justify-end gap-2">
                <Button appearance="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button appearance="primary" onClick={handleSubmit} disabled={!name.trim()}>
                    Add
                </Button>
            </div>
        </div>
    );
}
