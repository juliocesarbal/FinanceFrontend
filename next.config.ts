import type { NextConfig } from "next";

// El backend Django (Finance) corre por defecto en 127.0.0.1:8000.
// El proxy hace que el navegador hable siempre con el mismo origen,
// así no hace falta configurar CORS en el backend.
const BACKEND_URL = process.env.BACKEND_URL ?? "http://127.0.0.1:8000";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` },
    ];
  },
};

export default nextConfig;
