import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import AdminLayout from "@/pages/admins/component/AdminLayout";
import DeleteConfirmationModal from "@/pages/admins/component/DeleteConfirmationModal";
import { deleteContent } from "@/utils/contentService";
import {
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon as SearchIcon,
  PlusIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

// Interface for content item
interface ContentItem {
  id: number;
  title: string;
  description: string;
  thumbnail: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  sub_menu_name: string;
  sub_menu_id: number;
}

// Interface for pagination
interface Pagination {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export default function ContentList() {
  // State for content items
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  // State for pagination
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // State for loading, error, filtering and search
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // State for delete functionality
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [contentToDelete, setContentToDelete] = useState<{
    id: number;
    title: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>("");
  const [deleteSuccess, setDeleteSuccess] = useState<string>("");

  const router = useRouter();

  // Fetch content items from API with pagination and search
  const fetchContentItems = async (page = 1, searchQuery = search) => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const response = await axios.get("/api/content", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          search: searchQuery,
          per_page: pagination.per_page,
        },
      });

      setContentItems(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
      });
    } catch (err) {
      console.error("Error fetching content items:", err);
      setError("Terjadi kesalahan saat mengambil data content");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial fetch when component mounts
  useEffect(() => {
    fetchContentItems();
  }, []);

  // Handle search input
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    // Debounce search to avoid too many API calls
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchContentItems(1, value);
    }, 500);

    setSearchTimeout(timeout);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    fetchContentItems(page);
  };

  // Function to refresh content list
  const handleRefresh = () => {
    setRefreshing(true);
    fetchContentItems(pagination.current_page);
  };

  // Function to open delete modal
  const handleOpenDeleteModal = (id: number, title: string) => {
    setContentToDelete({ id, title });
    setDeleteModalOpen(true);
    setDeleteError("");
  };

  // Function to close delete modal
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteError("");

    // Give time for modal animation to complete before resetting state
    setTimeout(() => {
      setContentToDelete(null);
    }, 200);
  };

  // Function to confirm deletion
  const handleConfirmDelete = async () => {
    if (!contentToDelete) return;

    setDeleteLoading(true);
    setDeleteError("");

    try {
      await deleteContent(contentToDelete.id);

      // Close modal
      setDeleteModalOpen(false);

      // Show success message
      setDeleteSuccess(`Content "${contentToDelete.title}" berhasil dihapus!`);

      // Refresh the content list after a brief delay
      setTimeout(() => {
        fetchContentItems(pagination.current_page);
      }, 300);

      // Clear success message after a few seconds
      setTimeout(() => {
        setDeleteSuccess("");
      }, 3000);
    } catch (err) {
      console.error("Error deleting content:", err);

      if (err instanceof Error) {
        setDeleteError(err.message);
      } else {
        setDeleteError("Terjadi kesalahan saat menghapus content");
      }

      setDeleteLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Get truncated description
  const getTruncatedDescription = (description: string, length = 80) => {
    if (description.length <= length) return description;
    return `${description.substring(0, length)}...`;
  };

  return (
    <AdminLayout>
      <Head>
        <title>Kelola Content - Admin Dashboard</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header section with title and add button */}
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
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Search and filter section */}
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
                    onChange={handleSearchChange}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">
                    Total: {pagination.total} Content
                  </span>
                  <button
                    onClick={handleRefresh}
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

            {/* Error message */}
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-red-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Delete success message */}
            {deleteSuccess && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg shadow-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="h-5 w-5 text-green-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">{deleteSuccess}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Content list */}
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
                      // Loading state
                      Array(5)
                        .fill(0)
                        .map((_, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition duration-150">
                            <td className="px-6 py-4">
                              <div className="animate-pulse flex space-x-4">
                                <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
                                <div className="flex-1 space-y-2 py-1">
                                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right">
                              <div className="flex justify-end space-x-2">
                                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
                              </div>
                            </td>
                          </tr>
                        ))
                    ) : contentItems.length === 0 ? (
                      // Empty state
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
                              {search
                                ? "Tidak ada content yang sesuai dengan pencarian"
                                : "Belum ada content"}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {search
                                ? "Coba dengan kata kunci lain"
                                : "Tambahkan content baru untuk mulai"}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      // Content items
                      contentItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg overflow-hidden">
                                {item.thumbnail ? (
                                  <Image
                                    src={item.thumbnail}
                                    alt={item.title}
                                    width={48}
                                    height={48}
                                    className="h-12 w-12 object-cover"
                                  />
                                ) : (
                                  <div className="h-12 w-12 flex items-center justify-center bg-gray-200">
                                    <svg
                                      className="h-6 w-6 text-gray-400"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                      />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
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
                                onClick={() =>
                                  handleOpenDeleteModal(item.id, item.title)
                                }
                                className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition duration-150"
                                title="Hapus"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {!loading && pagination.last_page > 1 && (
                <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200">
                  <div className="flex-1 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Menampilkan{" "}
                        <span className="font-medium">
                          {(pagination.current_page - 1) * pagination.per_page +
                            1}
                        </span>{" "}
                        sampai{" "}
                        <span className="font-medium">
                          {Math.min(
                            pagination.current_page * pagination.per_page,
                            pagination.total
                          )}
                        </span>{" "}
                        dari{" "}
                        <span className="font-medium">{pagination.total}</span>{" "}
                        hasil
                      </p>
                    </div>
                    <div>
                      <nav
                        className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                        aria-label="Pagination"
                      >
                        <button
                          onClick={() =>
                            handlePageChange(pagination.current_page - 1)
                          }
                          disabled={pagination.current_page === 1}
                          className={`relative inline-flex items-center px-3 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                            pagination.current_page === 1
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Previous</span>
                          <ArrowLeftIcon className="h-4 w-4" />
                        </button>

                        {/* Page numbers */}
                        {Array.from(
                          { length: pagination.last_page },
                          (_, i) => i + 1
                        ).map((page) => {
                          // Show current page, first page, last page, and 1 page before and after current
                          if (
                            page === 1 ||
                            page === pagination.last_page ||
                            (page >= pagination.current_page - 1 &&
                              page <= pagination.current_page + 1)
                          ) {
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                  pagination.current_page === page
                                    ? "z-10 bg-indigo-50 border-indigo-500 text-indigo-600"
                                    : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          }

                          // Show ellipsis for pages that are not shown
                          if (
                            (page === 2 && pagination.current_page > 3) ||
                            (page === pagination.last_page - 1 &&
                              pagination.current_page <
                                pagination.last_page - 2)
                          ) {
                            return (
                              <span
                                key={page}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
                              >
                                ...
                              </span>
                            );
                          }

                          return null;
                        })}

                        <button
                          onClick={() =>
                            handlePageChange(pagination.current_page + 1)
                          }
                          disabled={
                            pagination.current_page === pagination.last_page
                          }
                          className={`relative inline-flex items-center px-3 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                            pagination.current_page === pagination.last_page
                              ? "text-gray-300 cursor-not-allowed"
                              : "text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          <span className="sr-only">Next</span>
                          <ArrowRightIcon className="h-4 w-4" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        contentId={contentToDelete?.id || null}
        contentTitle={contentToDelete?.title || ""}
        isLoading={deleteLoading}
        error={deleteError}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </AdminLayout>
  );
}