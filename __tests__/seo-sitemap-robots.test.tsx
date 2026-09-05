import sitemap from "@/app/sitemap";
import robots from "@/app/robots";
import {
  buildJsonLdOrganization,
  buildJsonLdProduct,
  buildJsonLdBreadcrumbs,
} from "@/lib/storefront/seoHelper";

describe("Storefront SEO Meta Tags, JSON-LD, Sitemap.xml & Robots.txt", () => {
  describe("1. Dynamic XML Sitemap Generator (app/sitemap.ts)", () => {
    it("returns valid sitemap array with homepage, categories, and products", () => {
      const routes = sitemap();
      expect(routes.length).toBeGreaterThan(0);

      const homepage = routes.find((r) => r.url === "https://artrivo.com/shop");
      expect(homepage).toBeDefined();
      expect(homepage?.priority).toBe(1.0);
      expect(homepage?.changeFrequency).toBe("daily");

      const category = routes.find((r) => r.url === "https://artrivo.com/category/decor");
      expect(category).toBeDefined();
      expect(category?.priority).toBe(0.8);

      const product = routes.find((r) => r.url === "https://artrivo.com/product/prod-1");
      expect(product).toBeDefined();
      expect(product?.priority).toBe(0.7);
    });
  });

  describe("2. Robots.txt Generator (app/robots.ts)", () => {
    it("returns valid robots rules with User-agent, Allow, Disallow, and Sitemap directives", () => {
      const config = robots();
      expect(config.rules).toBeDefined();
      expect(config.sitemap).toBe("https://artrivo.com/sitemap.xml");

      const rules = Array.isArray(config.rules) ? config.rules[0] : config.rules;
      expect(rules.userAgent).toBe("*");
      expect(rules.allow).toBe("/");
      expect(rules.disallow).toContain("/api/");
    });
  });

  describe("3. Google Rich Results Compliant JSON-LD Schema Generators", () => {
    const mockConfig: any = {
      storeName: "Artrivo Store",
      tagline: "Handcrafted Luxury Decor",
      supportPhone: "+92 300 1234567",
      logoUrl: "/images/products/ceramic_vase.jpg",
    };

    const mockProduct: any = {
      id: "prod-1",
      name: "Ceramic Minimalist Vase",
      price: "₨ 8,900",
      rating: 4.9,
      reviewsCount: 42,
      category: "Decor",
      inStock: true,
      image: "/images/products/ceramic_vase.jpg",
    };

    it("generates Organization / OnlineStore JSON-LD schema", () => {
      const json = buildJsonLdOrganization(mockConfig);
      expect(json["@type"]).toBe("OnlineStore");
      expect(json.name).toBe("Artrivo Store");
      expect(json.offers["@type"]).toBe("AggregateOffer");
    });

    it("generates Product & Offer JSON-LD schema for Google Rich Results", () => {
      const json = buildJsonLdProduct(mockProduct, mockConfig);
      expect(json["@type"]).toBe("Product");
      expect(json.name).toBe("Ceramic Minimalist Vase");
      expect(json.offers["@type"]).toBe("Offer");
      expect(json.offers.price).toBe(8900);
      expect(json.offers.priceCurrency).toBe("PKR");
      expect(json.aggregateRating.ratingValue).toBe(4.9);
    });

    it("generates BreadcrumbList JSON-LD schema", () => {
      const crumbs = [
        { name: "Home", url: "/shop" },
        { name: "Decor", url: "/category/decor" },
        { name: "Ceramic Vase", url: "/product/prod-1" },
      ];
      const json = buildJsonLdBreadcrumbs(crumbs);
      expect(json["@type"]).toBe("BreadcrumbList");
      expect(json.itemListElement.length).toBe(3);
      expect(json.itemListElement[0].position).toBe(1);
    });
  });
});
