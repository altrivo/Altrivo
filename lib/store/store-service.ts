import fs from "fs";
import path from "path";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase";

export interface StoreRow {
  id: string;
  vendor_id: string;
  name: string;
  slug: string;
  niche: string;
  description: string | null;
  logo_url: string | null;
  layout_config: any;
  seo_config: any;
  commerce_config: any;
  is_published: boolean;
  is_generating: boolean;
  custom_domain: string | null;
  subdomain: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateStoreInput {
  name: string;
  slug: string;
  niche?: string;
  description?: string;
  logo_url?: string;
  layout_config: any;
  seo_config?: any;
  commerce_config?: any;
}

// ---------------------------------------------------------------------------
// Seed Data: StepCraft Luxury Shoes Store (Always Available for Instant Preview)
// ---------------------------------------------------------------------------
const SEED_STORE: StoreRow = {
  id: "store_stepcraft_premium",
  vendor_id: "vendor_dev_123",
  name: "StepCraft Luxury Footwear",
  slug: "stepcraft-premium",
  niche: "shoes",
  description: "Handcrafted luxury footwear made from 100% genuine full-grain leather by master Pakistani artisans.",
  logo_url: null,
  is_published: true,
  is_generating: false,
  custom_domain: null,
  subdomain: "stepcraft-premium",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  seo_config: {
    title: "StepCraft Luxury Footwear | Handcrafted Shoes",
    description: "Discover Pakistan's finest handmade leather shoes. Nationwide Cash on Delivery & 100% Escrow Protection.",
    keywords: ["shoes", "leather shoes", "handmade footwear", "oxford shoes", "loafer", "Pakistan"],
  },
  commerce_config: {
    currency: "PKR",
    currencySymbol: "₨",
    codEnabled: true,
    freeShippingThreshold: 5000,
    escrowEnabled: true,
  },
  layout_config: {
    storeName: "StepCraft Luxury Footwear",
    categories: [
      { name: "Oxford & Formal", href: "/category/formal-shoes" },
      { name: "Casual Loafers", href: "/category/casual-loafers" },
      { name: "Sneakers & Street", href: "/category/sneakers" },
      { name: "Traditional Peshawari", href: "/category/peshawari" },
      { name: "Chelsea Boots", href: "/category/boots" },
    ],
    socialLinks: [
      { name: "Instagram", href: "https://instagram.com", icon: "instagram" },
      { name: "WhatsApp Store", href: "https://wa.me/923001234567", icon: "whatsapp" },
    ],
    theme: {
      colors: {
        primary: "#171717",
        secondary: "#D4AF37",
        background: "#FFFFFF",
        text: "#0A0A0A",
      },
      typography: {
        heading: "Playfair Display",
        body: "Inter",
      },
    },
    sections: [
      {
        id: "promo-banner-1",
        type: "PromoBanner",
        props: {
          text: "🎉 Free Express Delivery on orders over ₨ 5,000 across Pakistan! Use code 'ROYAL10' for 10% OFF.",
          layout: "ribbon",
        },
      },
      {
        id: "hero-split-1",
        type: "HeroSplitImage",
        props: {
          title: "Walk With Royal Distinction",
          subtitle: "100% pure full-grain calfskin leather shoes. Handcrafted in Pakistan with ergonomic cushioning for all-day comfort.",
          ctaText: "Shop Collection",
          ctaLink: "/shop",
          secondaryCtaText: "Explore Heritage",
          secondaryCtaLink: "/about",
          imageUrl: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
          imageAlignment: "right",
        },
      },
      {
        id: "category-carousel-1",
        type: "CategoryCarouselCenterEmphasis",
        props: {
          title: "Explore Shoe Collections",
          layout: "card",
          categories: [
            { title: "Oxford & Formals", count: "24 items", image: "https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=600&q=80", href: "/category/formal" },
            { title: "Casual Loafers", count: "18 items", image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80", href: "/category/loafers" },
            { title: "Sneakers & Street", count: "32 items", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80", href: "/category/sneakers" },
            { title: "Peshawari Chappal", count: "12 items", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80", href: "/category/traditional" },
          ],
        },
      },
      {
        id: "product-grid-1",
        type: "ProductGridFeatured",
        props: {
          title: "Featured Masterpieces",
          columns: 3,
        },
      },
      {
        id: "brand-story-1",
        type: "BrandStory",
        props: {
          title: "The Legacy of Master Cobblers",
          paragraphs: [
            "Every pair of StepCraft shoes begins with hand-selected hides of top-tier full-grain leather. Our craftsmen spend over 36 hours stitching, shaping, and polishing each silhouette to perfection.",
            "We reject synthetic shortcuts. From Goodyear welted soles to soft breathable leather linings, every detail is engineered to ensure timeless luxury that molds to your feet.",
          ],
          imageUrl: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=1200&q=80",
        },
      },
      {
        id: "testimonial-slider-1",
        type: "TestimonialSlider",
        props: {
          title: "What Pakistani Gentlemen Say",
          layout: "carousel",
          testimonials: [
            { id: "1", name: "Hamza Tariq (Lahore)", text: "Ordered the Black Oxford for my brother's wedding. The leather quality is unmatched, honestly beats foreign designer brands!", rating: 5, role: "Verified Buyer" },
            { id: "2", name: "Dr. Bilal Khan (Islamabad)", text: "Cash on delivery was fast (delivered in 2 days). The arch support is so comfortable for daily hospital rounds.", rating: 5, role: "Verified Buyer" },
            { id: "3", name: "Zainab Malik (Karachi)", text: "Bought Peshawari chappal for my husband on Eid. Excellent stitching and premium packaging.", rating: 5, role: "Verified Buyer" },
          ],
        },
      },
      {
        id: "newsletter-signup-1",
        type: "NewsletterSignupProgressive",
        props: {
          title: "Join The StepCraft Inner Circle",
          subtitle: "Get exclusive access to private shoe drops and enjoy instant 10% OFF your first order.",
          buttonText: "Claim 10% Discount",
          layout: "box",
        },
      },
      {
        id: "feature-grid-1",
        type: "FeatureGrid",
        props: {
          columns: 4,
          items: [
            { icon: "truck", title: "Cash on Delivery", description: "Pay at your doorstep anywhere in Pakistan via TCS / Leopard" },
            { icon: "shield-check", title: "A2 Escrow Protection", description: "100% buyer protection guarantee until delivery confirmation" },
            { icon: "rotate-ccw", title: "7-Day Easy Exchange", description: "Hassle-free size replacement with zero extra charges" },
            { icon: "award", title: "Pure Full-Grain Leather", description: "Hand-inspected natural leather crafted by master shoemakers" },
          ],
        },
      },
    ],
    products: [
      {
        id: "s1",
        name: "Royal Oxford Calfskin Shoes",
        price: "₨ 7,800",
        originalPrice: "₨ 9,500",
        discount: "18% OFF",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80",
        tag: "Bestseller",
        inStock: true,
      },
      {
        id: "s2",
        name: "Handcrafted Suede Loafers",
        price: "₨ 6,400",
        originalPrice: "₨ 7,800",
        discount: "18% OFF",
        rating: 4.8,
        image: "https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=600&q=80",
        tag: "Trending",
        inStock: true,
      },
      {
        id: "s3",
        name: "Peshawari Chappal - Pure Leather",
        price: "₨ 5,200",
        originalPrice: "₨ 6,500",
        discount: "20% OFF",
        rating: 5.0,
        image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=600&q=80",
        tag: "Traditional",
        inStock: true,
      },
      {
        id: "s4",
        name: "Urban Streetwear Sneakers",
        price: "₨ 8,900",
        originalPrice: "₨ 11,000",
        discount: "20% OFF",
        rating: 4.9,
        image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80",
        tag: "Limited Drop",
        inStock: true,
      },
    ],
  },
};

// ---------------------------------------------------------------------------
// File-System & GlobalThis Persistence Layer
// ---------------------------------------------------------------------------
const DATA_DIR = path.join(process.cwd(), ".data");
const STORES_FILE = path.join(DATA_DIR, "stores.json");

function ensureDataFile(): StoreRow[] {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORES_FILE)) {
      const initial = [SEED_STORE];
      fs.writeFileSync(STORES_FILE, JSON.stringify(initial, null, 2), "utf-8");
      return initial;
    }
    const raw = fs.readFileSync(STORES_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return [SEED_STORE];
  } catch (err) {
    console.warn("[store-service] File persistence fallback:", err);
    return [SEED_STORE];
  }
}

function persistToFile(stores: StoreRow[]) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORES_FILE, JSON.stringify(stores, null, 2), "utf-8");
  } catch (err) {
    console.warn("[store-service] Failed writing stores.json:", err);
  }
}

// Global registry shared across all Next.js bundles and SSR threads
declare global {
  var __DIGISHOP_STORES__: StoreRow[] | undefined;
}

function getStoresArray(): StoreRow[] {
  const diskStores = ensureDataFile();
  globalThis.__DIGISHOP_STORES__ = diskStores;
  return diskStores;
}

function saveStoresArray(stores: StoreRow[]) {
  globalThis.__DIGISHOP_STORES__ = stores;
  persistToFile(stores);
}

// ---------------------------------------------------------------------------
// Public Store Service APIs
// ---------------------------------------------------------------------------

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getAdminSupabaseClient() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !serviceKey) return null;
    const { createClient: createSupabaseJs } = await import("@supabase/supabase-js");
    return createSupabaseJs(url, serviceKey, {
      auth: { persistSession: false },
    });
  } catch {
    return null;
  }
}

export async function getVendorStores(explicitVendorId?: string): Promise<StoreRow[]> {
  try {
    let targetVendorId = explicitVendorId;

    if (!targetVendorId) {
      try {
        const supabase = await createClient();
        const { data: userData } = await supabase.auth.getUser();
        if (userData?.user?.id) {
          targetVendorId = userData.user.id;
        }
      } catch {}
    }

    if (!targetVendorId) {
      try {
        const { cookies } = await import("next/headers");
        const cookieStore = await cookies();
        const cookieVendor = cookieStore.get("active_vendor_id")?.value;
        if (cookieVendor) {
          targetVendorId = cookieVendor;
        }
      } catch {}
    }

    if (targetVendorId) {
      const supabase = (await getAdminSupabaseClient()) || (await createClient());
      if (supabase) {
        const { data, error } = await supabase
          .from("stores")
          .select("*")
          .eq("vendor_id", targetVendorId)
          .order("created_at", { ascending: false });

        if (!error && data) {
          return data as StoreRow[];
        }
      }
    }
  } catch {}

  return [];
}

export async function getStoreById(storeId: string): Promise<StoreRow | null> {
  if (!storeId) return null;
  const clean = storeId.toLowerCase().trim();

  try {
    const supabase = (await getAdminSupabaseClient()) || (await createClient());
    if (supabase) {
      let query = supabase.from("stores").select("*");
      if (UUID_REGEX.test(storeId)) {
        query = query.or(`id.eq.${storeId},slug.eq.${clean},subdomain.eq.${clean}`);
      } else {
        query = query.or(`slug.eq.${clean},subdomain.eq.${clean}`);
      }
      const { data, error } = await query.single();
      if (!error && data) {
        return data as StoreRow;
      }
    }
  } catch {
    // Fall back to local persistent store
  }

  const stores = getStoresArray();
  return (
    stores.find(
      (s) =>
        s.id === storeId ||
        s.slug?.toLowerCase() === clean ||
        s.subdomain?.toLowerCase() === clean
    ) || null
  );
}

export async function getStoreBySlug(slug: string): Promise<StoreRow | null> {
  if (!slug) return null;
  const cleanSlug = slug.toLowerCase().trim();

  try {
    const supabase = (await getAdminSupabaseClient()) || (await createClient());
    if (supabase) {
      let query = supabase.from("stores").select("*");
      if (UUID_REGEX.test(cleanSlug)) {
        query = query.or(`slug.eq.${cleanSlug},subdomain.eq.${cleanSlug},id.eq.${cleanSlug}`);
      } else {
        query = query.or(`slug.eq.${cleanSlug},subdomain.eq.${cleanSlug}`);
      }
      const { data, error } = await query.single();
      if (!error && data) {
        return data as StoreRow;
      }
    }
  } catch {
    // Fall back to local persistent store
  }

  const stores = getStoresArray();
  return (
    stores.find(
      (s) =>
        s.slug?.toLowerCase() === cleanSlug ||
        s.subdomain?.toLowerCase() === cleanSlug ||
        s.id?.toLowerCase() === cleanSlug
    ) || null
  );
}

export async function getStoreBySubdomain(subdomain: string): Promise<StoreRow | null> {
  if (!subdomain) return null;
  const clean = subdomain.toLowerCase().trim();

  try {
    const supabase = (await getAdminSupabaseClient()) || (await createClient());
    if (supabase) {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("subdomain", clean)
        .single();

      if (!error && data) {
        return data as StoreRow;
      }
    }
  } catch {
    // Fall back to local persistent store
  }

  const stores = getStoresArray();
  return stores.find((s) => s.subdomain?.toLowerCase() === clean || s.slug?.toLowerCase() === clean) || null;
}

export async function getStoreByDomain(domain: string): Promise<StoreRow | null> {
  if (!domain) return null;
  const clean = domain.toLowerCase().trim();

  try {
    const supabase = (await getAdminSupabaseClient()) || (await createClient());
    if (supabase) {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("custom_domain", clean)
        .single();

      if (!error && data) {
        return data as StoreRow;
      }
    }
  } catch {
    // Fall back to local persistent store
  }

  const stores = getStoresArray();
  return stores.find((s) => s.custom_domain?.toLowerCase() === clean) || null;
}

export async function createStore(input: CreateStoreInput, explicitVendorId?: string): Promise<StoreRow> {
  let effectiveVendorId = explicitVendorId;

  if (!effectiveVendorId) {
    try {
      const supabase = await createClient();
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user?.id) {
        effectiveVendorId = userData.user.id;
      }
    } catch {}
  }

  if (!effectiveVendorId || !UUID_REGEX.test(effectiveVendorId)) {
    try {
      const { cookies } = await import("next/headers");
      const cookieStore = await cookies();
      const cookieVendor = cookieStore.get("active_vendor_id")?.value;
      if (cookieVendor && UUID_REGEX.test(cookieVendor)) {
        effectiveVendorId = cookieVendor;
      }
    } catch {}
  }

  // Fallback: lookup the latest active vendor from database so foreign key is always satisfied
  if (!effectiveVendorId || !UUID_REGEX.test(effectiveVendorId)) {
    try {
      const supabase = (await getAdminSupabaseClient()) || (await createClient());
      if (supabase) {
        const { data: latestVendor } = await supabase
          .from("vendors")
          .select("id")
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();
        if (latestVendor?.id && UUID_REGEX.test(latestVendor.id)) {
          effectiveVendorId = latestVendor.id;
        }
      }
    } catch {}
  }

  const finalVendorId = (effectiveVendorId && UUID_REGEX.test(effectiveVendorId))
    ? effectiveVendorId
    : "ce8c7d73-2150-452d-91a7-04de62102920"; // valid fallback vendor UUID
  const now = new Date().toISOString();
  const cleanSlug = (input.slug || await generateUniqueSlug(input.name)).toLowerCase().trim();

  // Ensure layout_config has the exact store name
  const updatedLayoutConfig = {
    ...(input.layout_config || {}),
    storeName: input.name,
  };

  // Ensure layout_config has the exact store name and clean published products
  const layoutProducts = (updatedLayoutConfig.products || []).map((p: any) => ({
    ...p,
    status: p.status || "published",
  }));

  const cleanedLayoutConfig = {
    ...updatedLayoutConfig,
    ...(layoutProducts.length > 0 ? { products: layoutProducts } : {}),
  };

  const newStoreRow: StoreRow = {
    id: `store_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    vendor_id: finalVendorId,
    name: input.name,
    slug: cleanSlug,
    niche: input.niche || "shoes",
    description: input.description || null,
    logo_url: input.logo_url || null,
    layout_config: cleanedLayoutConfig,
    seo_config: input.seo_config || {},
    commerce_config: {
      currency: "USD",
      currencySymbol: "$",
      codEnabled: true,
      freeShippingThreshold: 50,
      escrowEnabled: true,
      ...(input.commerce_config || {}),
    },
    is_published: true,
    is_generating: false,
    custom_domain: null,
    subdomain: cleanSlug,
    created_at: now,
    updated_at: now,
  };

  try {
    const supabase = (await getAdminSupabaseClient()) || (await createClient());
    if (supabase) {
      const { data, error } = await supabase
        .from("stores")
        .insert([{
          ...input,
          layout_config: updatedLayoutConfig,
          slug: cleanSlug,
          vendor_id: finalVendorId,
          is_published: true
        }])
        .select()
        .single();

      if (!error && data) {
        const stores = getStoresArray();
        saveStoresArray([data as StoreRow, ...stores.filter((s) => s.id !== data.id && s.slug !== cleanSlug)]);
        return data as StoreRow;
      }
    }
  } catch {
    // Fall through to local persistent store
  }

  const stores = getStoresArray();
  saveStoresArray([newStoreRow, ...stores.filter((s) => s.slug !== cleanSlug)]);
  return newStoreRow;
}

export async function updateStore(storeId: string, updates: Partial<StoreRow>): Promise<StoreRow> {
  if (!storeId) throw new Error("Store ID or slug is required");
  const clean = storeId.toLowerCase().trim();

  const stores = getStoresArray();
  const idx = stores.findIndex(
    (s) =>
      s.id === storeId ||
      s.slug?.toLowerCase() === clean ||
      s.subdomain?.toLowerCase() === clean
  );

  let existingStore: StoreRow | null = idx !== -1 ? stores[idx] : null;
  if (!existingStore) {
    existingStore = await getStoreById(clean) || await getStoreBySlug(clean);
  }

  const targetId = idx !== -1 ? stores[idx].id : existingStore?.id || storeId;

  let mergedLayout = updates.layout_config;
  if (existingStore?.layout_config) {
    mergedLayout = {
      ...existingStore.layout_config,
      ...(updates.layout_config || {}),
    };

    // CRITICAL: NEVER wipe out existing sections if updates didn't include valid sections!
    if (
      (!updates.layout_config?.sections || updates.layout_config.sections.length === 0) &&
      existingStore.layout_config.sections &&
      existingStore.layout_config.sections.length > 0
    ) {
      mergedLayout.sections = existingStore.layout_config.sections;
    }

    if (!updates.layout_config?.theme && existingStore.layout_config.theme) {
      mergedLayout.theme = existingStore.layout_config.theme;
    }

    if (!updates.layout_config?.categories && existingStore.layout_config.categories) {
      mergedLayout.categories = existingStore.layout_config.categories;
    }

    if (!updates.layout_config?.storeName && existingStore.layout_config.storeName) {
      mergedLayout.storeName = existingStore.layout_config.storeName;
    }
  }

  let mergedCommerce = updates.commerce_config;
  if (existingStore?.commerce_config) {
    mergedCommerce = {
      ...existingStore.commerce_config,
      ...(updates.commerce_config || {}),
    };
  }

  // If products were updated in layout_config, also sync them to sections that display products
  if (mergedLayout?.products && Array.isArray(mergedLayout.products) && mergedLayout.sections) {
    mergedLayout.sections = mergedLayout.sections.map((sec: any) => {
      if (sec.type === 'ProductGridFeatured' || sec.type?.includes('ProductGrid')) {
        return {
          ...sec,
          props: {
            ...sec.props,
            products: mergedLayout.products,
          },
        };
      }
      return sec;
    });
  }

  const safeUpdates = {
    ...updates,
    ...(mergedLayout ? { layout_config: mergedLayout } : {}),
    ...(mergedCommerce ? { commerce_config: mergedCommerce } : {}),
  };

  // 1. Immediately persist locally
  if (idx !== -1) {
    stores[idx] = {
      ...stores[idx],
      ...safeUpdates,
      updated_at: new Date().toISOString(),
    };
    saveStoresArray([...stores]);
  }

  // 2. Persist to Supabase cloud
  try {
    const supabase = (await getAdminSupabaseClient()) || (await createClient());
    if (supabase) {
      let query = supabase
        .from("stores")
        .update({ ...safeUpdates, updated_at: new Date().toISOString() });

      if (UUID_REGEX.test(targetId)) {
        query = query.or(`id.eq.${targetId},slug.eq.${clean}`);
      } else {
        query = query.or(`slug.eq.${clean},subdomain.eq.${clean}`);
      }

      const { data, error } = await query.select().single();

      if (!error && data) {
        if (idx !== -1) {
          stores[idx] = data as StoreRow;
        } else {
          stores.unshift(data as StoreRow);
        }
        saveStoresArray([...stores]);
        return data as StoreRow;
      }
    }
  } catch (err) {
    console.warn("[store-service] Supabase update warning:", err);
  }

  if (idx !== -1) {
    return stores[idx];
  }

  // If not found in memory, create a fallback entry with updates
  const newFallback: StoreRow = {
    id: `store_${Date.now()}`,
    vendor_id: "vendor_dev_123",
    name: (updates as any).name || "StepCraft Luxury Footwear",
    slug: clean,
    niche: (updates as any).niche || "shoes",
    description: null,
    logo_url: null,
    layout_config: updates.layout_config || {},
    seo_config: {},
    commerce_config: {},
    is_published: true,
    is_generating: false,
    custom_domain: null,
    subdomain: clean,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  saveStoresArray([newFallback, ...stores]);
  return newFallback;
}

export async function updateLayoutConfig(storeId: string, layoutConfig: any): Promise<StoreRow> {
  return updateStore(storeId, { layout_config: layoutConfig });
}

export async function publishStore(storeId: string): Promise<StoreRow> {
  return updateStore(storeId, { is_published: true });
}

export async function unpublishStore(storeId: string): Promise<StoreRow> {
  return updateStore(storeId, { is_published: false });
}

export async function deleteStore(storeId: string): Promise<void> {
  const store = await getStoreById(storeId);
  const storeSlug = store?.slug;

  if (supabaseAdmin) {
    try {
      // 1. Delete notifications related to this store
      await supabaseAdmin.from("notifications").delete().eq("store_id", storeId);

      // 2. Delete store customers registered for this store
      await supabaseAdmin.from("store_customers").delete().eq("store_id", storeId);

      // 3. Delete orders and child records specifically belonging to this store
      const { data: storeOrders } = await supabaseAdmin
        .from("orders")
        .select("id")
        .eq("store_id", storeId);

      if (storeOrders && storeOrders.length > 0) {
        const orderIds = storeOrders.map((o) => o.id);
        await supabaseAdmin.from("order_items").delete().in("order_id", orderIds);
        await supabaseAdmin.from("shipments").delete().in("order_id", orderIds);
        await supabaseAdmin.from("order_events").delete().in("order_id", orderIds);
        await supabaseAdmin.from("orders").delete().in("id", orderIds);
      }

      if (storeSlug) {
        const { data: slugOrders } = await supabaseAdmin
          .from("orders")
          .select("id")
          .eq("store_id", storeSlug);

        if (slugOrders && slugOrders.length > 0) {
          const sOrderIds = slugOrders.map((o) => o.id);
          await supabaseAdmin.from("order_items").delete().in("order_id", sOrderIds);
          await supabaseAdmin.from("shipments").delete().in("order_id", sOrderIds);
          await supabaseAdmin.from("order_events").delete().in("order_id", sOrderIds);
          await supabaseAdmin.from("orders").delete().in("id", sOrderIds);
        }
      }

      // 4. Delete the store record itself from Supabase
      const { error: delErr } = await supabaseAdmin.from("stores").delete().eq("id", storeId);
      if (delErr) {
        console.error("[deleteStore] Error deleting store from Supabase:", delErr);
      }
    } catch (err) {
      console.error("[deleteStore] Error during store cascade deletion:", err);
    }
  }

  // 5. Remove store from local persistent JSON store
  const stores = getStoresArray();
  saveStoresArray(stores.filter((s) => s.id !== storeId && (!storeSlug || s.slug !== storeSlug)));
}

export async function generateUniqueSlug(baseName: string): Promise<string> {
  const slugify = (text: string) =>
    text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "")
      .replace(/\-\-+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");

  const baseSlug = slugify(baseName) || "store";
  let slug = baseSlug;
  let counter = 0;
  let isUnique = false;

  while (!isUnique && counter < 10) {
    const existingStore = await getStoreBySlug(slug);
    if (!existingStore) {
      isUnique = true;
    } else {
      const suffix = Math.random().toString(36).substring(2, 6);
      slug = `${baseSlug}-${suffix}`;
      counter++;
    }
  }

  if (!isUnique) {
    slug = `${baseSlug}-${Date.now().toString(36)}`;
  }

  return slug;
}
