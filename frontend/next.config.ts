import type { NextConfig } from "next";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:5000";

const nextConfig: NextConfig = {
  /**
   * The browser always calls `/api/*` on the SAME origin as the site; Next
   * proxies it to the Express backend. Benefits:
   *  - no CORS round-trips for the visitor
   *  - first-party cookies for the admin login (Step 10) — cross-site cookies
   *    between vercel.app and onrender.com are blocked by modern browsers
   *  - the backend URL can change without touching client code
   */
  async rewrites() {
    return [{ source: "/api/:path*", destination: `${BACKEND_URL}/api/:path*` }];
  },
};

export default nextConfig;
