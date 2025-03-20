import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import axios from "axios";

interface VisitData {
  subMenuId: number;
  subMenuName: string;
  menuName: string;
  visitCount: number;
  month: number;
  year: number;
}

interface ApiResponse {
  month: number;
  year: number;
  data: VisitData[];
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const TopPagesChart: React.FC = () => {
  const [data, setData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse>("/api/getMonthlyVisitData", {
          params: {
            month: selectedMonth,
            year: selectedYear,
            daily: false,
          },
        });

        if (response.data && Array.isArray(response.data.data)) {
          const sortedData = response.data.data
            .sort((a, b) => b.visitCount - a.visitCount) // Urutkan dari terbesar ke terkecil
            .slice(0, 5) // Ambil 5 teratas
            .map((item) => ({
              name: item.subMenuName,
              value: item.visitCount,
            }));

          setData(sortedData);
        } else {
          console.error("Invalid data format received:", response.data);
          setError("Format data tidak valid");
        }
      } catch (err) {
        console.error("Error fetching visitor data:", err);
        setError("Gagal memuat data pengunjung");
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorData();
  }, [selectedMonth, selectedYear]);

  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];

  const years = Array.from({ length: 3 }, (_, i) => selectedYear - i);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(event.target.value, 10));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value, 10));
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <p className="ml-3 text-gray-600">Memuat data grafik...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-80 flex items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md h-80 flex items-center justify-center">
        <p className="text-gray-500">
          Tidak ada data pengunjung untuk {monthNames[selectedMonth - 1]} {selectedYear}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-md font-medium text-gray-700 mb-4">Halaman dengan Pengunjung Terbanyak</h3>
      <div className="mb-4 flex space-x-4">
        <div>
          <label htmlFor="monthSelect" className="mr-2 text-black">Bulan:</label>
          <select
            id="monthSelect"
            value={selectedMonth}
            onChange={handleMonthChange}
            className="p-2 border rounded text-black"
          >
            {monthNames.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="yearSelect" className="mr-2 text-black">Tahun:</label>
          <select
            id="yearSelect"
            value={selectedYear}
            onChange={handleYearChange}
            className="p-2 border rounded text-black"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={({ name, value }) => `${name} (${value})`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend
              wrapperStyle={{
                fontSize: "12px",
                marginTop: "10px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TopPagesChart;
