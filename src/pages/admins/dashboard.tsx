import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import AdminLayout from "../admins/component/AdminLayout";
import SimpleLineChart from "./component/dashboard/SimpleLineChart"; 
import ChartTop from "./component/dashboard/ChartTop";

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
              Dashboard Admin dan Operator Bank Abdi
            </p>
          </div>
        </div>
      </div>

      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Grafik Visitor Website
      </h2>
      <SimpleLineChart />
      <br></br>
      <ChartTop />
    </AdminLayout>
  );
}