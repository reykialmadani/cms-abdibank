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
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <label
          htmlFor="title"
          className="text-sm font-semibold text-gray-800 tracking-wide"
        >
          Judul
        </label>
        {title.length > 0 && (
          <span className="text-xs text-gray-500">
            {title.length} karakter
          </span>
        )}
      </div>
      <div className="relative">
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={`text-gray-800 block w-full px-4 py-3 border-2 ${
            validationError
              ? "border-red-400 bg-red-50"
              : "border-gray-300 bg-white focus:border-blue-500 hover:border-gray-400"
          } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all duration-200 sm:text-sm`}
          placeholder="Masukkan judul content"
        />
        {title.length > 0 && (
          <button
            type="button"
            onClick={() => setTitle("")}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
      </div>
      {validationError && (
        <div className="mt-2 flex items-center text-sm text-red-600">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 mr-1 inline">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
          {validationError}
        </div>
      )}
    </div>
  );
};

export default TitleInput;