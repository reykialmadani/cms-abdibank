// pages/admins/content/[id]/edit.tsx
import { useState, useEffect, FormEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
// Removed Image import
import AdminLayout from "@/pages/admins/component/AdminLayout";
import SubMenuSelector from "@/pages/admins/component/SubMenuSelector";
import TitleInput from "@/pages/admins/component/TitleInput";
import DescriptionFormatSelector from "@/pages/admins/component/DescriptionFormatSelector";
import DescriptionEditor from "@/pages/admins/component/DescriptionEditor";
import RequiredDocumentsInput from "@/pages/admins/component/RequiredDocumentsInput";
import StatusToggle from "@/pages/admins/component/StatusToggle";
import AlertMessage from "@/pages/admins/component/AlertMessage";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { DropdownOption, ValidationErrors, ListItem } from "@/types/content";
import { convertListToHtml, getTextContentLength, generateDescriptionFromList } from "@/utils/contentHelpers";

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
}

export default function EditContent() {
  // State for form inputs
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [descriptionFormat, setDescriptionFormat] = useState<"paragraph" | "nested-list">("paragraph");
  const [requiredDocuments, setRequiredDocuments] = useState<string>("");
  const [selectedSubMenu, setSelectedSubMenu] = useState<number | null>(null);
  const [status, setStatus] = useState<boolean>(true);
  // Removed thumbnail-related state variables
  
  // State for nested list
  const [listItems, setListItems] = useState<ListItem[]>([{ id: "1", text: "", level: 1, children: [] }]);
  const [currentListId, setCurrentListId] = useState<number>(2);

  // State for preview
  const [showPreview, setShowPreview] = useState<boolean>(false);
  
  // State for dropdown options
  const [subMenuOptions, setSubMenuOptions] = useState<DropdownOption[]>([]);
  
  // State for loading, error, and success
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  
  const router = useRouter();
  const { id } = router.query;

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
        
        if (contentData.description.includes('<ul>') || contentData.description.includes('<ol>')) {
          setDescriptionFormat("nested-list");

        } else {
          setDescriptionFormat("paragraph");
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

  // Removed thumbnail-related handler functions

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

    // Create the data object as JSON format
    const jsonData = {
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
      
      // Redirect to content detail page after 2 seconds
      setTimeout(() => {
        router.push(`/admins/content/${id}/detail`);
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
        <title>Edit Content - Admin Dashboard</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push(`/admins/content/${id}/detail`)}
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