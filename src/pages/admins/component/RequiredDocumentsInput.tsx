// components/content/RequiredDocumentsInput.tsx
import React from "react";

interface RequiredDocumentsInputProps {
  requiredDocuments: string;
  setRequiredDocuments: (value: string) => void;
}

const RequiredDocumentsInput: React.FC<RequiredDocumentsInputProps> = ({
  requiredDocuments,
  setRequiredDocuments,
}) => {
  return (
    <div>
      <label
        htmlFor="requiredDocuments"
        className="block text-sm font-medium text-gray-700"
      >
        Dokumen yang Dibutuhkan (opsional)
      </label>
      <div className="mt-1">
        <textarea
          id="requiredDocuments"
          rows={3}
          value={requiredDocuments}
          onChange={(e) => setRequiredDocuments(e.target.value)}
          className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          placeholder="Masukkan daftar dokumen yang dibutuhkan"
        />
      </div>
      <p className="mt-2 text-xs text-gray-500">
        Daftar dokumen yang diperlukan, pisahkan dengan baris baru.
      </p>
    </div>
  );
};

export default RequiredDocumentsInput;