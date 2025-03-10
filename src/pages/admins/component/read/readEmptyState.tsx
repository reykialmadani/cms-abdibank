// pages/admins/content/components/readEmptyState.tsx

interface ReadEmptyStateProps {
    isSearching: boolean;
  }
  
  const ReadEmptyState: React.FC<ReadEmptyStateProps> = ({ isSearching }) => {
    return (
      <tr>
        <td
          colSpan={5}
          className="px-6 py-12 whitespace-nowrap text-center"
        >
          <div className="flex flex-col items-center justify-center">
            <svg
              className="h-12 w-12 text-gray-300 mb-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-500 font-medium mb-1">
              {isSearching
                ? "Tidak ada content yang sesuai dengan pencarian"
                : "Belum ada content"}
            </p>
            <p className="text-gray-400 text-sm">
              {isSearching
                ? "Coba dengan kata kunci lain"
                : "Tambahkan content baru untuk mulai"}
            </p>
          </div>
        </td>
      </tr>
    );
  };
  
  export default ReadEmptyState;