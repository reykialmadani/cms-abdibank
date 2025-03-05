// pages/admins/content/[id]/edit.tsx
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import AdminLayout from "@/pages/admins/component/AdminLayout";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

// Interface untuk option dropdown
interface DropdownOption {
  id: number;
  name: string;
}

// Interface untuk error validasi
interface ValidationErrors {
  sub_menu_id?: string;
  title?: string;
  description?: string;
  required_documents?: string;
  thumbnail?: string;
}

interface SubMenuResponse {
  id: number;
  sub_menu_name: string;
}

interface ContentDetail {
  id: number;
  title: string;
  description: string;
  required_documents: string | null;
  thumbnail: string | null;
  status: boolean;
  sub_menu_id: number;
}

export default function EditContent() {
  // State untuk form input
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [requiredDocuments, setRequiredDocuments] = useState<string>("");
  const [selectedSubMenu, setSelectedSubMenu] = useState<number | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [currentThumbnail, setCurrentThumbnail] = useState<string>("");
  const [status, setStatus] = useState<boolean>(true);
  
  // State untuk dropdown options
  const [subMenuOptions, setSubMenuOptions] = useState<DropdownOption[]>([]);
  
  // State untuk loading, error, dan sukses
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const router = useRouter();
  const { id } = router.query;

  // Fetch content data saat component mount
  useEffect(() => {
    const fetchContentData = async () => {
      if (!id) return;
      
      try {
        setInitialLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }

        // Fetch content detail
        const contentResponse = await axios.get(`/api/content/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const contentData: ContentDetail = contentResponse.data.data;
        
        // Set state dari data content
        setTitle(contentData.title);
        setDescription(contentData.description);
        setRequiredDocuments(contentData.required_documents || "");
        setSelectedSubMenu(contentData.sub_menu_id);
        setStatus(contentData.status);
        
        if (contentData.thumbnail) {
          setCurrentThumbnail(contentData.thumbnail);
          setThumbnailPreview(contentData.thumbnail);
        }
        
        // Fetch sub menu options
        const subMenuResponse = await axios.get('/api/subMenu', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const options = subMenuResponse.data.data.map((subMenu: SubMenuResponse) => ({
          id: subMenu.id,
          name: subMenu.sub_menu_name
        }));

        setSubMenuOptions(options);
        
      } catch (err) {
        console.error("Error fetching content data:", err);
        setError("Terjadi kesalahan saat mengambil data content");
      } finally {
        setInitialLoading(false);
      }
    };

    fetchContentData();
  }, [id, router]);

  // Handle file upload untuk thumbnail
  const handleThumbnailChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setThumbnail(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Reset error jika ada
      if (validationErrors.thumbnail) {
        setValidationErrors(prev => ({ ...prev, thumbnail: undefined }));
      }
    }
  };

  // Handle reset thumbnail
  const handleResetThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview(currentThumbnail);
  };

  // Handle hapus thumbnail
  const handleRemoveThumbnail = () => {
    setThumbnail(null);
    setThumbnailPreview("");
    setCurrentThumbnail("");
  };

  // Validasi form sebelum submit
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (title.trim().length < 5) {
      errors.title = "Judul harus minimal 5 karakter";
    }
    
    if (!selectedSubMenu) {
      errors.sub_menu_id = "Sub menu harus dipilih";
    }
    
    if (description.trim().length < 20) {
      errors.description = "Deskripsi harus minimal 20 karakter";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validasi form
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    // Construct FormData untuk upload file
    const formData = new FormData();
    formData.append("_method", "PUT"); // Laravel/PHP handling untuk PUT request dengan FormData
    formData.append("title", title);
    formData.append("description", description);
    formData.append("required_documents", requiredDocuments);
    formData.append("status", status.toString());
    
    if (selectedSubMenu) {
      formData.append("sub_menu_id", selectedSubMenu.toString());
    }
    
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    } else if (currentThumbnail === "") {
      // Jika thumbnail sebelumnya ada, tapi user menghapusnya
      formData.append("remove_thumbnail", "1");
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/');
        return;
      }
      
      await axios.post(`/api/content/${id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess("Content berhasil diperbarui!");
      
      // Redirect ke halaman detail content setelah 2 detik
      setTimeout(() => {
        router.push(`/admins/content/${id}/detail`);
      }, 2000);
      
    } catch (err) {
      console.error("Error updating content:", err);
      
      if (axios.isAxiosError(err)) {
        // Handle validation errors from server
        if (err.response?.status === 422 && err.response?.data?.errors) {
          setValidationErrors(err.response.data.errors);
        } else {
          setError(err.response?.data?.message || "Terjadi kesalahan saat mengupdate content");
        }
      } else {
        setError("Terjadi kesalahan saat menghubungi server");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Edit Content - Admin Dashboard</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/admins/dashboard')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Kembali
            </button>
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900">Edit Content</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {initialLoading ? (
              // Loading skeleton
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="animate-pulse space-y-6">
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-24 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  {/* Success message */}
                  {success && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">{success}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Error message */}
                  {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sub Menu Dropdown */}
                    <div>
                      <label htmlFor="subMenu" className="block text-sm font-medium text-gray-700">
                        Sub Menu
                      </label>
                      <div className="mt-1">
                        <select
                          id="subMenu"
                          value={selectedSubMenu || ""}
                          onChange={(e) => setSelectedSubMenu(e.target.value ? parseInt(e.target.value) : null)}
                          className={`block w-full px-3 py-2 border ${
                            validationErrors.sub_menu_id ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        >
                          <option value="">Pilih Sub Menu</option>
                          {subMenuOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name}
                            </option>
                          ))}
                        </select>
                        {validationErrors.sub_menu_id && (
                          <p className="mt-2 text-sm text-red-600">{validationErrors.sub_menu_id}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Judul
                      </label>
                      <div className="mt-1">
                        <input
                          type="text"
                          id="title"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className={`block w-full px-3 py-2 border ${
                            validationErrors.title ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          placeholder="Masukkan judul content"
                        />
                        {validationErrors.title && (
                          <p className="mt-2 text-sm text-red-600">{validationErrors.title}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Description */}
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Deskripsi
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className={`block w-full px-3 py-2 border ${
                            validationErrors.description ? 'border-red-300' : 'border-gray-300'
                          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          placeholder="Masukkan deskripsi"
                        />
                        {validationErrors.description && (
                          <p className="mt-2 text-sm text-red-600">{validationErrors.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Required Documents */}
                    <div>
                      <label htmlFor="requiredDocuments" className="block text-sm font-medium text-gray-700">
                        Dokumen yang Dibutuhkan (opsional)
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="requiredDocuments"
                          rows={3}
                          value={requiredDocuments}
                          onChange={(e) => setRequiredDocuments(e.target.value)}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          placeholder="Masukkan daftar dokumen yang dibutuhkan"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">
                        Daftar dokumen yang diperlukan, pisahkan dengan baris baru.
                      </p>
                    </div>
                    
                    {/* Thumbnail */}
                    <div>
                      <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700">
                        Thumbnail (opsional)
                      </label>
                      <div className="mt-1 flex flex-col">
                        <div className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                          <div className="space-y-1 text-center">
                            {thumbnailPreview ? (
                              <div className="mb-3">
                                <Image 
                                  src={thumbnailPreview} 
                                  alt="Thumbnail preview" 
                                  width={128}
                                  height={128}
                                  className="mx-auto h-32 w-auto object-cover"
                                />
                              </div>
                            ) : (
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            )}
                            <div className="flex text-sm text-gray-600">
                              <label
                                htmlFor="thumbnail"
                                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                              >
                                <span>Upload gambar</span>
                                <input
                                  id="thumbnail"
                                  name="thumbnail"
                                  type="file"
                                  accept="image/*"
                                  className="sr-only"
                                  onChange={handleThumbnailChange}
                                />
                              </label>
                              <p className="pl-1">atau seret dan lepas</p>
                            </div>
                            <p className="text-xs text-gray-500">
                              PNG, JPG, GIF sampai 2MB
                            </p>
                          </div>
                        </div>
                        
                        {/* Thumbnail action buttons */}
                        {thumbnailPreview && (
                          <div className="mt-2 flex justify-center space-x-3">
                            {thumbnail && currentThumbnail && (
                              <button
                                type="button"
                                onClick={handleResetThumbnail}
                                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              >
                                Kembalikan ke Thumbnail Sebelumnya
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={handleRemoveThumbnail}
                              className="inline-flex items-center px-3 py-1 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Hapus Thumbnail
                            </button>
                          </div>
                        )}
                      </div>
                      {validationErrors.thumbnail && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.thumbnail}</p>
                      )}
                    </div>
                    
                    {/* Status Toggle */}
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="status"
                          name="status"
                          type="checkbox"
                          checked={status}
                          onChange={(e) => setStatus(e.target.checked)}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="status" className="font-medium text-gray-700">
                          Aktif
                        </label>
                        <p className="text-gray-500">Content akan ditampilkan jika diaktifkan</p>
                      </div>
                    </div>
                    
                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => router.push(`/admins/content/${id}/detail`)}
                        className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        {loading ? "Menyimpan..." : "Simpan Perubahan"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}