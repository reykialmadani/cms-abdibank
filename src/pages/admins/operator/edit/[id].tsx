// pages/admins/operator/edit/[id].tsx
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import AdminLayout from "../../component/AdminLayout";
import axios from "axios";
import { CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

interface Operator {
  id: number;
  username: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default function EditOperator() {
  const [operator, setOperator] = useState<Operator | null>(null);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const { id } = router.query;

  // Periksa apakah pengguna adalah admin
  useEffect(() => {
    const userRole = localStorage.getItem("adminRole");
    if (userRole !== "admin") {
      router.push("/admins/dashboard");
    }
  }, [router]);

  // Ambil data operator
  useEffect(() => {
    if (id && typeof id === "string") {
      fetchOperator(id);
    }
  }, [id]);

  const fetchOperator = async (operatorId: string) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/");
        return;
      }

      const response = await axios.get(`/api/admins/operators/${operatorId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const operatorData = response.data.operator;
      setOperator(operatorData);
      setUsername(operatorData.username);
      setRole(operatorData.role);
    } catch (error) {
      console.error("Error fetching operator:", error);
      setError("Gagal memuat data operator");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    // Validasi password jika diisi
    if (password && password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      // Buat data update
      const updateData: any = {
        username,
        role,
      };

      // Tambahkan password jika diisi
      if (password) {
        updateData.password = password;
      }

      await axios.put(`/api/admins/operators/${id}`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setSuccess(true);
      // Reset form password
      setPassword("");
      setConfirmPassword("");

      // Redirect setelah berhasil
      setTimeout(() => {
        router.push("/admins/operator");
      }, 2000);
    } catch (error: any) {
      console.error("Error updating operator:", error);
      setError(
        error.response?.data?.error ||
          "Gagal memperbarui operator. Silakan coba lagi."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>Edit Operator - Dashboard Admin</title>
      </Head>

      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Edit Operator
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Perbarui informasi akun operator
          </p>
        </div>

        <div className="px-4 py-5 sm:p-6">
          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">
                    Operator berhasil diperbarui! Mengalihkan kembali ke daftar operator...
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password Baru
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Biarkan kosong jika tidak ingin mengubah"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Biarkan kosong jika tidak ingin mengubah password
                </p>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Konfirmasi Password Baru
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Biarkan kosong jika tidak ingin mengubah"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-medium text-gray-700"
              >
                Role
              </label>
              <div className="mt-1">
                <select
                  id="role"
                  name="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                >
                  <option value="operator">Operator</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Admin: dapat mengelola operator dan konten. Operator: hanya dapat mengelola konten.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/admins/operator"
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Batal
              </Link>
              <button
                type="submit"
                disabled={saving}
                className={`py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                  saving
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                }`}
              >
                {saving ? (
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