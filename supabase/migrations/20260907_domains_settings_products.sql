-- ==============================================================================
-- DIGISHOP AI: DOMAINS, STORE SETTINGS & PRODUCTS COMPLETE SCHEMA
-- Migration: 20260907_domains_settings_products.sql
-- ==============================================================================

-- 1. DOMAINS TABLE (Custom Domain Management)
CREATE TABLE IF NOT EXISTS public.domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  domain TEXT NOT NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verifying', 'verified', 'active', 'failed', 'disconnected')),
  dns_records JSONB DEFAULT '[]'::jsonb,
  verification_token TEXT,
  verified_at TIMESTAMPTZ,
  ssl_status VARCHAR(20) DEFAULT 'pending' CHECK (ssl_status IN ('pending', 'provisioning', 'active', 'failed')),
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_domains_store ON public.domains(store_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON public.domains(domain);
CREATE INDEX IF NOT EXISTS idx_domains_status ON public.domains(status);

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'domains' AND policyname = 'Vendors manage own store domains') THEN
    CREATE POLICY "Vendors manage own store domains" ON public.domains FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = domains.store_id
        AND stores.vendor_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = domains.store_id
        AND stores.vendor_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 2. STORE SETTINGS TABLE (Structured settings per section)
CREATE TABLE IF NOT EXISTS public.store_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  section VARCHAR(50) NOT NULL, -- 'identity', 'theme', 'commerce', 'checkout', 'payments', 'notifications', 'seo', 'marketing', 'security'
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_store_settings_section UNIQUE (store_id, section)
);

CREATE INDEX IF NOT EXISTS idx_store_settings_store ON public.store_settings(store_id);

ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'store_settings' AND policyname = 'Vendors manage own store settings') THEN
    CREATE POLICY "Vendors manage own store settings" ON public.store_settings FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = store_settings.store_id
        AND stores.vendor_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = store_settings.store_id
        AND stores.vendor_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 3. PRODUCTS TABLE (Full Blueprint Schema)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  sku VARCHAR(100),
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived', 'deleted')),
  name TEXT NOT NULL,
  description TEXT,
  short_description TEXT,
  tags TEXT[] DEFAULT '{}',
  base_price DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  compare_at_price DECIMAL(12, 2),
  currency VARCHAR(10) DEFAULT 'PKR',
  tax_class VARCHAR(50) DEFAULT 'standard',
  slug TEXT,
  meta_title TEXT,
  meta_description TEXT,
  structured_data JSONB DEFAULT '{}'::jsonb,
  ai_generated BOOLEAN DEFAULT false,
  ai_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_product_store_sku UNIQUE (store_id, sku)
);

CREATE INDEX IF NOT EXISTS idx_products_store ON public.products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(store_id, status);
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(store_id, sku);
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products(store_id, slug);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public can view active products from published stores
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Public view active products') THEN
    CREATE POLICY "Public view active products" ON public.products FOR SELECT
    TO public
    USING (
      status = 'active'
      AND EXISTS (SELECT 1 FROM public.stores WHERE stores.id = products.store_id AND stores.is_published = true)
    );
  END IF;
END $$;

-- Vendors manage own store products
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'products' AND policyname = 'Vendors manage own products') THEN
    CREATE POLICY "Vendors manage own products" ON public.products FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = products.store_id
        AND stores.vendor_id = auth.uid()
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = products.store_id
        AND stores.vendor_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 4. PRODUCT VARIANTS TABLE
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku VARCHAR(100),
  option_type VARCHAR(50), -- 'size', 'color', 'material', etc.
  option_value TEXT,
  price_override DECIMAL(12, 2),
  compare_at_price DECIMAL(12, 2),
  stock INT NOT NULL DEFAULT 0,
  reserved_stock INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  weight DECIMAL(8, 2),
  dimensions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_variants_product ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_variants_store ON public.product_variants(store_id);
CREATE INDEX IF NOT EXISTS idx_variants_sku ON public.product_variants(store_id, sku);

ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_variants' AND policyname = 'Product variants access') THEN
    CREATE POLICY "Product variants access" ON public.product_variants FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = product_variants.store_id
        AND stores.vendor_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.products p
        JOIN public.stores s ON s.id = p.store_id
        WHERE p.id = product_variants.product_id
        AND p.status = 'active'
        AND s.is_published = true
      )
    );
  END IF;
END $$;

-- 5. PRODUCT MEDIA TABLE
CREATE TABLE IF NOT EXISTS public.product_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'image' CHECK (type IN ('image', 'video')),
  url TEXT NOT NULL,
  alt_text TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_product_media_product ON public.product_media(product_id, sort_order);

ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'product_media' AND policyname = 'Product media access') THEN
    CREATE POLICY "Product media access" ON public.product_media FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = product_media.store_id
        AND stores.vendor_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.products p
        JOIN public.stores s ON s.id = p.store_id
        WHERE p.id = product_media.product_id
        AND p.status = 'active'
        AND s.is_published = true
      )
    );
  END IF;
END $$;

-- 6. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_category_store_slug UNIQUE (store_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_categories_store ON public.categories(store_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'categories' AND policyname = 'Categories access') THEN
    CREATE POLICY "Categories access" ON public.categories FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = categories.store_id
        AND (stores.vendor_id = auth.uid() OR stores.is_published = true)
      )
    );
  END IF;
END $$;

-- 7. PRODUCT-CATEGORY JUNCTION
CREATE TABLE IF NOT EXISTS public.product_categories (
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

-- 8. INVENTORY TABLE (Separate from variant for flexibility)
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE CASCADE,
  available_stock INT NOT NULL DEFAULT 0,
  reserved_stock INT NOT NULL DEFAULT 0,
  sold_stock INT NOT NULL DEFAULT 0,
  low_stock_threshold INT DEFAULT 5,
  stock_policy VARCHAR(30) DEFAULT 'track' CHECK (stock_policy IN ('track', 'dont_track', 'backorder')),
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_inventory_product_variant UNIQUE (product_id, variant_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_store ON public.inventory(store_id);
CREATE INDEX IF NOT EXISTS idx_inventory_product ON public.inventory(product_id);

ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'inventory' AND policyname = 'Inventory access') THEN
    CREATE POLICY "Inventory access" ON public.inventory FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = inventory.store_id
        AND stores.vendor_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 9. COUPONS/PROMOTIONS TABLE
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  code VARCHAR(50) NOT NULL,
  description TEXT,
  discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_shipping')),
  discount_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
  min_order_amount DECIMAL(12, 2),
  max_discount_amount DECIMAL(12, 2),
  usage_limit INT,
  used_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT uq_coupon_store_code UNIQUE (store_id, code)
);

CREATE INDEX IF NOT EXISTS idx_coupons_store ON public.coupons(store_id);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'coupons' AND policyname = 'Vendors manage coupons') THEN
    CREATE POLICY "Vendors manage coupons" ON public.coupons FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = coupons.store_id
        AND stores.vendor_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 10. INVOICES TABLE
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_number VARCHAR(50) NOT NULL,
  type VARCHAR(20) DEFAULT 'customer' CHECK (type IN ('customer', 'vendor', 'packing_slip')),
  subtotal DECIMAL(12, 2) NOT NULL,
  discount_total DECIMAL(12, 2) DEFAULT 0,
  shipping_total DECIMAL(12, 2) DEFAULT 0,
  tax_total DECIMAL(12, 2) DEFAULT 0,
  grand_total DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'PKR',
  data JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invoices_order ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_store ON public.invoices(store_id);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'invoices' AND policyname = 'Invoice access') THEN
    CREATE POLICY "Invoice access" ON public.invoices FOR ALL
    USING (
      EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = invoices.store_id
        AND stores.vendor_id = auth.uid()
      )
      OR EXISTS (
        SELECT 1 FROM public.orders o
        JOIN public.store_customers sc ON o.customer_id = sc.id
        WHERE o.id = invoices.order_id
        AND sc.auth_user_id = auth.uid()
      )
    );
  END IF;
END $$;

-- 11. AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
  actor_id UUID,
  actor_type VARCHAR(30), -- 'vendor', 'customer', 'system', 'webhook'
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50), -- 'order', 'product', 'store', 'payment', 'refund', etc.
  resource_id UUID,
  old_data JSONB,
  new_data JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_store ON public.audit_log(store_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_log(actor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_resource ON public.audit_log(resource_type, resource_id);

-- 12. UPDATED_AT TRIGGERS for new tables
CREATE TRIGGER trigger_domains_updated_at BEFORE UPDATE ON public.domains
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_store_settings_updated_at BEFORE UPDATE ON public.store_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_variants_updated_at BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_categories_updated_at BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trigger_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- 13. ADD store_id TO shipments IF MISSING
ALTER TABLE public.shipments ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
CREATE INDEX IF NOT EXISTS idx_shipments_store ON public.shipments(store_id);

-- 14. ADD category & description to complaints
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general';
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS description TEXT;
