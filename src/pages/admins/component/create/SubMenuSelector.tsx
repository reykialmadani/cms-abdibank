// components/content/SubMenuSelector.tsx
import React, { useState } from "react";
import { DropdownOption } from "@/types/content";

interface SubMenuSelectorProps {
  selectedSubMenu: number | null;
  setSelectedSubMenu: (value: number | null) => void;
  options: DropdownOption[];
  validationError?: string;
}

const SubMenuSelector: React.FC<SubMenuSelectorProps> = ({
  selectedSubMenu,
  setSelectedSubMenu,
  options,
  validationError,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Menemukan nama opsi yang dipilih
  const selectedOptionName = selectedSubMenu
    ? options.find((option) => option.id === selectedSubMenu)?.name
    : "";

  return (
    <div className="relative">
      <label
        htmlFor="subMenu"
        className="block text-sm font-semibold text-gray-800 mb-2"
      >
        Sub Menu
      </label>
      
      {/* Custom dropdown */}
      <div className="relative">
        <button
          type="button"
          className={`relative w-full bg-white border ${
            validationError
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          } rounded-lg shadow-sm pl-3 pr-10 py-2.5 text-left cursor-pointer focus:outline-none focus:ring-2 transition-colors sm:text-sm`}
          aria-haspopup="listbox"
          aria-expanded="true"
          aria-labelledby="submenu-label"
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`block truncate ${!selectedOptionName ? "text-gray-500" : "text-gray-900"}`}>
            {selectedOptionName || "Pilih Sub Menu"}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </span>
        </button>

        {/* Hidden native select for accessibility and form submission */}
        <select
          id="subMenu"
          value={selectedSubMenu || ""}
          onChange={(e) =>
            setSelectedSubMenu(
              e.target.value ? parseInt(e.target.value) : null
            )
          }
          className="sr-only"
          aria-hidden="true"
        >
          <option value="">Pilih Sub Menu</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>

        {/* Dropdown menu */}
        {isOpen && (
          <div
            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            tabIndex={-1}
            role="listbox"
            aria-labelledby="submenu-label"
          >
            <div
              className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${
                !selectedSubMenu ? "bg-blue-100 text-blue-900" : "text-gray-500"
              }`}
              role="option"
              onClick={() => {
                setSelectedSubMenu(null);
                setIsOpen(false);
              }}
            >
              <span className="block truncate font-normal">
                Pilih Sub Menu
              </span>
              {!selectedSubMenu && (
                <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                  <svg
                    className="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </span>
              )}
            </div>

            {options.map((option) => (
              <div
                key={option.id}
                className={`cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50 ${
                  selectedSubMenu === option.id
                    ? "bg-blue-100 text-blue-900"
                    : "text-gray-900"
                }`}
                role="option"
                onClick={() => {
                  setSelectedSubMenu(option.id);
                  setIsOpen(false);
                }}
              >
                <span className={`block truncate ${selectedSubMenu === option.id ? "font-medium" : "font-normal"}`}>
                  {option.name}
                </span>
                {selectedSubMenu === option.id && (
                  <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                    <svg
                      className="h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation error message */}
      {validationError && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <svg 
            className="w-4 h-4 mr-1" 
            fill="currentColor" 
            viewBox="0 0 20 20" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              fillRule="evenodd" 
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
              clipRule="evenodd" 
            />
          </svg>
          {validationError}
        </p>
      )}
    </div>
  );
};

export default SubMenuSelector;