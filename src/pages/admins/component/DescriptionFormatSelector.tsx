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
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Format Deskripsi
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        {/* Opsi Paragraf */}
        <div 
          className={`flex items-center border rounded-md p-3 cursor-pointer transition-all duration-200 ${
            descriptionFormat === "paragraph"
              ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
              : "border-gray-200 hover:bg-gray-50"
          }`}
          onClick={() => setDescriptionFormat("paragraph")}
        >
          <input
            id="format-paragraph"
            name="description-format"
            type="radio"
            value="paragraph"
            checked={descriptionFormat === "paragraph"}
            onChange={() => setDescriptionFormat("paragraph")}
            className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div className="ml-3">
            <label
              htmlFor="format-paragraph"
              className="font-medium text-gray-800 cursor-pointer"
            >
              Paragraf
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Deskripsi ditampilkan sebagai paragraf teks yang mengalir
            </p>
          </div>
        </div>

        {/* Opsi Daftar Berjenjang */}
        <div
          className={`flex items-center border rounded-md p-3 cursor-pointer transition-all duration-200 ${
            descriptionFormat === "nested-list"
              ? "bg-blue-50 border-blue-500 ring-2 ring-blue-200"
              : "border-gray-200 hover:bg-gray-50"
          }`}
          onClick={() => setDescriptionFormat("nested-list")}
        >
          <input
            id="format-nested-list"
            name="description-format"
            type="radio"
            value="nested-list"
            checked={descriptionFormat === "nested-list"}
            onChange={() => setDescriptionFormat("nested-list")}
            className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <div className="ml-3">
            <label
              htmlFor="format-nested-list"
              className="font-medium text-gray-800 cursor-pointer"
            >
              Daftar Berjenjang
            </label>
            <p className="text-xs text-gray-500 mt-1">
              Deskripsi distruktur sebagai daftar dengan sub-items terorganisir
            </p>
          </div>
        </div>
      </div>

      {/* Ilustrasi Preview Format */}
      <div className="p-3 bg-gray-50 rounded-md border border-gray-200 mt-3">
        <div className="text-xs font-medium text-gray-500 uppercase mb-2">Preview</div>
        {descriptionFormat === "paragraph" ? (
          <div className="h-16 bg-white p-2 rounded border border-gray-200">
            <div className="w-full h-2 bg-gray-200 rounded mb-1.5"></div>
            <div className="w-11/12 h-2 bg-gray-200 rounded mb-1.5"></div>
            <div className="w-full h-2 bg-gray-200 rounded mb-1.5"></div>
            <div className="w-4/5 h-2 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="h-16 bg-white p-2 rounded border border-gray-200">
            <div className="flex items-center mb-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
              <div className="w-4/5 h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center mb-1.5 ml-4">
              <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
              <div className="w-3/4 h-2 bg-gray-200 rounded"></div>
            </div>
            <div className="flex items-center ml-4">
              <div className="w-2 h-2 rounded-full bg-gray-400 mr-2"></div>
              <div className="w-2/3 h-2 bg-gray-200 rounded"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DescriptionFormatSelector;