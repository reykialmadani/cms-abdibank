// components/content/SubMenuSelector.tsx
import React from "react";
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
  return (
    <div>
      <label
        htmlFor="subMenu"
        className="block text-sm font-medium text-gray-700"
      >
        Sub Menu
      </label>
      <div className="mt-1">
        <select
          id="subMenu"
          value={selectedSubMenu || ""}
          onChange={(e) =>
            setSelectedSubMenu(
              e.target.value ? parseInt(e.target.value) : null
            )
          }
          className={`text-black block w-full px-3 py-2 border ${
            validationError
              ? "border-red-300"
              : "border-gray-300"
          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
        >
          <option value="">Pilih Sub Menu</option>
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
        {validationError && (
          <p className="mt-2 text-sm text-red-600">
            {validationError}
          </p>
        )}
      </div>
    </div>
  );
};

export default SubMenuSelector;