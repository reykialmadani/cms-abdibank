import React from "react";

interface DescriptionFormatSelectorProps {
  descriptionFormat: "paragraph" | "nested-list";
  setDescriptionFormat: (format: "paragraph" | "nested-list") => void;
}

const DescriptionFormatSelector: React.FC<DescriptionFormatSelectorProps> = ({
  descriptionFormat,
  setDescriptionFormat,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Format Deskripsi
      </label>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center">
          <input
            id="format-paragraph"
            name="description-format"
            type="radio"
            value="paragraph"
            checked={descriptionFormat === "paragraph"}
            onChange={() => setDescriptionFormat("paragraph")}
            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
          />
          <label
            htmlFor="format-paragraph"
            className="ml-2 block text-sm text-gray-700"
          >
            Paragraf
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="format-nested-list"
            name="description-format"
            type="radio"
            value="nested-list"
            checked={descriptionFormat === "nested-list"}
            onChange={() => setDescriptionFormat("nested-list")}
            className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
          />
          <label
            htmlFor="format-nested-list"
            className="ml-2 block text-sm text-gray-700"
          >
            Daftar Berjenjang
          </label>
        </div>
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {descriptionFormat === "paragraph"
          ? "Deskripsi akan ditampilkan sebagai paragraf teks."
          : "Deskripsi akan dibuat sebagai daftar berjenjang dengan sub-items."}
      </p>
    </div>
  );
};

export default DescriptionFormatSelector;