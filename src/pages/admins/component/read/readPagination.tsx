// pages/admins/content/components/readPagination.tsx
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";

interface ReadPaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  onPageChange: (page: number) => void;
}

const ReadPagination: React.FC<ReadPaginationProps> = ({
  currentPage,
  lastPage,
  total,
  onPageChange,
}) => {
  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    // Logika untuk menentukan halaman mana yang harus ditampilkan
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = startPage + maxPagesToShow - 1;
    
    if (endPage > lastPage) {
      endPage = lastPage;
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    // Selalu tampilkan halaman pertama
    if (startPage > 1) {
      pages.push(
        <button
          key={1}
          onClick={() => onPageChange(1)}
          className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          1
        </button>
      );
      
      // Tambahkan elipsis jika perlu
      if (startPage > 2) {
        pages.push(
          <span
            key="ellipsis-start"
            className="px-2 py-1 text-gray-500"
          >
            ...
          </span>
        );
      }
    }
    
    // Tambahkan halaman tengah
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          className={`px-3 py-1 rounded-md text-sm font-medium ${
            i === currentPage
              ? "bg-indigo-600 text-white"
              : "text-gray-700 hover:bg-gray-50"
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Selalu tampilkan halaman terakhir
    if (endPage < lastPage) {
      // Tambahkan elipsis jika perlu
      if (endPage < lastPage - 1) {
        pages.push(
          <span
            key="ellipsis-end"
            className="px-2 py-1 text-gray-500"
          >
            ...
          </span>
        );
      }
      
      pages.push(
        <button
          key={lastPage}
          onClick={() => onPageChange(lastPage)}
          className="px-3 py-1 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {lastPage}
        </button>
      );
    }
    
    return pages;
  };
  
  return (
    <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Sebelumnya
        </button>
        <button
          onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
          disabled={currentPage === lastPage}
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
            currentPage === lastPage
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          Selanjutnya
        </button>
      </div>
      
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Menampilkan <span className="font-medium">{total}</span> content
          </p>
        </div>
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">Sebelumnya</span>
              <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
            </button>
            
            <div className="hidden md:flex">
              {renderPageNumbers()}
            </div>
            
            <button
              onClick={() => onPageChange(Math.min(lastPage, currentPage + 1))}
              disabled={currentPage === lastPage}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                currentPage === lastPage
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              <span className="sr-only">Selanjutnya</span>
              <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default ReadPagination;