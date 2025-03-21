/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Headers untuk API routes
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "http://localhost:3000" }, // Ganti wildcard dengan URL frontend
          { 
            key: "Access-Control-Allow-Methods", 
            value: "GET,DELETE,PATCH,POST,PUT,OPTIONS" // Tambahkan OPTIONS untuk preflight request
          },
          { 
            key: "Access-Control-Allow-Headers", 
            value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
          },
        ],
      },
    ];
  },
  // Rewrites untuk mengubah path /storage/* ke /uploads/*
  async rewrites() {
    return [
      {
        source: '/storage/:path*',
        destination: '/uploads/:path*',
      },
      // Jika ada keperluan rewrite lainnya
    ];
  },
  // Konfigurasi untuk static files di folder uploads
  // Pastikan folder uploads dapat diakses sebagai static files
  // File akan diakses dari /uploads/* path
  // Ini akan membuat file di public/uploads dapat diakses
};

export default nextConfig;