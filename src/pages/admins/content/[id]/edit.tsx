// pages/admins/content/[id]/edit.tsx
import { useState, useEffect, FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import AdminLayout from "@/pages/admins/component/AdminLayout";
import SubMenuSelector from "@/pages/admins/component/SubMenuSelector";
import TitleInput from "@/pages/admins/component/TitleInput";
import DescriptionFormatSelector from "@/pages/admins/component/DescriptionFormatSelector";
import RequiredDocumentsInput from "@/pages/admins/component/RequiredDocumentsInput";
import StatusToggle from "@/pages/admins/component/StatusToggle";
import AlertMessage from "@/pages/admins/component/AlertMessage";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { DropdownOption, ValidationErrors } from "@/types/content";
import { getTextContentLength } from "@/utils/contentHelpers";

interface SubMenuResponse {
  id: number;
  sub_menu_name: string;
}

interface ContentDetail {
  id: number;
  title: string;
  description: string;
  required_documents: string | null;
  status: boolean;
  sub_menu_id: number;
  report_type?: string;
  report_year?: string;
}

export default function EditContent() {
  // State for form inputs
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [requiredDocuments, setRequiredDocuments] = useState<string>("");
  const [selectedSubMenu, setSelectedSubMenu] = useState<number | null>(null);
  const [status, setStatus] = useState<boolean>(true);
  
  // State for dropdown options
  const [subMenuOptions, setSubMenuOptions] = useState<DropdownOption[]>([]);
  
  // State for loading, error, and success
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // State untuk laporan
  const [isReportSubMenu, setIsReportSubMenu] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string | null>(null);
  const [reportYear, setReportYear] = useState<string | null>(null);
  
  const router = useRouter();
  const { id } = router.query;

  // Generate tahun untuk pilihan (2021-2025)
  const yearOptions = Array.from({ length: 5 }, (_, i) => String(2021 + i));

  // Cek apakah sub menu yang dipilih adalah laporan
  useEffect(() => {
    if (selectedSubMenu) {
      const selectedOption = subMenuOptions.find((option) => option.id === selectedSubMenu);
      // Periksa apakah nama sub menu mengandung kata "laporan" (case insensitive)
      const isReport = selectedOption 
        ? selectedOption.name.toLowerCase().includes("laporan") 
        : false;
      
      setIsReportSubMenu(isReport);
      
      if (!isReport) {
        setReportType(null);
        setReportYear(null);
      }
    } else {
      setIsReportSubMenu(false);
      setReportType(null);
      setReportYear(null);
    }
  }, [selectedSubMenu, subMenuOptions]);

  // Fetch content data when component mounts
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
        
        // Set state from content data
        setTitle(contentData.title);
        setDescription(contentData.description);
        setRequiredDocuments(contentData.required_documents || "");
        setSelectedSubMenu(contentData.sub_menu_id);
        setStatus(contentData.status);
        
        // Set report data if available
        if (contentData.report_type) {
          setReportType(contentData.report_type);
        }
        
        if (contentData.report_year) {
          setReportYear(contentData.report_year);
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

  // Validate form before submit
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    if (!isReportSubMenu && title.trim().length < 5) {
      errors.title = "Judul harus minimal 5 karakter";
    }
    
    if (!selectedSubMenu) {
      errors.sub_menu_id = "Sub menu harus dipilih";
    }

    // Validasi spesifik untuk sub menu laporan
    if (isReportSubMenu) {
      if (!reportType) {
        errors.reportType = "Jenis laporan harus dipilih";
      }
      
      if (!reportYear) {
        errors.reportYear = "Tahun laporan harus dipilih";
      }
    }
    
    // Validasi deskripsi menggunakan HTML dari React Quill
    if (!description || getTextContentLength(description) < 20) {
      errors.description = "Deskripsi harus minimal 20 karakter";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Prepare form data for submission
  const prepareFormData = () => {
    if (!selectedSubMenu) {
      setError("Sub Menu harus dipilih");
      return null;
    }

    // Membuat objek data
    const jsonData: Record<string, any> = {
      sub_menu_id: selectedSubMenu,
      description: description, // Use description directly from React Quill
      required_documents: requiredDocuments,
      status: status,
    };

    // Set judul berdasarkan kondisi (laporan atau regular)
    if (isReportSubMenu && reportType && reportYear) {
      jsonData.title = `Laporan ${reportType === 'triwulan' ? 'Triwulan' : 'Tahunan'} ${reportYear}`;
      jsonData.report_type = reportType;
      jsonData.report_year = reportYear;
    } else {
      jsonData.title = title;
    }

    // Ambil user ID dari local storage jika tersedia
    const userId = localStorage.getItem("userId");
    if (userId) {
      jsonData.updated_by = parseInt(userId);
    }

    return jsonData;
  };

  // Submit the form to the API
  const submitForm = async (formData: Record<string, any> | null) => {
    if (!formData) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setValidationErrors({});

    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/');
        return;
      }
      
      await axios.put(`/api/content/${id}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSuccess("Content berhasil diperbarui!");
      
      // Redirect to content list page after 2 seconds
      setTimeout(() => {
        router.push(`/admins/content/read`);
      }, 2000);
      
    } catch (err: any) {
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

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Validate form with React Quill data
      if (!validateForm()) {
        return;
      }

      // Prepare and submit form data
      const formData = prepareFormData();
      if (formData) {
        await submitForm(formData);
      }
    } catch (err) {
      console.error("Error in form submission:", err);
      setError("Terjadi kesalahan saat memproses form");
    }
  };

  // Render komponen Report Options
  const renderReportOptions = () => {
    if (!isReportSubMenu) return null;

    return (
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Jenis Laporan
          </label>
          <select
            className={` text-black mt-1 block w-full py-2 px-3 border ${
              validationErrors.reportType ? "border-red-300" : "border-gray-300"
            } bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            value={reportType || ""}
            onChange={(e) => setReportType(e.target.value)}
          >
            <option value="">Pilih Jenis Laporan</option>
            <option value="triwulan">Laporan Triwulan</option>
            <option value="tahunan">Laporan Tahunan</option>
          </select>
          {validationErrors.reportType && (
            <p className="mt-2 text-sm text-red-600">
              {validationErrors.reportType}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Tahun Laporan
          </label>
          <select
            className={`text-black mt-1 block w-full py-2 px-3 border ${
              validationErrors.reportYear ? "border-red-300" : "border-gray-300"
            } bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            value={reportYear || ""}
            onChange={(e) => setReportYear(e.target.value)}
          >
            <option value="">Pilih Tahun</option>
            {yearOptions.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          {validationErrors.reportYear && (
            <p className="mt-2 text-sm text-red-600">
              {validationErrors.reportYear}
            </p>
          )}
        </div>
      </div>
    );
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
              onClick={() => router.push(`/admins/content/read`)}
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
                  {/* Alert Messages */}
                  {success && (
                    <AlertMessage type="success" message={success} />
                  )}
                  {error && (
                    <AlertMessage type="error" message={error} />
                  )}
                  
                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Sub Menu Dropdown */}
                    <SubMenuSelector
                      selectedSubMenu={selectedSubMenu}
                      setSelectedSubMenu={setSelectedSubMenu}
                      options={subMenuOptions}
                      validationError={validationErrors.sub_menu_id}
                    />

                    {/* Report Options (Conditional) */}
                    {renderReportOptions()}

                    {/* Title (kondisional berdasarkan apakah sub menu adalah laporan) */}
                    {!isReportSubMenu && (
                      <TitleInput
                        title={title}
                        setTitle={setTitle}
                        validationError={validationErrors.title}
                      />
                    )}

                    {/* React Quill Editor */}
                    <div>
                      <DescriptionFormatSelector 
                        content={description}
                        setContent={setDescription}
                      />
                      {validationErrors.description && (
                        <p className="mt-2 text-sm text-red-600">
                          {validationErrors.description}
                        </p>
                      )}
                    </div>

                    {/* Required Documents */}
                    <RequiredDocumentsInput
                      requiredDocuments={requiredDocuments}
                      setRequiredDocuments={setRequiredDocuments}
                    />

                    {/* Status Toggle */}
                    <StatusToggle
                      status={status}
                      setStatus={setStatus}
                      label="Aktif"
                      description="Content akan ditampilkan jika diaktifkan"
                    />

                    {/* Form Actions */}
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={() => router.push(`/admins/content/read`)}
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