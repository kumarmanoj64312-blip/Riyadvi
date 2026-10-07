import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The API lives in this same app (src/app/api/** Route Handlers), so there
   * is no backend URL and no proxy: the browser calls same-origin `/api/*`,
   * the admin cookie is always first-party, and no CORS is needed.
   *
   * Security headers (what helmet() did for the Express API) for every route.
   */
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      {
        // API responses are data (often private): never cached by browsers or CDNs.
        source: "/api/:path*",
        headers: [{ key: "Cache-Control", value: "no-store" }],
      },
    ];
  },
};

export default nextConfig;
