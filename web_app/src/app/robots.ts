import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://mycars.ng";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/settings/", "/api/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
