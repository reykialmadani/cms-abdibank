// components/content/DescriptionEditor.tsx
import React from "react";
import { ListItem } from "@/types/content";
import NestedListEditor from "./NestedListEditor";
import { getFormattedPreview } from "@/utils/contentHelpers";

interface DescriptionEditorProps {
  descriptionFormat: "paragraph" | "simple-list" | "nested-list";
  description: string;
  setDescription: (value: string) => void;
  listItems: ListItem[];
  setListItems: React.Dispatch<React.SetStateAction<ListItem[]>>;
  currentListId: number;
  setCurrentListId: React.Dispatch<React.SetStateAction<number>>;
  showPreview: boolean;
  setShowPreview: React.Dispatch<React.SetStateAction<boolean>>;
  validationError?: string;
}

const DescriptionEditor: React.FC<DescriptionEditorProps> = ({
  descriptionFormat,
  description,
  setDescription,
  listItems,
  setListItems,
  currentListId,
  setCurrentListId,
  showPreview,
  setShowPreview,
  validationError,
}) => {
  return (
    <>
      {descriptionFormat !== "nested-list" ? (
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700"
          >
            Deskripsi
          </label>
          <div className="mt-1">
            <textarea
              id="description"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`text-black block w-full px-3 py-2 border ${
                validationError ? "border-red-300" : "border-gray-300"
              } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
              placeholder={
                descriptionFormat === "paragraph"
                  ? "Masukkan deskripsi dalam bentuk paragraf"
                  : "Masukkan deskripsi dalam bentuk poin. Pisahkan dengan baris baru."
              }
            />
            {validationError && (
              <p className="mt-2 text-sm text-red-600">{validationError}</p>
            )}
          </div>
        </div>
      ) : (
        <NestedListEditor
          listItems={listItems}
          setListItems={setListItems}
          currentListId={currentListId}
          setCurrentListId={setCurrentListId}
          validationError={validationError}
        />
      )}

      <div className="mt-2 flex justify-between items-center">
        <p className="text-xs text-gray-500">
          Minimal 20 karakter.
        </p>
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          {showPreview ? "Sembunyikan Preview" : "Lihat Preview"}
        </button>
      </div>

      {/* Description Preview */}
      {showPreview && (
        <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Preview:
          </h4>
          <div className="text-sm text-gray-800">
            {getFormattedPreview(description, descriptionFormat, listItems)}
          </div>
        </div>
      )}
    </>
  );
};

export default DescriptionEditor;