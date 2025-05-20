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
  const reportTypes = [
    { id: "bulanan", name: "Laporan Bulanan" },
    { id: "tahunan", name: "Laporan Tahunan" },
    { id: "tata-kelola", name: "Tata Kelola" },
    { id: "publikasi", name: "Publikasi" },
  ];

  return (
    <div>
      <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">
        Jenis Laporan <span className="text-red-500">*</span>
      </label>
      <select
        id="reportType"
        name="reportType"
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
          validationError ? "border-red-300" : ""
        }`}
        value={reportType}
        onChange={(e) => setReportType(e.target.value)}
      >
        <option value="">
          <span className="text-black">Pilih Jenis Laporan</span>
        </option>
        {reportTypes.map((type) => (
          <option key={type.id} value={type.id} style={{ color: "black" }}>
            {type.name}
          </option>
        ))}
      </select>
      {validationError && (
        <p className="mt-2 text-sm text-red-600">{validationError}</p>
      )}
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
  const months = [
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
    <div>
      <label htmlFor="month" className="block text-sm font-medium text-gray-700">
        Bulan {!disabled && <span className="text-red-500">*</span>}
      </label>
      <select
        id="month"
        name="month"
        className={`mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md ${
          validationError ? "border-red-300" : ""
        }`}
        value={selectedMonth || ""}
        onChange={(e) => setSelectedMonth(Number(e.target.value))}
        disabled={disabled}
      >
        <option value="">
          <span className="text-black">Pilih Bulan</span>
        </option>
        {months.map((month) => (
          <option key={month.id} value={month.id} style={{ color: "black" }}>
            {month.name}
          </option>
        ))}
      </select>
      {validationError && (
        <p className="mt-2 text-sm text-red-600">{validationError}</p>
      )}
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
      <label htmlFor="year" className="block text-sm font-medium text-gray-700">
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
        className={`mt-1 block w-full shadow-sm sm:text-sm rounded-md ${
          validationError
            ? "border-red-300 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
        }`}
      />
      {validationError && (
        <p className="mt-2 text-sm text-red-600">{validationError}</p>
      )}
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
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

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
        const response = await axios.get("/api/subMenu", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Filter hanya untuk submenu laporan
        const options = response.data.data
          .filter((subMenu: any) =>
            subMenu.sub_menu_name.toLowerCase().includes("laporan")
          )
          .map((subMenu: any) => ({
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
      const jsonData: any = {
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
    } catch (err: any) {
      console.error("Error creating report:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else if (err.response && err.response.data && err.response.data.error) {
        setError(err.response.data.error);
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
          <h1 className="text-2xl font-semibold text-gray-900">
            Tambah Laporan Baru
          </h1>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {/* Card container */}
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                {/* Alert Messages */}
                {success && <AlertMessage type="success" message={success} />}
                {error && <AlertMessage type="error" message={error} />}
                
                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
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
                  
                  {/* Month and Year Selectors (side by side) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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