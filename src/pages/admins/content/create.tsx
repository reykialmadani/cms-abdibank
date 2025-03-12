import { useState, useEffect, FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios, { AxiosResponse } from "axios";
import AdminLayout from "@/pages/admins/component/AdminLayout";
import SubMenuSelector from "@/pages/admins/component/SubMenuSelector";
import TitleInput from "@/pages/admins/component/TitleInput";
import DescriptionFormatSelector from "@/pages/admins/component/DescriptionFormatSelector";
import DescriptionEditor from "@/pages/admins/component/DescriptionEditor";
import RequiredDocumentsInput from "@/pages/admins/component/RequiredDocumentsInput";
import StatusToggle from "@/pages/admins/component/StatusToggle";
import AlertMessage from "@/pages/admins/component/AlertMessage";
import { DropdownOption, ValidationErrors, ListItem } from "@/types/content";
import { convertListToHtml, getTextContentLength, generateDescriptionFromList } from "@/utils/contentHelpers";

export default function CreateContent() {
  // State untuk form inputs
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [descriptionFormat, setDescriptionFormat] = useState<"paragraph" | "nested-list">("paragraph");
  const [requiredDocuments, setRequiredDocuments] = useState<string>("");
  const [selectedSubMenu, setSelectedSubMenu] = useState<number | null>(null);
  const [status, setStatus] = useState<boolean>(true);

  // State untuk nested list
  const [listItems, setListItems] = useState<ListItem[]>([{ id: "1", text: "", level: 1, children: [] }]);
  const [currentListId, setCurrentListId] = useState<number>(2);

  // State untuk preview
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // State untuk dropdown options
  const [subMenuOptions, setSubMenuOptions] = useState<DropdownOption[]>([]);

  // State untuk loading, error, dan success
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  // State untuk laporan
  const [isReportSubMenu, setIsReportSubMenu] = useState<boolean>(false);
  const [reportType, setReportType] = useState<string | null>(null);
  const [reportYear, setReportYear] = useState<string | null>(null);

  const router = useRouter();

  // Fetch sub menu options dari API saat komponen mount
  useEffect(() => {
    const fetchSubMenuOptions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }

        const response: AxiosResponse<{ data: { id: number; sub_menu_name: string }[] }> = await axios.get("/api/subMenu", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const options = response.data.data.map((subMenu) => ({
          id: subMenu.id,
          name: subMenu.sub_menu_name,
        }));

        setSubMenuOptions(options);
      } catch (err) {
        console.error("Error fetching sub menu options:", err);
      }
    };

    fetchSubMenuOptions();
  }, [router]);

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

  // Generate tahun untuk pilihan (2021-2025)
  const yearOptions = Array.from({ length: 5 }, (_, i) => String(2021 + i));

  // Validasi form sebelum submit
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

    // Untuk nested list, validasi total panjang konten
    if (descriptionFormat === "nested-list") {
      const htmlContent = convertListToHtml(listItems);
      if (getTextContentLength(htmlContent) < 20) {
        errors.description = "Deskripsi harus minimal 20 karakter";
      }
    } else if (description.trim().length < 20) {
      errors.description = "Deskripsi harus minimal 20 karakter";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Mempersiapkan data form untuk submission
  const prepareFormData = (descriptionContent: string) => {
    if (!selectedSubMenu) {
      setError("Sub Menu harus dipilih");
      return null;
    }

    // Membuat objek data
    const jsonData: Record<string, any> = {
      sub_menu_id: selectedSubMenu,
      description: descriptionContent,
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

  // Submit form ke API
  const submitForm = async (formData: Record<string, any> | null) => {
    if (!formData) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setValidationErrors({});

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/");
        return;
      }

      await axios.post("/api/content", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      setSuccess("Content berhasil dibuat!");

      setTimeout(() => {
        router.push("/admins/content/read");
      }, 2000);
    } catch (err: any) {
      console.error("Error creating content:", err);
      
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
      } else {
        setError("Terjadi kesalahan saat membuat content");
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      // Format deskripsi berdasarkan tipe yang dipilih sebelum validasi
      if (descriptionFormat === "nested-list") {
        const formattedDesc = generateDescriptionFromList(listItems, descriptionFormat);

        // Simpan sementara untuk tidak mempengaruhi UI
        const tempDescription = formattedDesc;

        // Periksa validasi dengan konten yang diformat
        if (!validateForm()) {
          return;
        }

        // Jika validasi lolos, gunakan konten yang diformat
        const formData = prepareFormData(tempDescription);
        if (formData) {
          await submitForm(formData);
        }
      } else {
        // Validasi dan submission reguler
        if (!validateForm()) {
          return;
        }

        const formData = prepareFormData(description);
        if (formData) {
          await submitForm(formData);
        }
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
        <title>Tambah Content Baru - Admin Dashboard</title>
      </Head>

      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Tambah Content Baru
          </h1>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Card container */}
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

                  {/* Description Format Selection */}
                  <DescriptionFormatSelector
                    descriptionFormat={descriptionFormat}
                    setDescriptionFormat={setDescriptionFormat}
                  />

                  {/* Description */}
                  <DescriptionEditor
                    descriptionFormat={descriptionFormat}
                    description={description}
                    setDescription={setDescription}
                    listItems={listItems}
                    setListItems={setListItems}
                    currentListId={currentListId}
                    setCurrentListId={setCurrentListId}
                    showPreview={showPreview}
                    setShowPreview={setShowPreview}
                    validationError={validationErrors.description}
                  />

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
                      onClick={() => router.push("/admins/content/read")}
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