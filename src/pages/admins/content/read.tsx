// pages/admins/content/index.tsx
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import AdminLayout from "@/pages/admins/component/AdminLayout";
import DeleteConfirmationModal from "@/pages/admins/component/DeleteConfirmationModal";
import { deleteContent } from "@/utils/contentService";

// Import komponen-komponen terpisah
import ReadHeader from "../component/read/readHeader";
// import ReadSearch from "../component/read/readSearch";
import ReadTable from "../component/read/readTable";
import ReadPagination from "../component/read/readPagination";
import AlertMessage from "../component/read/alertMessage";
import { ContentItem, Pagination, ContentToDelete } from "@/types/read";

export default function ContentList() {
  // State untuk content items
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  // State untuk pagination
  const [pagination, setPagination] = useState<Pagination>({
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 0,
  });

  // State untuk loading, error, filtering dan search
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");  
  const [search, setSearch] = useState<string>("");  
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);  
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // State untuk delete functionality
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [contentToDelete, setContentToDelete] = useState<ContentToDelete | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string>("");
  const [deleteSuccess, setDeleteSuccess] = useState<string>("");

  const router = useRouter();

  // Fetch content items dari API dengan pagination dan search
  const fetchContentItems = useCallback(async (page = 1, searchQuery = search) => {
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
  }, [pagination.per_page, router, search]); // Ensure fetchContentItems is stable and depends on pagination and search

  // Initial fetch saat komponen di-mount
  useEffect(() => {
    fetchContentItems();
  }, [fetchContentItems]); // Use fetchContentItems as a dependency

  // Handler untuk input pencarian
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    // Debounce search untuk menghindari terlalu banyak API calls
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchContentItems(1, value);
    }, 500);

    setSearchTimeout(timeout);
  };

  // Handler untuk perubahan halaman
  const handlePageChange = (page: number) => {
    fetchContentItems(page);
  };

  // Fungsi untuk refresh daftar content
  const handleRefresh = () => {
    setRefreshing(true);
    fetchContentItems(pagination.current_page);
  };

  // Fungsi untuk membuka modal delete
  const handleOpenDeleteModal = (id: number, title: string) => {
    setContentToDelete({ id, title });
    setDeleteModalOpen(true);
    setDeleteError("");
  };

  // Fungsi untuk menutup modal delete
  const handleCloseDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteError("");

    // Beri waktu agar animasi modal selesai sebelum mereset state
    setTimeout(() => {
      setContentToDelete(null);
    }, 200);
  };

  // Fungsi untuk konfirmasi penghapusan
  const handleConfirmDelete = async () => {
    if (!contentToDelete) return;

    setDeleteLoading(true);
    setDeleteError("");

    try {
      await deleteContent(contentToDelete.id);

      // Tutup modal
      setDeleteModalOpen(false);

      // Tampilkan pesan sukses
      setDeleteSuccess(`Content "${contentToDelete.title}" berhasil dihapus!`);

      // Refresh daftar content setelah delay singkat
      setTimeout(() => {
        fetchContentItems(pagination.current_page);
      }, 300);

      // Hapus pesan sukses setelah beberapa detik
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

  return (
    <AdminLayout>
      <Head>
        <title>Kelola Content - Admin Dashboard</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Header section */}
          <ReadHeader />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Search dan filter section */}
            {/* <ReadSearch
              search={search}
              totalItems={pagination.total}
              refreshing={refreshing}
              onSearchChange={handleSearchChange}
              onRefresh={handleRefresh}
            /> */}

            {/* Pesan error */}
            {error && <AlertMessage type="error" message={error} />}

            {/* Pesan sukses delete */}
            {deleteSuccess && <AlertMessage type="success" message={deleteSuccess} />}

            {/* Tabel content */}
            <ReadTable
              contentItems={contentItems}
              loading={loading}
              search={search}
              onDelete={handleOpenDeleteModal}
            />

            {/* Pagination */}
            {!loading && pagination.last_page > 1 && (
              <ReadPagination
                pagination={pagination}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal Konfirmasi Delete */}
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
