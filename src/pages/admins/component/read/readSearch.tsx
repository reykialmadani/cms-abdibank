// pages/admins/content/components/readSearch.tsx
import { MagnifyingGlassIcon as SearchIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

interface ReadSearchProps {
  search: string;
  totalItems: number;
  refreshing: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
}

const ReadSearch: React.FC<ReadSearchProps> = ({
  search,
  totalItems,
  refreshing,
  onSearchChange,
  onRefresh,
}) => {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 pr-3 py-2 border-gray-300 rounded-lg placeholder-gray-400 text-sm transition duration-200"
            placeholder="Cari content berdasarkan judul..."
            value={search}
            onChange={onSearchChange}
          />
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Total: {totalItems} Content
          </span>
          <button
            onClick={onRefresh}
            className="inline-flex items-center p-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
            disabled={refreshing}
          >
            <ArrowPathIcon 
              className={`h-5 w-5 ${refreshing ? 'animate-spin text-indigo-500' : 'text-gray-500'}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReadSearch;