/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  
  // Headers untuk API routes
  async headers() {
    return [
      {
        // matching all API routes
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },
  
  // Rewrites jika diperlukan
  async rewrites() {
    return [
      // Jika ada keperluan rewrite lainnya
    ];
  },
  
  // Konfigurasi untuk static files di folder uploads
  // Pastikan folder uploads dapat diakses sebagai static files
  // File akan diakses dari /uploads/* path
  // Ini akan membuat file di public/uploads dapat diakses
};

export default nextConfig;