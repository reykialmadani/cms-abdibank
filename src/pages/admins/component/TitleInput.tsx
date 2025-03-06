// components/content/TitleInput.tsx
import React from "react";

interface TitleInputProps {
  title: string;
  setTitle: (value: string) => void;
  validationError?: string;
}

const TitleInput: React.FC<TitleInputProps> = ({
  title,
  setTitle,
  validationError,
}) => {
  return (
    <div>
      <label
        htmlFor="title"
        className="block text-sm font-medium text-gray-700"
      >
        Judul
      </label>
      <div className="mt-1">
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`text-black block w-full px-3 py-2 border ${
            validationError
              ? "border-red-300"
              : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
          placeholder="Masukkan judul content"
        />
        {validationError && (
          <p className="mt-2 text-sm text-red-600">
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
};

export default TitleInput;