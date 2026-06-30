import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kompresi gzip untuk semua response
  compress: true,

  // Hilangkan header X-Powered-By (keamanan + sedikit byte hemat)
  poweredByHeader: false,

  // React Strict Mode untuk deteksi masalah lebih awal
  reactStrictMode: true,

  experimental: {
    // Tree-shaking lebih agresif untuk library besar
    optimizePackageImports: ["framer-motion", "lucide-react", "date-fns", "recharts"],
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async redirects() {
    return [
      { source: "/login", destination: "/auth", permanent: false },
      { source: "/register", destination: "/auth", permanent: false },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
