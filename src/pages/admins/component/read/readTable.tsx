// pages/admins/content/components/readTable.tsx
import { ContentItem } from "@/types/read";
import ReadTableRow from "./readTableRow";
import ReadTableSkeleton from "./readTableSkeleton";
import ReadEmptyState from "./readEmptyState";

interface ReadTableProps {
  contentItems: ContentItem[];
  loading: boolean;
  search: string;
  onDelete: (id: number, title: string) => void;
}

const ReadTable: React.FC<ReadTableProps> = ({
  contentItems,
  loading,
  search,
  onDelete,
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Content
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Sub Menu
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tanggal
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
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
                <ReadTableRow 
                  key={item.id} 
                  item={item} 
                  onDelete={onDelete} 
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReadTable;