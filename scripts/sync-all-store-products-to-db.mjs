import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing SUPABASE environment variables.");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function toValidUUID(str) {
  if (!str) return crypto.randomUUID();
  if (UUID_REGEX.test(str)) return str.toLowerCase();
  const hash = crypto.createHash("md5").update("altrivo-prod-" + str).digest("hex");
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-4${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function parsePrice(val) {
  if (typeof val === "number" && !isNaN(val)) return val;
  if (typeof val === "string") {
    const cleaned = val.replace(/[^0-9.-]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

async function run() {
  console.log("=== Backfilling all store products into Supabase products & product_variants ===");

  const { data: stores, error } = await supabaseAdmin
    .from("stores")
    .select("id, name, slug, vendor_id, layout_config, commerce_config");

  if (error || !stores) {
    console.error("Failed to fetch stores:", error);
    process.exit(1);
  }

  let totalProductsSynced = 0;

  for (const store of stores) {
    const vendorId = store.vendor_id;
    if (!vendorId || !UUID_REGEX.test(vendorId)) {
      console.log(`Skipping store ${store.name} (${store.slug}): no valid vendor UUID`);
      continue;
    }

    const commerceProds = Array.isArray(store.commerce_config?.products) ? store.commerce_config.products : [];
    const layoutProds = Array.isArray(store.layout_config?.products) ? store.layout_config.products : [];

    const productMap = new Map();
    commerceProds.forEach((p) => {
      if (p && (p.id || p.sku || p.name || p.title)) {
        productMap.set(p.id || p.sku || p.name || p.title, p);
      }
    });
    layoutProds.forEach((p) => {
      const k = p.id || p.sku || p.name || p.title;
      if (p && k && !productMap.has(k)) {
        productMap.set(k, p);
      }
    });

    const products = Array.from(productMap.values());
    console.log(`\nStore: ${store.name} (${store.slug}) - Found ${products.length} products`);

    for (const raw of products) {
      const prodId = toValidUUID(raw.id || raw.sku || raw.name || raw.title);
      const title = String(raw.title || raw.name || "Product").trim();
      const description = String(raw.description || "").trim();
      const category = String(raw.category || "General").trim();
      const price = parsePrice(raw.price);
      const comparePrice = parsePrice(raw.comparePrice || raw.compare_price || 0);
      const cost = parsePrice(raw.cost || raw.costPerItem || 0);
      const imageUrl = raw.image || raw.thumbnail || raw.image_url || null;
      const status = raw.status === "draft" ? "draft" : raw.status === "archived" ? "archived" : "published";
      const nowISO = new Date().toISOString();

      const productPayload = {
        id: prodId,
        vendor_id: vendorId,
        name: title,
        title: title,
        description: description,
        category: category,
        price: price,
        compare_price: comparePrice,
        cost: cost,
        image_url: imageUrl,
        status: status,
        updated_at: nowISO,
      };

      const { error: pErr } = await supabaseAdmin
        .from("products")
        .upsert(productPayload, { onConflict: "id" });

      if (pErr) {
        console.error(`  Error upserting product ${title} (${prodId}):`, pErr.message);
        continue;
      }

      const variantId = toValidUUID((raw.id || raw.sku || prodId) + "-primary-variant");
      const sku = String(raw.sku || ("SKU-" + prodId.slice(0, 8)).toUpperCase());
      const stock = typeof raw.stock === "number" ? raw.stock : 10;

      const variantPayload = {
        id: variantId,
        product_id: prodId,
        sku: sku,
        price: price,
        stock: stock,
        image_url: imageUrl,
        enabled: status !== "archived",
        updated_at: nowISO,
      };

      const { error: vErr } = await supabaseAdmin
        .from("product_variants")
        .upsert(variantPayload, { onConflict: "id" });

      if (vErr) {
        console.error(`  Error upserting variant for ${title}:`, vErr.message);
      } else {
        console.log(`  Synced: ${title} ($${price}, stock: ${stock}, sku: ${sku}) -> DB ID: ${prodId}`);
        totalProductsSynced++;
      }
    }
  }

  console.log(`\n=== Backfill Complete! Total products synced: ${totalProductsSynced} ===`);
}

run().catch(console.error);
