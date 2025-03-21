import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// import Head from "next/head";
import axios from "axios";
import AdminLayout from "../admins/component/AdminLayout";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<{ username: string; id: number } | null>(
    null
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }
    
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    
    const adminId = localStorage.getItem("adminId");
    const adminUsername = localStorage.getItem("adminUsername");
    
    if (adminId && adminUsername) {
      setAdmin({
        id: Number(adminId),
        username: adminUsername,
      });
      setLoading(false);
    } else {
      fetchAdminData();
    }
  }, [router]);

  const fetchAdminData = async () => {
    try {
      const adminId = localStorage.getItem("adminId");
      if (!adminId) {
        throw new Error("Admin ID tidak ditemukan");
      }
      
      const response = await axios.get(`/api/admin/${adminId}`);
      setAdmin({
        id: response.data.id,
        username: response.data.username,
      });
    } catch (error) {
      console.error("Error fetching admin data:", error);
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800">Memuat...</h2>
          <p className="text-gray-500 mt-2">Menunggu autentikasi</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-lg p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Selamat Datang, {admin?.username}!
            </h2>
            <p className="text-blue-100">
              Akses semua fitur admin dari dashboard ini.
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Fitur Admin
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow overflow-hidden transition-transform duration-300 hover:shadow-lg hover:transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Kelola Konten
              </h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Tambah, edit, atau hapus konten website dengan mudah dan cepat.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Terakhir diupdate:
              </span>
              <button
                type="button"
                onClick={() => router.push("/admins/content/create")}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
              >
                <span>Buka Manager</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Uncomment jika Anda ingin menambahkan fitur admin lainnya */}
        {/* <div className="bg-white rounded-lg shadow overflow-hidden transition-transform duration-300 hover:shadow-lg hover:transform hover:-translate-y-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                Kelola (....)
              </h3>
            </div>
            <p className="text-gray-500 text-sm mb-6">
              Lihat dan kelola data dengan tampilan yang intuitif.
            </p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">
                Terakhir diupdate: Kemarin
              </span>
              <button
                type="button"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-200"
              >
                <span>Buka Manager</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2 h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div> */}
      </div>
    </AdminLayout>
  );
}