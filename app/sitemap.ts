import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://artrivo.com";
  const lastmod = new Date().toISOString();

  const categories = ["decor", "art", "lighting", "textiles", "stationery"];
  const products = ["prod-1", "prod-2", "prod-3", "prod-4"];

  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: lastmod,
      changeFrequency: "daily",
      priority: 1.0,
    },
    ...categories.map((slug) => ({
      url: `${baseUrl}/category/${slug}`,
      lastModified: lastmod,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...products.map((id) => ({
      url: `${baseUrl}/product/${id}`,
      lastModified: lastmod,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];

  return routes;
}
