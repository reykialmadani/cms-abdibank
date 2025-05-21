import { useState, FormEvent, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import AdminLayout from "@/pages/admins/component/AdminLayout";
import SubMenuSelector from "@/pages/admins/component/create/SubMenuSelector";
import TitleInput from "@/pages/admins/component/create/TitleInput";
import StatusToggle from "@/pages/admins/component/create/StatusToggle";
import AlertMessage from "@/pages/admins/component/create/AlertMessage";
import RequiredDocumentsInput from "@/pages/admins/component/create/RequiredDocumentsInput";
import { DropdownOption } from "@/types/content";

// Define types for API responses and data structures
interface SubMenu {
  id: number;
  sub_menu_name: string;
}

interface ReportType {
  id: string;
  name: string;
}

interface Month {
  id: number;
  name: string;
}

interface ReportFormData {
  sub_menu_id: number | null;
  title: string;
  report_type: string;
  required_documents: string;
  status: number;
  year: string;
  month?: number | null;
  updated_by?: number;
}

// Komponen untuk memilih jenis laporan
const ReportTypeSelector = ({
  reportType,
  setReportType,
  validationError,
}: {
  reportType: string;
  setReportType: (type: string) => void;
  validationError?: string;
}) => {
  const reportTypes: ReportType[] = [
    { id: "bulanan", name: "Laporan Bulanan" },
    { id: "tahunan", name: "Laporan Tahunan" },
    { id: "tata-kelola", name: "Tata Kelola" },
    { id: "publikasi", name: "Publikasi" },
  ];

  return (
    <div className="relative">
      <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
        Jenis Laporan <span className="text-red-500">*</span>
      </label>
      <select
        id="reportType"
        name="reportType"
        className={`text-black form-select block w-full pl-3 pr-10 py-2.5 text-base border ${
          validationError
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        } rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 bg-white`}
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      >
        <option value="">
          <span className="text-gray-400">Pilih Jenis Laporan</span>
        </option>
        {reportTypes.map((type) => (
          <option key={type.id} value={type.id} className="text-gray-800">
            {type.name}
          </option>
        ))}
      </select>
      {validationError && <p className="mt-2 text-sm text-red-600">{validationError}</p>}
    </div>
  );
};

// Komponen untuk memilih bulan
const MonthSelector = ({
  selectedMonth,
  setSelectedMonth,
  validationError,
  disabled,
}: {
  selectedMonth: number | null;
  setSelectedMonth: (month: number) => void;
  validationError?: string;
  disabled?: boolean;
}) => {
  const months: Month[] = [
    { id: 1, name: "Januari" },
    { id: 2, name: "Februari" },
    { id: 3, name: "Maret" },
    { id: 4, name: "April" },
    { id: 5, name: "Mei" },
    { id: 6, name: "Juni" },
    { id: 7, name: "Juli" },
    { id: 8, name: "Agustus" },
    { id: 9, name: "September" },
    { id: 10, name: "Oktober" },
    { id: 11, name: "November" },
    { id: 12, name: "Desember" },
  ];

  return (
    <div className="relative">
      <label htmlFor="month" className="block text-sm font-medium text-gray-700 mb-1">
        Bulan {!disabled && <span className="text-red-500">*</span>}
      </label>
      <select
        id="month"
        name="month"
        className={`text-black form-select block w-full pl-3 pr-10 py-2.5 text-base border ${
          validationError
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        } rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
          disabled ? "bg-gray-100 text-gray-500" : "bg-white"
        }`}
        value={selectedMonth || ""}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
        disabled={disabled}
      >
        <option value="">
          <span className="text-gray-400">Pilih Bulan</span>
        </option>
        {months.map((month) => (
          <option key={month.id} value={month.id} className="text-gray-800">
            {month.name}
          </option>
        ))}
      </select>
      {validationError && <p className="mt-2 text-sm text-red-600">{validationError}</p>}
    </div>
  );
};

// Komponen untuk input tahun
const YearInput = ({
  year,
  setYear,
  validationError,
}: {
  year: string;
  setYear: (year: string) => void;
  validationError?: string;
}) => {
  const currentYear = new Date().getFullYear();

  return (
    <div>
      <label htmlFor="year" className="block text-sm font-medium text-gray-700 mb-1">
        Tahun <span className="text-red-500">*</span>
      </label>
      <input
        type="number"
        id="year"
        name="year"
        min="2000"
        max={currentYear + 5}
        value={year}
        onChange={(e) => setYear(e.target.value)}
        className={`text-black block w-full px-3 py-2.5 text-base border ${
          validationError
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        } rounded-lg transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50`}
      />
      {validationError && <p className="mt-2 text-sm text-red-600">{validationError}</p>}
    </div>
  );
};

export default function CreateReport() {
  // State untuk form inputs
  const [title, setTitle] = useState<string>("");
  const [reportType, setReportType] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [year, setYear] = useState<string>(`${new Date().getFullYear()}`);
  const [requiredDocuments, setRequiredDocuments] = useState<string>("");
  const [selectedSubMenu, setSelectedSubMenu] = useState<number | null>(null);
  const [status, setStatus] = useState<boolean>(false);

  // State untuk dropdown options
  const [subMenuOptions, setSubMenuOptions] = useState<DropdownOption[]>([]);

  // State untuk loading, error, dan success
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

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
        
        const response = await axios.get<{data: SubMenu[]}>("/api/subMenu", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Filter hanya untuk submenu laporan
        const options = response.data.data
          .filter((subMenu: SubMenu) => 
            subMenu.sub_menu_name.toLowerCase().includes("laporan")
          )
          .map((subMenu: SubMenu) => ({
            id: subMenu.id,
            name: subMenu.sub_menu_name,
          }));
          
        setSubMenuOptions(options);
        
        // Auto-select submenu laporan jika hanya ada satu
        if (options.length === 1) {
          setSelectedSubMenu(options[0].id);
        }
      } catch (err) {
        console.error("Error fetching sub menu options:", err);
      }
    };

    fetchSubMenuOptions();
  }, [router]);

  // Validasi form sebelum submit
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (title.trim().length < 5) {
      errors.title = "Judul harus minimal 5 karakter";
    }
    if (!selectedSubMenu) {
      errors.sub_menu_id = "Sub menu harus dipilih";
    }
    if (!reportType) {
      errors.reportType = "Jenis laporan harus dipilih";
    }
    if (reportType === "bulanan" && !selectedMonth) {
      errors.month = "Bulan harus dipilih untuk laporan bulanan";
    }
    if (!year || !/^\d{4}$/.test(year)) {
      errors.year = "Tahun harus 4 digit angka";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit form ke API
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }
      
      // Persiapkan data sesuai dengan jenis laporan
      const jsonData: ReportFormData = {
        sub_menu_id: selectedSubMenu,
        title: title,
        report_type: reportType, // Parameter baru untuk menunjukkan jenis laporan
        required_documents: requiredDocuments,
        status: status ? 1 : 0,
        year: year
      };
      
      // Tambahkan bulan hanya jika laporan bulanan
      if (reportType === "bulanan") {
        jsonData.month = selectedMonth;
      }
      
      // Ambil user ID dari local storage jika tersedia
      const userId = localStorage.getItem("userId");
      if (userId) {
        jsonData.updated_by = parseInt(userId);
      }
      
      // Kirim request POST ke endpoint yang benar
      await axios.post("/api/report/report", jsonData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      
      setSuccess("Laporan berhasil dibuat!");
      
      setTimeout(() => {
        router.push("/admins/content/read");
      }, 2000);
    } catch (err) {
      console.error("Error creating report:", err);
      
      // Type guard untuk error dari axios
      interface ApiErrorResponse {
        response?: {
          data?: {
            message?: string;
            error?: string;
          };
        };
      }
      
      const apiError = err as ApiErrorResponse;
      
      if (apiError.response?.data?.message) {
        setError(apiError.response.data.message);
      } else if (apiError.response?.data?.error) {
        setError(apiError.response.data.error);
      } else {
        setError("Terjadi kesalahan saat membuat laporan");
      }
    } finally {
      setLoading(false);
    }
  };

  // Cek apakah bulan harus ditampilkan berdasarkan tipe laporan
  const shouldShowMonth = reportType === "bulanan";

  return (
    <AdminLayout>
      <Head>
        <title>Tambah Laporan Baru - Admin Dashboard</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Tambah Laporan Baru
          </h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Card container dengan efek shadow dan radius */}
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
              {/* Card header dengan latar belakang berbeda */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
                <h2 className="text-lg font-medium text-gray-800">Detail Laporan</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Isi data laporan yang akan ditambahkan ke dalam sistem
                </p>
              </div>
              
              <div className="px-6 py-5">
                {/* Alert Messages */}
                {success && <AlertMessage type="success" message={success} />}
                {error && <AlertMessage type="error" message={error} />}
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Form sections with visual grouping */}
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <div className="space-y-5">
                        {/* Sub Menu Dropdown */}
                        <SubMenuSelector
                          selectedSubMenu={selectedSubMenu}
                          setSelectedSubMenu={setSelectedSubMenu}
                          options={subMenuOptions}
                          validationError={validationErrors.sub_menu_id}
                        />
                        
                        {/* Report Type Selector */}
                        <ReportTypeSelector
                          reportType={reportType}
                          setReportType={setReportType}
                          validationError={validationErrors.reportType}
                        />
                        
                        {/* Title */}
                        <TitleInput
                          title={title}
                          setTitle={setTitle}
                          validationError={validationErrors.title}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Periode Laporan
                      </h3>
                      {/* Month and Year Selectors (side by side with responsive design) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <MonthSelector
                          selectedMonth={selectedMonth}
                          setSelectedMonth={setSelectedMonth}
                          validationError={validationErrors.month}
                          disabled={!shouldShowMonth}
                        />
                        <YearInput
                          year={year}
                          setYear={setYear}
                          validationError={validationErrors.year}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Dokumen & Pengaturan
                      </h3>
                      <div className="space-y-5">
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
                          description="Laporan akan ditampilkan jika diaktifkan"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Form Actions dengan efek shadow saat hover */}
                  <div className="flex justify-end space-x-4 pt-2">
                    <button
                      type="button"
                      onClick={() => router.push("/admins/content/read")}
                      className="py-2.5 px-5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="py-2.5 px-5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 hover:shadow transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg
                            className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Menyimpan...
                        </span>
                      ) : (
                        "Simpan"
                      )}
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