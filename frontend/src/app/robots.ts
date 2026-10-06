import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site";

/** /robots.txt — public site crawlable; admin and API excluded. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
