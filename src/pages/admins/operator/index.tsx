// pages/admins/operator/index.tsx
import { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import AdminLayout from "../component/AdminLayout";
import axios from "axios";
import { 
  TrashIcon, 
  PlusIcon, 
  MagnifyingGlassIcon, 
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon,  
  ExclamationTriangleIcon,
  XMarkIcon
} from "@heroicons/react/24/outline";

interface Operator {
  id: number;
  username: string;
  role: string;
  created_at: string;
}

export default function OperatorManagement() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [filteredOperators, setFilteredOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [operatorToDelete, setOperatorToDelete] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("id");
  const [sortDirection, setSortDirection] = useState("asc");
  const router = useRouter();

  // Periksa apakah pengguna adalah admin
  useEffect(() => {
    const userRole = localStorage.getItem("adminRole");
    if (userRole !== "admin") {
      router.push("/admins/dashboard");
    }
  }, [router]);

  // Ambil daftar operator
  useEffect(() => {
    const fetchOperators = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          router.push("/");
          return;
        }
        const response = await axios.get("/api/admin/operators", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        // Filter untuk hanya menampilkan operator (bukan admin)
        const onlyOperators = response.data.operators.filter(
          (op: Operator) => op.role !== "admin"
        );
        
        setOperators(onlyOperators);
        setFilteredOperators(onlyOperators);
      } catch (error) {
        console.error("Error fetching operators:", error);
        setError("Gagal memuat daftar operator");
      } finally {
        setLoading(false);
      }
    };

    fetchOperators();
  }, [router]);

  // Filter dan sort
  useEffect(() => {
    // Filter berdasarkan search term
    let result = operators.filter(operator => 
      operator.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // Sort data
    result = result.sort((a, b) => {
      const aValue = a[sortField as keyof Operator];
      const bValue = b[sortField as keyof Operator];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      } else {
        // Handle untuk numeric values
        const numA = typeof aValue === 'number' ? aValue : Number(aValue);
        const numB = typeof bValue === 'number' ? bValue : Number(bValue);
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }
    });
    
    setFilteredOperators(result);
  }, [operators, searchTerm, sortField, sortDirection]);
  
  // Fungsi untuk menghapus operator
  const deleteOperator = async () => {
    if (!operatorToDelete) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/admin/operators/${operatorToDelete}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Update daftar operator setelah menghapus
      setOperators(operators.filter((op) => op.id !== operatorToDelete));
      setShowDeleteModal(false);
      setOperatorToDelete(null);
    } catch (error) {
      console.error("Error deleting operator:", error);
      setError("Gagal menghapus operator");
    }
  };

  // Fungsi untuk menampilkan modal konfirmasi hapus
  const confirmDelete = (id: number) => {
    setOperatorToDelete(id);
    setShowDeleteModal(true);
  };
  
  // Fungsi untuk mengganti urutan sort
  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <AdminLayout>
      <Head>
        <title>Manajemen Operator - Dashboard Admin</title>
      </Head>
      
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-xl shadow-sm mb-4 sm:mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <UserGroupIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-500 mr-2 sm:mr-3" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Manajemen Operator</h1>
                <p className="text-sm sm:text-base text-gray-500">Kelola semua akun operator dalam sistem</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Cari operator..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-transparent w-full transition-all duration-200"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
            </div>
            <Link
              href="/admins/operator/create"
              className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-md"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              <span>Tambah Operator</span>
            </Link>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4 sm:mb-6 rounded-lg shadow-sm flex items-start">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
          <div className="flex-grow">
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button 
            onClick={() => setError("")}
            className="text-gray-400 hover:text-gray-600"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      )}
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : filteredOperators.length === 0 ? (
          <div className="py-8 sm:py-12 px-4 text-center">
            <div className="mx-auto h-16 w-16 sm:h-24 sm:w-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <UserGroupIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Tidak ada operator</h3>
            {searchTerm ? (
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                Tidak ada operator yang cocok dengan pencarian {searchTerm}. Coba dengan kata kunci lain atau tambahkan operator baru.
              </p>
            ) : (
              <p className="text-sm sm:text-base text-gray-500 max-w-md mx-auto">
                Belum ada operator yang terdaftar di sistem. Tambahkan operator baru dengan mengklik tombol Tambah Operator.
              </p>
            )}
            <div className="mt-6">
              <Link
                href="/admins/operator/create"
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 shadow-sm"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                <span>Tambah Operator</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Table untuk desktop */}
            <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left"
                    onClick={() => toggleSort('id')}
                  >
                    <div className="flex items-center cursor-pointer group">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-gray-700">ID</span>
                      <div className="ml-1">
                        {sortField === 'id' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 text-indigo-500" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 text-indigo-500" />
                          )
                        ) : (
                          <div className="h-4 w-4 text-gray-300 group-hover:text-gray-400">
                            <ArrowUpIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left"
                    onClick={() => toggleSort('username')}
                  >
                    <div className="flex items-center cursor-pointer group">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-gray-700">Username</span>
                      <div className="ml-1">
                        {sortField === 'username' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 text-indigo-500" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 text-indigo-500" />
                          )
                        ) : (
                          <div className="h-4 w-4 text-gray-300 group-hover:text-gray-400">
                            <ArrowUpIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left"
                    onClick={() => toggleSort('role')}
                  >
                    <div className="flex items-center cursor-pointer group">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-gray-700">Role</span>
                      <div className="ml-1">
                        {sortField === 'role' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 text-indigo-500" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 text-indigo-500" />
                          )
                        ) : (
                          <div className="h-4 w-4 text-gray-300 group-hover:text-gray-400">
                            <ArrowUpIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left"
                    onClick={() => toggleSort('created_at')}
                  >
                    <div className="flex items-center cursor-pointer group">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider group-hover:text-gray-700">Tanggal Dibuat</span>
                      <div className="ml-1">
                        {sortField === 'created_at' ? (
                          sortDirection === 'asc' ? (
                            <ArrowUpIcon className="h-4 w-4 text-indigo-500" />
                          ) : (
                            <ArrowDownIcon className="h-4 w-4 text-indigo-500" />
                          )
                        ) : (
                          <div className="h-4 w-4 text-gray-300 group-hover:text-gray-400">
                            <ArrowUpIcon className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOperators.map((operator) => (
                  <tr key={operator.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{operator.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-medium mr-3">
                          {operator.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-medium text-gray-900">{operator.username}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {operator.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(operator.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => confirmDelete(operator.id)}
                          className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors duration-150"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Card layout untuk mobile */}
            <div className="sm:hidden divide-y divide-gray-200">
              {filteredOperators.map((operator) => (
                <div key={operator.id} className="p-4 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-500 font-medium mr-3">
                        {operator.username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{operator.username}</div>
                        <span className="px-2 py-0.5 text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {operator.role}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => confirmDelete(operator.id)}
                      className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-lg hover:bg-red-100 transition-colors duration-150"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="pl-13 ml-13 grid grid-cols-2 gap-2 text-sm text-gray-500">
                    <div>
                      <span className="block text-xs text-gray-500 uppercase">ID</span>
                      <span>{operator.id}</span>
                    </div>
                    <div>
                      <span className="block text-xs text-gray-500 uppercase">Tanggal Dibuat</span>
                      <span>{formatDate(operator.created_at)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Konfirmasi Hapus */}
      {showDeleteModal && (
        <div className="fixed z-50 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
              onClick={() => setShowDeleteModal(false)}
              aria-hidden="true"
            ></div>
            
            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full w-full max-w-md mx-auto">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      Hapus Operator
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Apakah Anda yakin ingin menghapus operator ini? Tindakan ini tidak dapat dibatalkan.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={deleteOperator}
                >
                  Hapus
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}