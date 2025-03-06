// Enhancement to pages/admins/content/create.tsx
import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import AdminLayout from "@/pages/admins/component/AdminLayout";

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

// Interface untuk list item
interface ListItem {
  id: string;
  text: string;
  level: number;
  children: ListItem[];
  isExpanded?: boolean;
}

export default function CreateContent() {
  // State untuk form input
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [descriptionFormat, setDescriptionFormat] = useState<
    "paragraph" | "simple-list" | "nested-list"
  >("paragraph");
  const [requiredDocuments, setRequiredDocuments] = useState<string>("");
  const [selectedSubMenu, setSelectedSubMenu] = useState<number | null>(null);
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [status, setStatus] = useState<boolean>(true);

  // State untuk nested list
  const [listItems, setListItems] = useState<ListItem[]>([
    { id: "1", text: "", level: 1, children: [] },
  ]);
  const [currentListId, setCurrentListId] = useState<number>(2);

  // State untuk preview
  const [showPreview, setShowPreview] = useState<boolean>(false);

  // State untuk dropdown options
  const [subMenuOptions, setSubMenuOptions] = useState<DropdownOption[]>([]);

  // State untuk loading, error, dan sukses
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>(
    {}
  );

  const router = useRouter();

  // Fetch sub menu options dari API saat komponen di-mount
  useEffect(() => {
    const fetchSubMenuOptions = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }

        const response = await axios.get("/api/subMenu", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const options = response.data.data.map((subMenu: SubMenuResponse) => ({
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
        setValidationErrors((prev) => ({ ...prev, thumbnail: undefined }));
      }
    }
  };

  // Add new list item
  const addListItem = (parentId: string | null = null, level: number = 1) => {
    const newId = currentListId.toString();
    setCurrentListId((prev) => prev + 1);

    if (!parentId) {
      // Add to root level
      setListItems([
        ...listItems,
        { id: newId, text: "", level, children: [] },
      ]);
    } else {
      // Add as child of specified parent
      const updatedItems = [...listItems];

      // Helper function to recursively find and update the parent
      const addChild = (items: ListItem[], parentId: string): boolean => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === parentId) {
            items[i].children.push({
              id: newId,
              text: "",
              level: items[i].level + 1,
              children: [],
            });
            items[i].isExpanded = true;
            return true;
          }

          if (items[i].children.length > 0) {
            if (addChild(items[i].children, parentId)) {
              return true;
            }
          }
        }
        return false;
      };

      addChild(updatedItems, parentId);
      setListItems(updatedItems);
    }
  };

  // Remove list item
  const removeListItem = (id: string) => {
    // Helper function to recursively filter out the item and its children
    const filterItems = (items: ListItem[]): ListItem[] => {
      return items.filter((item) => {
        if (item.id === id) return false;
        if (item.children.length > 0) {
          item.children = filterItems(item.children);
        }
        return true;
      });
    };

    setListItems(filterItems([...listItems]));
  };

  // Update list item text
  const updateListItemText = (id: string, text: string) => {
    // Helper function to recursively find and update item
    const updateItem = (items: ListItem[]): ListItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, text };
        }
        if (item.children.length > 0) {
          return { ...item, children: updateItem(item.children) };
        }
        return item;
      });
    };

    setListItems(updateItem([...listItems]));
  };

  // Toggle expand/collapse of a list item
  const toggleExpand = (id: string) => {
    // Helper function to recursively find and toggle item
    const toggleItem = (items: ListItem[]): ListItem[] => {
      return items.map((item) => {
        if (item.id === id) {
          return { ...item, isExpanded: !item.isExpanded };
        }
        if (item.children.length > 0) {
          return { ...item, children: toggleItem(item.children) };
        }
        return item;
      });
    };

    setListItems(toggleItem([...listItems]));
  };

  // Convert nested list structure to HTML
  const convertListToHtml = (items: ListItem[]): string => {
    // Skip empty lists
    if (
      items.length === 0 ||
      (items.length === 1 &&
        items[0].text.trim() === "" &&
        items[0].children.length === 0)
    ) {
      return "";
    }

    let html = '<ol class="c">';

    items.forEach((item) => {
      // Skip empty items
      if (item.text.trim() === "" && item.children.length === 0) {
        return;
      }

      html += `<li>${item.text.trim()}`;

      if (item.children.length > 0) {
        const hasNonEmptyChildren = item.children.some(
          (child) => child.text.trim() !== ""
        );

        if (hasNonEmptyChildren) {
          html += `<ol class="d">${item.children
            .filter((child) => child.text.trim() !== "")
            .map((child) => `<li>${child.text.trim()}</li>`)
            .join("")}</ol>`;
        }
      }

      html += "</li>";
    });

    html += "</ol>";
    return html;
  };

  // Convert nested list structure to description field based on format
  const generateDescriptionFromList = (): string => {
    if (descriptionFormat === "nested-list") {
      return convertListToHtml(listItems);
    } else if (descriptionFormat === "simple-list") {
      // Create simple bulleted list
      let content = "";

      const processItems = (items: ListItem[], indent: string = "") => {
        items.forEach((item) => {
          if (item.text.trim()) {
            content += `${indent}- ${item.text.trim()}\n`;
          }

          if (item.children.length > 0) {
            processItems(item.children, indent + "  ");
          }
        });
      };

      processItems(listItems);
      return content;
    }

    return description; // Return regular description if not a list
  };

  // Extract text content from HTML for validation
  const getTextContentLength = (html: string): number => {
    // Simple approach: strip HTML tags and count remaining characters
    const textContent = html.replace(/<[^>]*>/g, "").trim();
    return textContent.length;
  };

  // Fungsi untuk menampilkan preview sesuai format
  const getFormattedPreview = (): JSX.Element => {
    if (descriptionFormat === "paragraph") {
      return <div className="whitespace-pre-wrap">{description}</div>;
    } else if (descriptionFormat === "simple-list") {
      const items = description
        .split(/\n+/)
        .filter((item) => item.trim() !== "");
      return (
        <ul className="list-disc pl-5">
          {items.map((item, index) => (
            <li key={index}>{item.trim().replace(/^-\s*/, "")}</li>
          ))}
        </ul>
      );
    } else {
      // Render nested list preview
      return (
        <div
          className="nested-list-preview"
          dangerouslySetInnerHTML={{ __html: convertListToHtml(listItems) }}
        />
      );
    }
  };

  // Recursive component to render list items with proper indentation
  const renderListItems = (items: ListItem[], indent: number = 0) => {
    return items.map((item) => (
      <div key={item.id}>
        <div
          className="flex items-center mb-2"
          style={{ marginLeft: `${indent * 20}px` }}
        >
          <div className="flex-grow flex items-center">
            {item.children.length > 0 && (
              <button
                type="button"
                onClick={() => toggleExpand(item.id)}
                className="mr-2 text-gray-500 focus:outline-none"
              >
                {item.isExpanded ? "▼" : "►"}
              </button>
            )}
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateListItemText(item.id, e.target.value)}
              className="flex-grow p-2 border border-gray-300 rounded-md text-sm"
              placeholder={`Level ${item.level} item...`}
            />
          </div>
          <div className="ml-2 flex">
            <button
              type="button"
              onClick={() => addListItem(item.id, item.level + 1)}
              className="p-1 bg-blue-100 text-blue-600 rounded-md mr-1 text-xs"
              title="Add child item"
            >
              + Sub
            </button>
            <button
              type="button"
              onClick={() => removeListItem(item.id)}
              className="p-1 bg-red-100 text-red-600 rounded-md text-xs"
              title="Remove item"
            >
              ✕
            </button>
          </div>
        </div>

        {item.children.length > 0 && item.isExpanded && (
          <div className="ml-4">
            {renderListItems(item.children, indent + 1)}
          </div>
        )}
      </div>
    ));
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

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Dump the current state for debugging
    console.log("Form submission state:", {
      descriptionFormat,
      title,
      selectedSubMenu,
      hasThumbnail: !!thumbnail,
      status,
    });

    try {
      // Format description based on selected type before validation
      if (descriptionFormat === "nested-list") {
        const formattedDesc = generateDescriptionFromList();
        console.log("Generated HTML description:", formattedDesc);

        // Store temporarily to not affect the UI
        const tempDescription = formattedDesc;

        // Check validation with the formatted content
        if (!validateForm()) {
          console.log("Validation failed");
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
          console.log("Validation failed");
          return;
        }

        // For debugging, check if description is properly formatted for simple-list
        if (descriptionFormat === "simple-list") {
          console.log("Simple list description:", description);
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

  // Prepare form data for submission
  const prepareFormData = (descriptionContent: string) => {
    if (!selectedSubMenu) {
      setError("Sub Menu harus dipilih");
      return null;
    }

    console.log("Creating FormData with description content:", {
      format: descriptionFormat,
      contentLength: descriptionContent.length,
      contentPreview: descriptionContent.substring(0, 100),
    });

    // Create the form data object - following original implementation pattern
    const formData = new FormData();

    // Add all form fields directly
    formData.append("title", title);
    formData.append("description", descriptionContent);
    formData.append("required_documents", requiredDocuments);
    formData.append("status", status.toString());
    formData.append("sub_menu_id", selectedSubMenu.toString());

    if (thumbnail) {
      formData.append("thumbnail", thumbnail);
    }

    return formData;
  };

  // Submit the form to the API
  // Ganti kode submitForm di create.tsx

  const submitForm = async (formData: FormData | null) => {
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

      // Buat JSON object dari FormData
      const jsonData: Record<string, any> = {};
      for (const pair of (formData as any).entries()) {
        // Skip file uploads untuk JSON
        if (pair[0] !== "thumbnail") {
          jsonData[pair[0]] = pair[1];
        }
      }

      // Konversi sub_menu_id ke number jika diperlukan
      if (jsonData.sub_menu_id) {
        jsonData.sub_menu_id = parseInt(jsonData.sub_menu_id);
      }

      // Konversi status ke boolean jika diperlukan
      if (jsonData.status === "true") {
        jsonData.status = true;
      } else if (jsonData.status === "false") {
        jsonData.status = false;
      }

      console.log("Mengirim data JSON:", jsonData);

      if (!thumbnail) {
        // Jika tidak ada thumbnail, kirim JSON saja
        const response = await axios.post("/api/content", jsonData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Berhasil dengan JSON:", response.data);
        setSuccess("Content berhasil dibuat!");

        setTimeout(() => {
          router.push("/admins/content/read");
        }, 2000);
      } else {
        // Jika ada thumbnail, gunakan pendekatan hybrid
        const hybridFormData = new FormData();
        hybridFormData.append("thumbnail", thumbnail);
        hybridFormData.append("data", JSON.stringify(jsonData));

        const response = await axios.post("/api/content", hybridFormData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Berhasil dengan pendekatan hybrid:", response.data);
        setSuccess("Content berhasil dibuat!");

        setTimeout(() => {
          router.push("/admins/content/read");
        }, 2000);
      }
    } catch (err) {
      // handle error seperti sebelumnya
      console.error("Error creating content:", err);
      // ... kode error handling lainnya
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
          <h1 className="text-2xl font-semibold text-gray-900">
            Tambah Content Baru
          </h1>
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
                        <svg
                          className="h-5 w-5 text-green-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
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
                        <svg
                          className="h-5 w-5 text-red-400"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
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
                    <label
                      htmlFor="subMenu"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Sub Menu
                    </label>
                    <div className="mt-1">
                      <select
                        id="subMenu"
                        value={selectedSubMenu || ""}
                        onChange={(e) =>
                          setSelectedSubMenu(
                            e.target.value ? parseInt(e.target.value) : null
                          )
                        }
                        className={`text-black block w-full px-3 py-2 border ${
                          validationErrors.sub_menu_id
                            ? "border-red-300"
                            : "border-gray-300"
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
                        <p className="mt-2 text-sm text-red-600">
                          {validationErrors.sub_menu_id}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Judul
                    </label>
                    <div className="mt-1">
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`text-black block w-full px-3 py-2 border ${
                          validationErrors.title
                            ? "border-red-300"
                            : "border-gray-300"
                        } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                        placeholder="Masukkan judul content"
                      />
                      {validationErrors.title && (
                        <p className="mt-2 text-sm text-red-600">
                          {validationErrors.title}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Description Format Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Format Deskripsi
                    </label>
                    <div className="flex flex-wrap gap-4">
                      <div className="flex items-center">
                        <input
                          id="format-paragraph"
                          name="description-format"
                          type="radio"
                          value="paragraph"
                          checked={descriptionFormat === "paragraph"}
                          onChange={() => setDescriptionFormat("paragraph")}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label
                          htmlFor="format-paragraph"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Paragraf
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="format-simple-list"
                          name="description-format"
                          type="radio"
                          value="simple-list"
                          checked={descriptionFormat === "simple-list"}
                          onChange={() => setDescriptionFormat("simple-list")}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label
                          htmlFor="format-simple-list"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Daftar Sederhana
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="format-nested-list"
                          name="description-format"
                          type="radio"
                          value="nested-list"
                          checked={descriptionFormat === "nested-list"}
                          onChange={() => setDescriptionFormat("nested-list")}
                          className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                        />
                        <label
                          htmlFor="format-nested-list"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Daftar Berjenjang
                        </label>
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {descriptionFormat === "paragraph"
                        ? "Deskripsi akan ditampilkan sebagai paragraf teks."
                        : descriptionFormat === "simple-list"
                        ? "Deskripsi akan diubah menjadi daftar. Pisahkan point dengan baris baru."
                        : "Deskripsi akan dibuat sebagai daftar berjenjang dengan sub-items."}
                    </p>
                  </div>

                  {/* Description */}
                  {descriptionFormat !== "nested-list" ? (
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Deskripsi
                      </label>
                      <div className="mt-1">
                        <textarea
                          id="description"
                          rows={4}
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className={`text-black block w-full px-3 py-2 border ${
                            validationErrors.description
                              ? "border-red-300"
                              : "border-gray-300"
                          } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                          placeholder={
                            descriptionFormat === "paragraph"
                              ? "Masukkan deskripsi dalam bentuk paragraf"
                              : "Masukkan deskripsi dalam bentuk poin. Pisahkan dengan baris baru."
                          }
                        />
                        {validationErrors.description && (
                          <p className="mt-2 text-sm text-red-600">
                            {validationErrors.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Deskripsi Daftar Berjenjang
                      </label>
                      <div className="border border-gray-300 rounded-md p-4">
                        <div className="mb-3 flex justify-between items-center">
                          <h3 className="text-sm font-medium text-gray-700">
                            Daftar Item
                          </h3>
                          <button
                            type="button"
                            onClick={() => addListItem(null, 1)}
                            className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm"
                          >
                            + Tambah Item
                          </button>
                        </div>

                        <div className="space-y-1">
                          {renderListItems(listItems)}
                        </div>

                        {validationErrors.description && (
                          <p className="mt-2 text-sm text-red-600">
                            {validationErrors.description}
                          </p>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Klik + Sub untuk menambahkan sub-item. Klik ✕ untuk
                        menghapus item.
                      </p>
                    </div>
                  )}

                  <div className="mt-2 flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      Minimal 20 karakter.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm text-blue-600 hover:text-blue-500"
                    >
                      {showPreview ? "Sembunyikan Preview" : "Lihat Preview"}
                    </button>
                  </div>

                  {/* Description Preview */}
                  {showPreview && (
                    <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Preview:
                      </h4>
                      <div className="text-sm text-gray-800">
                        {getFormattedPreview()}
                      </div>
                    </div>
                  )}

                  {/* Required Documents */}
                  <div>
                    <label
                      htmlFor="requiredDocuments"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                      Daftar dokumen yang diperlukan, pisahkan dengan baris
                      baru.
                    </p>
                  </div>

                  {/* Thumbnail */}
                  <div>
                    <label
                      htmlFor="thumbnail"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                                width={128}
                                height={128}
                                className="mx-auto h-32 w-auto object-cover"
                                unoptimized={true}
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
                      <p className="mt-2 text-sm text-red-600">
                        {validationErrors.thumbnail}
                      </p>
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
                      <label
                        htmlFor="status"
                        className="font-medium text-gray-700"
                      >
                        Aktif
                      </label>
                      <p className="text-gray-500">
                        Content akan ditampilkan jika diaktifkan
                      </p>
                    </div>
                  </div>

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
