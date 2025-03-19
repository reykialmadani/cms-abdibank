// components/common/StatusToggle.tsx
import React from "react";

interface StatusToggleProps {
  status: boolean;
  setStatus: (value: boolean) => void;
  label: string;
  description: string;
}

const StatusToggle: React.FC<StatusToggleProps> = ({
  status,
  setStatus,
  label,
  description,
}) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          id="status"
          name="status"
          type="checkbox"
          checked={status}
          onChange={(e) => setStatus(e.target.checked)}
          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
        />
      </div>
      <div className="ml-3 text-sm">
        <label
          htmlFor="status"
          className="font-medium text-gray-700"
        >
          {label}
        </label>
        <p className="text-gray-500">
          {description}
        </p>
      </div>
    </div>
  );
};

export default StatusToggle;