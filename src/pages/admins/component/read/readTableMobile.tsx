// pages/admins/content/components/readTableMobile.tsx
import Link from "next/link";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { ContentItem } from "@/types/read";

interface ReadTableMobileProps {
  contentItems: ContentItem[];
  onDelete: (id: number, title: string) => void;
}

const ReadTableMobile: React.FC<ReadTableMobileProps> = ({ contentItems, onDelete }) => {
  // Fungsi untuk memformat tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="divide-y divide-gray-200">
      {contentItems.map((item) => (
        <div key={item.id} className="p-4 hover:bg-gray-50">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-semibold text-gray-900 line-clamp-2">
              {item.title}
            </div>
            <span
              className={`px-2 py-1 text-xs leading-5 font-medium rounded-full ${
                item.status
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {item.status ? "Aktif" : "Tidak Aktif"}
            </span>
          </div>
          
          <div className="flex justify-between text-xs text-gray-500 mb-3">
            <div>Sub Menu: {item.sub_menu_name}</div>
            <div>ID: {item.sub_menu_id}</div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="text-xs text-gray-500">
              <div>Dibuat: {formatDate(item.created_at)}</div>
              <div>Update: {formatDate(item.updated_at)}</div>
            </div>
            
            <div className="flex space-x-1">
              <Link
                href={`/admins/content/${item.id}/detail`}
                className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full"
                title="Lihat Detail"
              >
                <EyeIcon className="h-5 w-5" />
              </Link>
              <Link
                href={`/admins/content/${item.id}/edit`}
                className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-full"
                title="Edit"
              >
                <PencilIcon className="h-5 w-5" />
              </Link>
              <button
                onClick={() => onDelete(item.id, item.title)}
                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full"
                title="Hapus"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReadTableMobile;