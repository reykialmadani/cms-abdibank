// pages/admins/content/components/readTable.tsx
import { ContentItem, Pagination } from "@/types/read";
import ReadTableRow from "./readTableRow";
import ReadTableSkeleton from "./readTableSkeleton";
import ReadEmptyState from "./readEmptyState";
import ReadTableMobile from "./readTableMobile";
import ReadPagination from "./readPagination";

interface ReadTableProps {
  contentItems: ContentItem[];
  loading: boolean;
  search: string;
  onDelete: (id: number, title: string) => void;
  pagination: Pagination;
  onPageChange: (page: number) => void;
}

const ReadTable: React.FC<ReadTableProps> = ({
  contentItems,
  loading,
  search,
  onDelete,
  pagination,
  onPageChange
}) => {
  return (
    <>
      {/* Mobile View */}
      <div className="sm:hidden">
        {loading ? (
          <div className="p-4">
            <div className="animate-pulse space-y-4">
              {Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-gray-100 p-4 rounded-lg">
                  <div className="h-5 bg-gray-200 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              ))}
            </div>
          </div>
        ) : contentItems.length === 0 ? (
          <div className="p-8 text-center">
            <ReadEmptyState isSearching={search.length > 0} />
          </div>
        ) : (
          <ReadTableMobile contentItems={contentItems} onDelete={onDelete} />
        )}
      </div>
      
      {/* Desktop View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Content
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sub Menu
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <ReadTableSkeleton rowCount={5} />
            ) : contentItems.length === 0 ? (
              <ReadEmptyState isSearching={search.length > 0} />
            ) : (
              contentItems.map((item) => (
                <ReadTableRow key={item.id} item={item} onDelete={onDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {!loading && contentItems.length > 0 && (
        <ReadPagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          onPageChange={onPageChange}
        />
      )}
    </>
  );
};

export default ReadTable;