
import { useState, useEffect, FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios, { AxiosResponse } from "axios";
import AdminLayout from "@/pages/admins/component/AdminLayout";
import SubMenuSelector from "@/pages/admins/component/create/SubMenuSelector";
import TitleInput from "@/pages/admins/component/create/TitleInput";
import DescriptionFormatSelector from "@/pages/admins/component/create/DescriptionFormatSelector";
import RequiredDocumentsInput from "@/pages/admins/component/create/RequiredDocumentsInput";
import StatusToggle from "@/pages/admins/component/create/StatusToggle";
import AlertMessage from "@/pages/admins/component/create/AlertMessage";
import { DropdownOption, ValidationErrors } from "@/types/content";
import { getTextContentLength } from "@/utils/contentHelpers";

export default function CreateContent() {
  // State untuk form inputs
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [requiredDocuments, setRequiredDocuments] = useState<string>("");
  const [selectedSubMenu, setSelectedSubMenu] = useState<number | null>(null);
  const [status, setStatus] = useState<boolean>(false);

  // State untuk dropdown options
  const [subMenuOptions, setSubMenuOptions] = useState<DropdownOption[]>([]);

  // State untuk loading, error, dan success
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
    
  );

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
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Filter out submenu yang mengandung kata "laporan"
      const options = response.data.data
        .filter((subMenu) => !subMenu.sub_menu_name.toLowerCase().includes('laporan'))
        .map((subMenu) => ({
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
  // Validasi form sebelum submit
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (title.trim().length < 5) {
      errors.title = "Judul harus minimal 5 karakter";
    }
    if (!selectedSubMenu) {
      errors.sub_menu_id = "Sub menu harus dipilih";
    }

    // Validasi deskripsi menggunakan HTML dari React Quill
    if (!description || getTextContentLength(description) < 20) {
      errors.description = "Deskripsi harus minimal 20 karakter";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Mempersiapkan data form untuk submission
  const prepareFormData = () => {
    if (!selectedSubMenu) {
      setError("Sub Menu harus dipilih");
      return null;
    }

    // Membuat objek data
    const jsonData: Record<string, any> = {
      sub_menu_id: selectedSubMenu,
      title: title,
      description: description,
      required_documents: requiredDocuments,
      status: status,
    };

    // Ambil user ID dari local storage jika tersedia
    const userId = localStorage.getItem("userId");
    if (userId) {
      jsonData.updated_by = parseInt(userId);
    }

    // Debug info
    console.log("Submitting data:", jsonData);
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
      // Validasi form dengan data dari React Quill
      if (!validateForm()) {
        return;
      }

      // Siapkan dan kirim data form
      const formData = prepareFormData();
      if (formData) {
        await submitForm(formData);
      }
    } catch (err) {
      console.error("Error in form submission:", err);
      setError("Terjadi kesalahan saat memproses form");
    }
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

                  {/* Title */}
                  <TitleInput
                    title={title}
                    setTitle={setTitle}
                    validationError={validationErrors.title}
                  />

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