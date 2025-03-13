import { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import axios from "axios";
// import Image from "next/image";
import AdminLayout from "@/pages/admins/component/AdminLayout";
import AlertMessage from "@/pages/admins/component/AlertMessage";
import "react-quill-new/dist/quill.snow.css"; // Import React Quill styles

interface Menu {
  id: number;
  menu_name: string;
  status: boolean;
  order_position: number;
  url: string;
  created_at: string;
  updated_at: string;
  updated_by: any;
}

interface SubMenu {
  id: number;
  menu_id: number;
  sub_menu_name: string;
  order_position: number;
  url: string;
  status: boolean;
  created_at: string;
  updated_at: string;
  updated_by: any;
  menu: Menu;
}

interface ContentDetail {
  id: number;
  sub_menu_id: number;
  title: string;
  description: string;
  required_documents?: string;
  thumbnail?: string;
  status: boolean;
  report_type?: string;
  report_year?: string;
  created_at: string;
  updated_at: string;
  updated_by?: any;
  deleted_at?: any;
  sub_menu: SubMenu;
}

export default function ContentDetail() {
  // State untuk data content
  const [content, setContent] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const router = useRouter();
  const { id } = router.query;

  // Fetch data content berdasarkan ID
  useEffect(() => {
    const fetchContent = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          router.push('/');
          return;
        }

        const response = await axios.get(`/api/content/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setContent(response.data.data);
      } catch (err) {
        console.error("Error fetching content detail:", err);
        setError("Gagal memuat data content. Silakan coba lagi nanti.");
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, router]);

  
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getRequiredDocuments = () => {
    if (!content?.required_documents) return [];
    
    try {
      // Jika required_documents adalah JSON string, parse terlebih dahulu
      const parsedDocs = JSON.parse(content.required_documents);
      if (Array.isArray(parsedDocs)) {
        return parsedDocs.filter(doc => doc.trim() !== '');
      }
      return [];
    } catch (e) {
      // Jika bukan JSON, gunakan split
      return content.required_documents.split('\n').filter(doc => doc.trim() !== '');
    }
  };

  // Function to check if the content needs to be parsed from markdown
  const renderDescription = () => {
    if (!content) return null;
    
    // Create a div element to safely parse the HTML content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content.description;
    
    // Check if content has proper HTML structure or if it's escaped
    if (tempDiv.querySelector('ol, ul, strong, em, u, p') || 
        content.description.includes('<ol') || 
        content.description.includes('<ul') || 
        content.description.includes('<strong')) {
      return (
        <div 
          className="ql-editor" // Use the actual React Quill editor class
          dangerouslySetInnerHTML={{ __html: content.description }} 
        />
      );
    } else {
      // Handle plain text or markdown
      return (
        <div>
          {content.description.split('\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      );
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Detail Content - Admin Dashboard</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Detail Content</h1>
            <div className="flex space-x-3">
              <button
                onClick={() => router.push('/admins/content/read')}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Kembali
              </button>
            </div>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            {error && <AlertMessage type="error" message={error} />}
            
            {content && (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                {/* Status Badge */}
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Informasi Content
                  </h3>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    content.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {content.status ? 'Aktif' : 'Tidak Aktif'}
                  </span>
                </div>
                
                {/* Content Details */}
                <div className="border-t border-gray-200">
                  <dl>
                    {/* Menu & Submenu */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Menu</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {content.sub_menu.menu.menu_name || 'N/A'}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Sub Menu</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {content.sub_menu.sub_menu_name}
                      </dd>
                    </div>
                    
                    {/* Title */}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Judul</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {content.title}
                      </dd>
                    </div>
                    
                    {/* Report Type & Year (if applicable) */}
                    {content.report_type && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Jenis Laporan</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {content.report_type === 'triwulan' ? 'Laporan Triwulan' : 'Laporan Tahunan'}
                        </dd>
                      </div>
                    )}
                    
                    {content.report_year && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Tahun Laporan</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {content.report_year}
                        </dd>
                      </div>
                    )}
                    
                    {/* Description with proper styling for React Quill content */}
                    <div className={`${content.report_type ? 'bg-white' : 'bg-gray-50'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                      <dt className="text-sm font-medium text-gray-500">Deskripsi</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {renderDescription()}
                      </dd>
                    </div>
                    
                    {/* Required Documents */}
                    {getRequiredDocuments().length > 0 && (
                      <div className={`${content.report_type ? 'bg-gray-50' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                        <dt className="text-sm font-medium text-gray-500">Dokumen yang Dibutuhkan</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                            {getRequiredDocuments().map((document, index) => (
                              <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                <div className="w-0 flex-1 flex items-center">
                                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                  </svg>
                                  <span className="ml-2 flex-1 w-0 truncate">
                                    {document}
                                  </span>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                    
                    {/* Creation / Update Info */}
                    <div className={`${content.thumbnail ? 'bg-gray-50' : 'bg-white'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                      <dt className="text-sm font-medium text-gray-500">Dibuat pada</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formatDate(content.created_at)}
                      </dd>
                    </div>
                    
                    <div className={`${content.thumbnail ? 'bg-white' : 'bg-gray-50'} px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6`}>
                      <dt className="text-sm font-medium text-gray-500">Terakhir diperbarui</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formatDate(content.updated_at)}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 