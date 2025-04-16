import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import axios from 'axios';

interface VisitData {
  subMenuId: number;
  subMenuName: string;
  menuName: string;
  visitCount: number;
  uniqueVisitors: number;
  month: number;
  year: number;
  dailyVisits?: Record<string, number>;
}

interface IpVisitDetail {
  ipAddress: string;
  subMenuName: string;
  menuName: string;
  visitCount: number;
  lastVisit: string;
}

interface ApiResponse {
  month: number;
  year: number;
  data: VisitData[];
}

interface IpDetailsResponse {
  ipDetails: IpVisitDetail[];
}

const SimpleLineChart: React.FC = () => {
  const [visitData, setVisitData] = useState<VisitData[]>([]);
  const [ipDetails, setIpDetails] = useState<IpVisitDetail[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [ipLoading, setIpLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [viewMode, setViewMode] = useState<'total' | 'unique' | 'ipDetails'>('total');

  // Generate years for dropdown (current year and 2 years before)
  const years = Array.from({ length: 3 }, (_, i) => selectedYear - i);

  useEffect(() => {
    const fetchVisitorData = async () => {
      try {
        setLoading(true);
        // Tambahkan parameter daily untuk konsistensi dengan backend
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
          
          // Pastikan bahwa data memiliki property uniqueVisitors
          const validatedData = response.data.data.map(item => ({
            ...item,
            uniqueVisitors: item.uniqueVisitors || 0
          }));
          
          setVisitData(validatedData);
          
          // Log data untuk debugging
          console.log("Data pengunjung yang diterima:", validatedData);
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
    
    // Jika mode tampilan adalah IP Details, muat data IP
    if (viewMode === 'ipDetails') {
      fetchIpDetails();
    }
  }, [selectedMonth, selectedYear, viewMode]);

  const fetchIpDetails = async () => {
    try {
      setIpLoading(true);
      // Endpoint API untuk detail IP
      console.log("Fetching IP details for:", { month: selectedMonth, year: selectedYear });
      
      const response = await axios.get<IpDetailsResponse>('/api/getIpVisitDetails', {
        params: {
          month: selectedMonth,
          year: selectedYear
        }
      });

      if (response.data && Array.isArray(response.data.ipDetails)) {
        setIpDetails(response.data.ipDetails);
        console.log("Data IP yang diterima:", response.data.ipDetails);
      } else {
        console.error('Invalid IP data format received:', response.data);
        setError('Format data IP tidak valid');
      }
    } catch (err) {
      console.error('Error fetching IP details:', err);
      
      // Tampilkan detail error lebih lengkap
      if (axios.isAxiosError(err)) {
        console.error('Axios error details:', {
          status: err.response?.status,
          data: err.response?.data
        });
        
        if (err.response?.status === 500) {
          setError('Server error: ' + (err.response.data?.details || err.message));
        } else {
          setError('Gagal memuat data IP: ' + err.message);
        }
      } else {
        setError('Gagal memuat data IP: ' + (err instanceof Error ? err.message : String(err)));
      }
    } finally {
      setIpLoading(false);
    }
  };

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMonth(parseInt(event.target.value, 10));
  };

  const handleYearChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedYear(parseInt(event.target.value, 10));
  };

  const handleViewModeChange = (mode: 'total' | 'unique' | 'ipDetails') => {
    setViewMode(mode);
    if (mode === 'ipDetails' && ipDetails.length === 0) {
      fetchIpDetails();
    }
  };

  // Bulan dalam bahasa Indonesia
  const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  // Fungsi untuk memformat tanggal
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading && viewMode !== 'ipDetails') {
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
  if (visitData.length === 0 && viewMode !== 'ipDetails') {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-md font-medium text-gray-700 mb-4">Jumlah Pengunjung Website</h3>
        <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
      <div className="mb-4 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
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
      
      {/* Toggle untuk melihat total visit, unique visitors atau detail IP */}
      <div className="mb-4">
        <div className="flex space-x-4 bg-gray-100 p-1 rounded-lg inline-block">
          <button
            onClick={() => handleViewModeChange('total')}
            className={`px-4 py-2 rounded ${viewMode === 'total' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Total Kunjungan
          </button>
          <button
            onClick={() => handleViewModeChange('unique')}
            className={`px-4 py-2 rounded ${viewMode === 'unique' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Pengunjung Unik
          </button>
          <button
            onClick={() => handleViewModeChange('ipDetails')}
            className={`px-4 py-2 rounded ${viewMode === 'ipDetails' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            Detail IP Address
          </button>
        </div>
      </div>

      {/* Tampilan grafik untuk total kunjungan atau pengunjung unik */}
      {(viewMode === 'total' || viewMode === 'unique') && (
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
                formatter={(value) => [`${value} pengunjung`, viewMode === 'total' ? 'Jumlah' : 'Unik']}
                labelFormatter={(label) => `Halaman: ${label}`}
                labelClassName='text-black'
              />
              <Legend />
              <Line
                type="monotone"
                dataKey={viewMode === 'total' ? 'visitCount' : 'uniqueVisitors'}
                name={viewMode === 'total' ? 'Jumlah Pengunjung' : 'Pengunjung Unik'}
                stroke={viewMode === 'total' ? '#3B82F6' : '#10B981'}
                activeDot={{ r: 8 }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Tampilan tabel untuk detail IP Address */}
      {viewMode === 'ipDetails' && (
        <div>
          {ipLoading ? (
            <div className="h-80 flex items-center justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
              <p className="ml-3 text-gray-600">Memuat data IP Address...</p>
            </div>
          ) : ipDetails.length === 0 ? (
            <div className="h-80 flex items-center justify-center">
              <p className="text-gray-500">Tidak ada data IP Address untuk {monthNames[selectedMonth - 1]} {selectedYear}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead className="text-black bg-gray-100">
                  <tr>
                    <th className="py-2 px-4 border-b text-left">IP Address</th>
                    <th className="py-2 px-4 border-b text-left">Menu</th>
                    <th className="py-2 px-4 border-b text-left">Sub Menu</th>
                    <th className="py-2 px-4 border-b text-left">Jumlah Kunjungan</th>
                    <th className="py-2 px-4 border-b text-left">Kunjungan Terakhir</th>
                  </tr>
                </thead>
                <tbody>
                  {ipDetails.map((detail, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="text-black py-2 px-4 border-b">{detail.ipAddress}</td>
                      <td className="text-black py-2 px-4 border-b">{detail.menuName}</td>
                      <td className="text-black py-2 px-4 border-b">{detail.subMenuName}</td>
                      <td className="text-black py-2 px-4 border-b">{detail.visitCount}</td>
                      <td className="text-black py-2 px-4 border-b">{formatDate(detail.lastVisit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SimpleLineChart;