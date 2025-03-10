import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import axios from "axios";

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [admin, setAdmin] = useState<{ username: string; id: number } | null>(
    null
  );
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Cek apakah user sudah login dengan memeriksa token
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/");
      return;
    }

    // Set axios default headers untuk semua request
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Ambil data admin dari localStorage (opsional)
    const adminId = localStorage.getItem("adminId");
    const adminUsername = localStorage.getItem("adminUsername");

    if (adminId && adminUsername) {
      setAdmin({
        id: Number(adminId),
        username: adminUsername,
      });
      setLoading(false);
    } else {
      // Jika tidak ada di localStorage, kita bisa fetch dari API
      fetchAdminData();
    }
  }, [router]);

  const fetchAdminData = async () => {
    try {
      // Ambil ID admin dari token (ini contoh saja, Anda perlu sesuaikan dengan struktur token Anda)
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
      // Jika terjadi error (misal token tidak valid), redirect ke login
      router.push("/");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Hapus token dan data admin dari localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminUsername");

    // Redirect ke login page
    router.push("/");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
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
    <div className="flex h-screen bg-gray-50">
      <Head>
        <title>Admin Dashboard - Bank ABDI</title>
        <meta name="description" content="Admin dashboard panel" />
      </Head>

      {/* Sidebar */}
      <div
        className={`bg-white shadow-lg transition-all duration-300 ${
          isSidebarOpen ? "w-64" : "w-20"
        } flex flex-col`}
      >
        {/* Sidebar Header */}
        <div className="px-4 py-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white flex items-center justify-between">
          {isSidebarOpen ? (
            <span className="text-xl font-bold">Bank ABDI</span>
          ) : (
            <span className="text-xl font-bold">ABDI</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-full hover:bg-blue-500 focus:outline-none"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isSidebarOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 5l7 7-7 7M5 5l7 7-7 7"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Sidebar Menu */}
        <div className="flex-1 py-6 overflow-y-auto">
          <ul className="space-y-2 px-4">
            <li>
              <a
                href="#"
                className="flex items-center space-x-3 text-gray-700 p-3 rounded-lg bg-blue-50 font-medium"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
                {isSidebarOpen && <span>Dashboard</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center space-x-3 text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                {isSidebarOpen && <span>Kelola Konten</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className="flex items-center space-x-3 text-gray-700 p-3 rounded-lg hover:bg-gray-100 transition duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                {isSidebarOpen && <span>Kelola Table</span>}
              </a>
            </li>
          </ul>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            {isSidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar */}
        <header className="bg-white shadow-sm z-10">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-semibold text-gray-800">
                Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 bg-gray-100 rounded-full text-gray-600 hover:bg-gray-200 focus:outline-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  {admin?.username.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block">
                  <h2 className="text-sm font-medium text-gray-700">
                    Selamat datang,
                  </h2>
                  <p className="text-sm text-gray-500">{admin?.username}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {/* Welcome Banner */}
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
              <div className="hidden md:block">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-24 w-24 text-blue-400 opacity-50"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Feature Cards */}
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
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-blue-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  Tambah, edit, atau hapus konten website dengan mudah dan
                  cepat.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500">
                    Terakhir diupdate: Hari ini
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

            <div className="bg-white rounded-lg shadow overflow-hidden transition-transform duration-300 hover:shadow-lg hover:transform hover:-translate-y-1">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Kelola Table
                  </h3>
                  <div className="bg-green-100 p-2 rounded-lg">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <p className="text-gray-500 text-sm mb-6">
                  Lihat dan kelola data table dengan tampilan yang intuitif.
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
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white p-4 shadow-inner mt-auto">
          <div className="text-center text-sm text-gray-500">
            <p>&copy; 2025 Bank ABDI. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
