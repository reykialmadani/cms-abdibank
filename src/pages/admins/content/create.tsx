import { useState, useEffect, FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios, { AxiosResponse } from "axios"; // Import AxiosResponse type
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
  // State for form inputs
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [descriptionFormat, setDescriptionFormat] = useState<"paragraph" | "nested-list">("paragraph");
  const [requiredDocuments, setRequiredDocuments] = useState<string>("");
  const [selectedSubMenu, setSelectedSubMenu] = useState<number | null>(null);
  const [status, setStatus] = useState<boolean>(true);

  // State for nested list
  const [listItems, setListItems] = useState<ListItem[]>([{ id: "1", text: "", level: 1, children: [] }]);
  const [currentListId, setCurrentListId] = useState<number>(2);

  // State for preview
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // State for dropdown options
  const [subMenuOptions, setSubMenuOptions] = useState<DropdownOption[]>([]);

  // State for loading, error, and success
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  const router = useRouter();

  // Fetch sub menu options from API when component mounts
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

  // Validate form before submit
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (title.trim().length < 5) {
      errors.title = "Judul harus minimal 5 karakter";
    }

    if (!selectedSubMenu) {
      errors.sub_menu_id = "Sub menu harus dipilih";
    }

    // For nested list, validate total content length
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

  // Prepare form data for submission
  const prepareFormData = (descriptionContent: string) => {
    if (!selectedSubMenu) {
      setError("Sub Menu harus dipilih");
      return null;
    }

    // Create the data object
    const jsonData: Record<string, any> = {
      title: title,
      description: descriptionContent,
      required_documents: requiredDocuments,
      status: status,
      sub_menu_id: selectedSubMenu
    };

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
      // Format description based on selected type before validation
      if (descriptionFormat === "nested-list") {
        const formattedDesc = generateDescriptionFromList(listItems, descriptionFormat);

        // Store temporarily to not affect the UI
        const tempDescription = formattedDesc;

        // Check validation with the formatted content
        if (!validateForm()) {
          return;
        }

        // If validation passes, use the formatted content
        const formData = prepareFormData(tempDescription);
        if (formData) {
          await submitForm(formData);
        }
      } else {
        // Regular validation and submission
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

                  {/* Title */}
                  <TitleInput
                    title={title}
                    setTitle={setTitle}
                    validationError={validationErrors.title}
                  />

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