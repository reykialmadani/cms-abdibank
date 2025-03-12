// pages/admins/content/components/readTableRow.tsx
import Link from "next/link";
import { PencilIcon, TrashIcon, EyeIcon } from "@heroicons/react/24/outline";
import { ContentItem } from "@/types/read";

interface ReadTableRowProps {
  item: ContentItem;
  onDelete: (id: number, title: string) => void;
}

const ReadTableRow: React.FC<ReadTableRowProps> = ({ item, onDelete }) => {
  // Fungsi untuk memformat tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Fungsi untuk mendapatkan deskripsi singkat
  const getTruncatedDescription = (description: string, length = 80) => {
    if (description.length <= length) return description;
    return `${description.substring(0, length)}...`;
  };

  return (
    <tr className="hover:bg-gray-50 transition duration-150 ease-in-out">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="ml-0">
            <div className="text-sm font-semibold text-gray-900 line-clamp-1">
              {item.title}
            </div>
            <div className="text-sm text-gray-500 line-clamp-2 mt-1">
              {getTruncatedDescription(item.description)}
            </div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <div className="text-sm font-medium text-gray-900">
            {item.sub_menu_name}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            ID: {item.sub_menu_id}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full ${
            item.status
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {item.status ? "Aktif" : "Tidak Aktif"}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex flex-col">
          <div className="text-sm text-gray-900">
            {formatDate(item.created_at)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Update: {formatDate(item.updated_at)}
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex justify-end space-x-2">
          <Link
            href={`/admins/content/${item.id}/detail`}
            className="p-2 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition duration-150"
            title="Lihat Detail"
          >
            <EyeIcon className="h-5 w-5" />
          </Link>
          <Link
            href={`/admins/content/${item.id}/edit`}
            className="p-2 text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50 rounded-full transition duration-150"
            title="Edit"
          >
            <PencilIcon className="h-5 w-5" />
          </Link>
          <button
            onClick={() => onDelete(item.id, item.title)}
            className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition duration-150"
            title="Hapus"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ReadTableRow;