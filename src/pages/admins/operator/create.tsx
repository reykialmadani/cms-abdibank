import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import AdminLayout from "../component/AdminLayout";
import axios from "axios";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function CreateOperator() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("operator");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userRole = localStorage.getItem("adminRole");
    if (userRole !== "admin") {
      router.push("/admins/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validasi password
    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "/api/admin/operators",
        { username, password, role },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess(true);

      setUsername("");
      setPassword("");
      setConfirmPassword("");
      setRole("operator");

      // Redirect setelah berhasil
      setTimeout(() => {
        router.push("/admins/operator");
      }, 2000);
    } catch (error: any) {
      console.error("Error creating operator:", error);
      setError(
        error.response?.data?.error ||
          "Gagal membuat operator. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <Head>
        <title>Tambah Operator Baru - Dashboard Admin</title>
      </Head>

      <div className="bg-white shadow-lg rounded-xl overflow-hidden">
        <div className="px-6 py-6 border-b border-gray-200">
          <h3 className="text-2xl font-semibold text-gray-800">Tambah Operator Baru</h3>
          <p className="mt-2 text-sm text-gray-500">
            Buat akun operator baru untuk mengelola konten.
          </p>
        </div>

        <div className="px-6 py-6">
          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-400" />
                <span className="ml-3 text-lg font-medium text-green-700">
                  Operator berhasil ditambahkan!
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex items-center">
                <ExclamationCircleIcon className="h-6 w-6 text-red-400" />
                <span className="ml-3 text-lg font-medium text-red-700">{error}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="text-black block w-full p-3 rounded-md border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out"
                placeholder="Masukkan username"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-black block w-full p-3 rounded-md border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out"
                placeholder="Masukkan password"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Konfirmasi Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="text-black block w-full p-3 rounded-md border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out"
                placeholder="Konfirmasi password"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="text-black block w-full p-3 rounded-md border-2 border-gray-300 focus:ring-blue-500 focus:border-blue-500 transition ease-in-out"
              >
                <option value="operator">Operator</option>
              </select>
            </div>

            <div className="flex justify-between mt-6">
              <Link
                href="/admins/operator"
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition ease-in-out"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={loading}
                className={`px-6 py-3 text-sm font-medium text-white rounded-lg transition ease-in-out focus:outline-none ${
                  loading
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Menyimpan...
                  </div>
                ) : (
                  "Simpan"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
