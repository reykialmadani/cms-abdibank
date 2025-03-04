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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Memuat...</h2>
          <p className="text-gray-500">Menunggu autentikasi</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Admin Dashboard - Bank ABDI</title>
        <meta name="description" content="Admin dashboard panel" />
      </Head>

      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                {/* Logo or Brand */}
                <span className="text-xl font-bold text-blue-600">
                  Bank ABDI Admin
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-gray-700 mr-4">
                Selamat datang, {admin?.username}
              </span>
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <header>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold leading-tight text-gray-900">
              Dashboard
            </h1>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <div className="px-4 py-8 sm:px-0">
              <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-4">
                <p className="text-gray-500">
                  Konten dashboard Anda di sini. Tambahkan komponen dan fitur
                  sesuai kebutuhan.
                </p>

                {/* Contoh card untuk fitur-fitur */}
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Kelola Konten
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Tambah, edit, atau hapus konten website.
                      </p>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <button
                        type="button"
                        onClick={() => router.push("/admins/content/create")}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Buka Manager
                      </button>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Kelola Pinjaman
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Lihat dan kelola data pinjaman.
                      </p>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Buka Manager
                      </button>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Pengaturan Akun
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Ubah password dan informasi akun.
                      </p>
                    </div>
                    <div className="bg-gray-50 px-4 py-4 sm:px-6">
                      <button
                        type="button"
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Ubah Pengaturan
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
