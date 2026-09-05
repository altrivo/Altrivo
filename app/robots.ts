import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard/", "/storefront/theme/", "/settings/", "/admin/"],
    },
    sitemap: "https://artrivo.com/sitemap.xml",
  };
}
