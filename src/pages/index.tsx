import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import axios from "axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Cek jika sudah login (token ada), redirect ke dashboard  
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/admins/dashboard');
    }
  }, [router]);

  // Modifikasi handleSubmit pada pages/index.tsx
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Log data yang dikirim untuk debugging
      console.log("Mengirim request login dengan data:", { 
        username, 
        passwordLength: password ? password.length : 0
      });

      const response = await axios.post('/api/auth/login', { 
        username, 
        password 
      });

      console.log("Login berhasil, response:", response.data);

      // Simpan token di localStorage
      localStorage.setItem('token', response.data.token);

      // Opsional: simpan juga informasi admin
      if (response.data.admin) {
        localStorage.setItem('adminId', response.data.admin.id);
        localStorage.setItem('adminUsername', response.data.admin.username);
      }

      // Redirect ke dashboard admin
      router.push('/admins/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      if (axios.isAxiosError(err)) {
        console.error('Detail error response:', err.response?.status, err.response?.data);
        setError(err.response?.data?.error || `Error ${err.response?.status}: Autentikasi gagal`);
      } else if (err instanceof Error) {
        console.error('Error message:', err.message);
        setError('Terjadi kesalahan saat login: ' + err.message);
      } else {
        console.error('Unknown error:', err);
        setError('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden"> 
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute w-96 h-96 bg-white opacity-5 rounded-full -top-20 -left-20 animate-pulse"></div>
        <div className="absolute w-80 h-80 bg-white opacity-5 rounded-full top-40 -right-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute w-64 h-64 bg-white opacity-5 rounded-full bottom-20 left-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <Head>
        <title>Login - Dashboard Bank Abdi</title>
        <meta name="description" content="Login page Bank Abdi" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="flex justify-center">
          <div className="w-28 h-28 bg-white rounded-full flex items-center justify-center shadow-lg transform transition-all duration-500 hover:scale-105">
            <Image
              src="https://bankabdi.co.id/img/logo/logo-color-abdi.svg"
              alt="Bank Abdi Logo"
              width={96}
              height={96}
              className="rounded-full"
            />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Dashboard Admin Bank Abdi
        </h2>
        <p className="mt-2 text-center text-sm text-blue-100">
          Silakan masukkan kredensial Anda untuk melanjutkan
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-white py-8 px-6 shadow-2xl sm:rounded-2xl sm:px-10 transform transition-all duration-500 hover:shadow-blue-400/20">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg animate-fadeIn">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700 font-medium">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="transform transition-all duration-300 hover:translate-y-1">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none text-black block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 sm:text-sm"
                  placeholder="Masukkan username Anda"
                />
              </div>
            </div>

            <div className="transform transition-all duration-300 hover:translate-y-1">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none text-black block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300 sm:text-sm"
                  placeholder="Masukkan password Anda"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:translate-y-1 hover:shadow-lg`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sedang masuk...</span>
                  </div>
                ) : 'Masuk'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Bank Abdi Admin
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-blue-100 z-10">
          © {new Date().getFullYear()} Bank Abdi. All rights reserved.
        </div>
      </div>
    </div>
  );
} 