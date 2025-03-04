// pages/admins/content/[id]/detail.tsx
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import Image from "next/image";
import AdminLayout from "@/pages/admins/component/AdminLayout";
import { ArrowLeftIcon, PencilIcon } from "@heroicons/react/24/outline";

// Interface for content detail
interface ContentDetail {
  id: number;
  title: string;
  description: string;
  required_documents: string | null;
  thumbnail: string | null;
  status: boolean;
  created_at: string;
  updated_at: string;
  sub_menu_id: number;
  sub_menu_name: string;
  menu_name: string;
}

export default function ContentDetail() {
  // State for content detail
  const [content, setContent] = useState<ContentDetail | null>(null);
  
  // State for loading and error
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  
  const router = useRouter();
  const { id } = router.query;

  // Fetch content detail from API
  useEffect(() => {
    const fetchContentDetail = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError("");
        
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
        setError("Terjadi kesalahan saat mengambil detail content");
      } finally {
        setLoading(false);
      }
    };

    fetchContentDetail();
  }, [id, router]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Parse required documents from string to array
  const parseRequiredDocuments = (docs: string | null) => {
    if (!docs) return [];
    return docs.split('\n').filter(doc => doc.trim() !== '');
  };

  return (
    <AdminLayout>
      <Head>
        <title>{loading ? 'Loading...' : content ? `Detail ${content.title}` : 'Content Not Found'} - Admin Dashboard</title>
      </Head>
      
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => router.push('/admins/content')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Kembali
            </button>
            
            {!loading && content && (
              <div className="ml-auto">
                <Link
                  href={`/admins/content/${id}/edit`}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </div>
            )}
          </div>
          
          <h1 className="text-2xl font-semibold text-gray-900">Detail Content</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
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
            
            {/* Loading state */}
            {loading ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <div className="animate-pulse h-6 w-1/3 bg-gray-200 rounded"></div>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    {Array(5).fill(0).map((_, index) => (
                      <div key={index} className={`px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                        <div className="animate-pulse h-4 w-1/2 bg-gray-200 rounded"></div>
                        <div className="mt-1 sm:mt-0 sm:col-span-2">
                          <div className="animate-pulse h-4 w-3/4 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : !content ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <p className="text-center text-gray-500 py-8">Content tidak ditemukan</p>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{content.title}</h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {content.menu_name} &gt; {content.sub_menu_name}
                  </p>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">ID</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{content.id}</dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Judul</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{content.title}</dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            content.status ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {content.status ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Kategori</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {content.menu_name} &gt; {content.sub_menu_name}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Deskripsi</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                        {content.description}
                      </dd>
                    </div>
                    
                    {content.required_documents && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Dokumen yang Dibutuhkan</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                            {parseRequiredDocuments(content.required_documents).map((doc, index) => (
                              <li key={index} className="pl-3 pr-4 py-3 flex items-center justify-start text-sm">
                                <svg className="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                                </svg>
                                <span className="ml-2 flex-1">{doc}</span>
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                    
                    {content.thumbnail && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Thumbnail</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          <div className="border border-gray-200 rounded-md overflow-hidden w-48">
                            <Image 
                              src={content.thumbnail} 
                              alt={content.title} 
                              width={192} 
                              height={192} 
                              className="w-full h-auto object-cover"
                            />
                          </div>
                        </dd>
                      </div>
                    )}
                    
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Dibuat pada</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {formatDate(content.created_at)}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
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