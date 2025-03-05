// pages/admins/content/deta.tsx
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import AdminLayout from "@/pages/admins/component/AdminLayout";

// Interface untuk menu dan sub menu options
interface MenuOption {
  id: number;
  menu_name: string;
}

interface SubMenuOption {
  id: number;
  name: string;
  menu_id: number;
}

// Interface untuk error validasi
interface ValidationErrors {
  menu_id?: string;
  sub_menu_id?: string;
  title?: string;
  description?: string;
  required_documents?: string;
  thumbnail?: string;
}

interface SubMenuResponse {
  id: number;
  sub_menu_name: string;
  menu_id: number;
}

interface MenuResponse {
  id: number;
  menu_name: string;
}
  
export default function CreateContent() {
  // State untuk form input
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [requiredDocuments, setRequiredDocuments] = useState<string>("");
  const [selectedMenu, setSelectedMenu] = useState<number | null>(null);
  const [selectedSubMenu, setSelectedSubMenu] = useState<number | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [status, setStatus] = useState<boolean>(true);
  
  // State untuk dropdown options
  const [menuOptions, setMenuOptions] = useState<MenuOption[]>([]);
  const [allSubMenuOptions, setAllSubMenuOptions] = useState<SubMenuOption[]>([]);
  const [filteredSubMenuOptions, setFilteredSubMenuOptions] = useState<SubMenuOption[]>([]);
  
  // State untuk loading, error, dan sukses
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const router = useRouter();

  // Fetch menu options dari API saat komponen di-mount
  useEffect(() => {
    const fetchMenuOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }

        const response = await axios.get('/api/menu', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const options = response.data.data.map((menu: MenuResponse) => ({
          id: menu.id,
          menu_name: menu.menu_name
        }));

        setMenuOptions(options);
      } catch (err) {
        console.error("Error fetching menu options:", err);
      }
    };

    fetchMenuOptions();
  }, [router]);

  // Fetch sub menu options dari API saat komponen di-mount
  useEffect(() => {
    const fetchSubMenuOptions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/');
          return;
        }

        const response = await axios.get('/api/subMenu', {
          headers: { Authorization: `Bearer ${token}` }
        });

        const options = response.data.data.map((subMenu: SubMenuResponse) => ({
          id: subMenu.id,
          name: subMenu.sub_menu_name,
          menu_id: subMenu.menu_id
        }));

        setAllSubMenuOptions(options);
      } catch (err) {
        console.error("Error fetching sub menu options:", err);
      }
    };

    fetchSubMenuOptions();
  }, [router]);

  // Filter sub menu options berdasarkan menu yang dipilih
  useEffect(() => {
    if (selectedMenu) {
      const filtered = allSubMenuOptions.filter(
        subMenu => subMenu.menu_id === selectedMenu
      );
      setFilteredSubMenuOptions(filtered);
      
      // Reset selected sub menu jika tidak ada dalam daftar yang difilter
      if (selectedSubMenu && !filtered.some(option => option.id === selectedSubMenu)) {
        setSelectedSubMenu(null);
      }
    } else {
      setFilteredSubMenuOptions([]);
      setSelectedSubMenu(null);
    }
  }, [selectedMenu, allSubMenuOptions, selectedSubMenu]);

  // Handle menu selection change
  const handleMenuChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const menuId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedMenu(menuId);
    
    // Reset error jika ada
    if (validationErrors.menu_id) {
      setValidationErrors(prev => ({ ...prev, menu_id: undefined }));
    }
  };

  // Handle sub menu selection change
  const handleSubMenuChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const subMenuId = e.target.value ? parseInt(e.target.value) : null;
    setSelectedSubMenu(subMenuId);
    
    // Reset error jika ada
    if (validationErrors.sub_menu_id) {
      setValidationErrors(prev => ({ ...prev, sub_menu_id: undefined }));
    }
  };

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

  // Validasi form sebelum submit
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!selectedMenu) {
      errors.menu_id = "Menu harus dipilih";
    }
    
    if (!selectedSubMenu) {
      errors.sub_menu_id = "Sub menu harus dipilih";
    }
    
    if (title.trim().length < 5) {
      errors.title = "Judul harus minimal 5 karakter";
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
    formData.append("title", title);
    formData.append("description", description);
    
    // Tambahkan empty string jika tidak ada required documents
    formData.append("required_documents", requiredDocuments || "");
    
    // Konversi boolean ke string "0" atau "1" untuk API
    formData.append("status", status ? "1" : "0");
    
    // Pastikan sub_menu_id selalu ada
    if (selectedSubMenu) {
      formData.append("sub_menu_id", selectedSubMenu.toString());
    }
    
    // Tambahkan menu_id ke form data
    if (selectedMenu) {
      formData.append("menu_id", selectedMenu.toString());
    }
    
    // Thumbnail bisa opsional
    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/');
        return;
      }
      
      // Coba dengan endpoint yang berbeda - cek dari Network tab di browser
      await axios.post('/api/content/store', formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccess("Content berhasil dibuat!");
      
      // Redirect ke halaman list content setelah 2 detik
      setTimeout(() => {
        router.push('/admins/content/read');
      }, 2000);
      
    } catch (err) {
      console.error("Error creating content:", err);
      
      if (axios.isAxiosError(err)) {
        // Tampilkan error response untuk debugging
        console.log('Error response:', err.response?.data);
        
        // Handle validation errors from server
        if (err.response?.status === 422 && err.response?.data?.errors) {
          setValidationErrors(err.response.data.errors);
        } else {
          setError(err.response?.data?.message || "Terjadi kesalahan saat membuat content");
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
        <title>Tambah Content Baru - Admin Dashboard</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Tambah Content Baru</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Card container */}
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
                  {/* Menu Dropdown */}
                  <div>
                    <label htmlFor="menu" className="block text-sm font-medium text-gray-700">
                      Menu
                    </label>
                    <div className="mt-1">
                      <select
                        id="menu"
                        value={selectedMenu || ""}
                        onChange={handleMenuChange}
                        className={`text-black block w-full px-3 py-2 border ${
                          validationErrors.menu_id ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                      >
                        <option value="">Pilih Menu</option>
                        {menuOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.menu_name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.menu_id && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.menu_id}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Sub Menu Dropdown */}
                  <div>
                    <label htmlFor="subMenu" className="block text-sm font-medium text-gray-700">
                      Sub Menu
                    </label>
                    <div className="mt-1">
                      <select
                        id="subMenu"
                        value={selectedSubMenu || ""}
                        onChange={handleSubMenuChange}
                        className={`text-black block w-full px-3 py-2 border ${
                          validationErrors.sub_menu_id ? 'border-red-300' : 'border-gray-300'
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        disabled={!selectedMenu}
                      >
                        <option value="">Pilih Sub Menu</option>
                        {filteredSubMenuOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name}
                          </option>
                        ))}
                      </select>
                      {validationErrors.sub_menu_id && (
                        <p className="mt-2 text-sm text-red-600">{validationErrors.sub_menu_id}</p>
                      )}
                      {selectedMenu && filteredSubMenuOptions.length === 0 && (
                        <p className="mt-2 text-sm text-amber-600">
                          Tidak ada sub menu tersedia untuk menu ini
                        </p>
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
                        className={`text-black block w-full px-3 py-2 border ${
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
                        className={`text-black block w-full px-3 py-2 border ${
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
                        className="text-black block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    <div className="mt-1 flex items-center">
                      <div className="w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                        <div className="space-y-1 text-center">
                          {thumbnailPreview ? (
                            <div className="mb-3">
                              <Image 
                                src={thumbnailPreview} 
                                alt="Thumbnail preview" 
                                className="mx-auto h-32 w-auto object-cover"
                                width={128}
                                height={128}
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
                      onClick={() => router.push('/admins/content/read')}
                      className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}