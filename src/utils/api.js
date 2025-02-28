import axios from 'axios';
import { useRouter } from 'next/router';

// Buat instance axios kustom
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor untuk menambahkan token ke setiap request
api.interceptors.request.use(
  (config) => {
    // Lakukan hanya di browser, bukan di server side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor untuk menangani response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tangani error 401 Unauthorized (token tidak valid atau expired)
    if (error.response && error.response.status === 401) {
      // Hanya redirect jika di browser
      if (typeof window !== 'undefined') {
        // Hapus token dari localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('adminId');
        localStorage.removeItem('adminUsername');
        
        // Gunakan window.location untuk hard reload ke halaman login
        // karena useRouter hanya berfungsi dalam komponen React
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Hook untuk menggunakan API dengan keamanan route
export function useAuthAPI() {
  const router = useRouter();

  const checkAuth = () => {
    // Verifikasi token ada, jika tidak redirect ke login
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/');
      return false;
    }
    return true;
  };

  return {
    api,
    checkAuth,
  };
}