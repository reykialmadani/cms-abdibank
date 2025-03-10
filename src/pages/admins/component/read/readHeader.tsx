// pages/admins/content/components/readHeader.tsx
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";

const ReadHeader: React.FC = () => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Kelola Content
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Lihat, tambah, edit, dan hapus content di sini
        </p>
      </div>
      <Link
        href="/admins/content/create"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
      >
        <PlusIcon className="h-5 w-5 mr-2" />
        Tambah Content
      </Link>
    </div>
  );
};

export default ReadHeader;