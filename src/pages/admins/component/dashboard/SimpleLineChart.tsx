import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface VisitData {
  subMenuId: number;
  subMenuName: string;
  menuName: string;
  visitCount: number;
  month: number;
  year: number;
  dailyVisits?: Record<string, number>;
}

interface ApiResponse {
  month: number;
  year: number;
  data: VisitData[];
}

const SimpleLineChart: React.FC = () => {
  const [visitData, setVisitData] = useState<VisitData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1); 
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear()); 
  
  // Generate years for dropdown (current year and 2 years before)
  const years = Array.from({ length: 3 }, (_, i) => selectedYear - i);

  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ApiResponse>('/api/getMonthlyVisitData', {
          params: {
            month: selectedMonth,
            year: selectedYear,
            daily: false 
          }
        });

        // Validasi data yang diterima
        if (response.data && Array.isArray(response.data.data)) {
          if (response.data.data.length === 0) {
            console.warn("Data pengunjung kosong");
          }
          setVisitData(response.data.data);
        } else {
          console.error('Invalid data format received:', response.data);
          setError('Format data tidak valid');
        }
      } catch (err) {
        console.error('Error fetching visitor data:', err);
        if (axios.isAxiosError(err)) {
          console.error('Axios error details:', { 
            status: err.response?.status, 
            data: err.response?.data 
          });
          if (err.response?.status === 500) {
            setError('Server error: ' + (err.response.data?.details || err.message));
          } else {
            setError('Gagal memuat data pengunjung: ' + err.message);
          }
        } else {
          setError('Gagal memuat data pengunjung: ' + (err instanceof Error ? err.message : String(err)));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchVisitorData();
  }, [selectedMonth, selectedYear]);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(event.target.value, 10));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value, 10));
  };

  // Bulan dalam bahasa Indonesia
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

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
      <div className="bg-white p-6 rounded-lg shadow-md h-80 flex flex-col items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  // Cek jika tidak ada data untuk ditampilkan
  if (visitData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-md font-medium text-gray-700 mb-4">Jumlah Pengunjung Website</h3>
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
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-500">Tidak ada data pengunjung untuk {monthNames[selectedMonth - 1]} {selectedYear}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-md font-medium text-gray-700 mb-4">Jumlah Pengunjung Website</h3>
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
          <LineChart
            data={visitData}
            margin={{
              top: 5,
              right: 50,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="subMenuName" 
              tick={{ fontSize: 12 }} 
              interval="preserveStartEnd" 
              tickLine={false} 
              axisLine={{ stroke: '#ccc' }}
            />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`${value} pengunjung`, 'Jumlah']}
              labelFormatter={(label) => `Halaman: ${label}`}
              labelClassName='text-black'
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="visitCount"
              name="Jumlah Pengunjung"
              stroke="#3B82F6"
              activeDot={{ r: 8 }}
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SimpleLineChart;