-- Migration: 001_products_schema.sql
-- Description: Create products and product_variants tables with RLS and indexes

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Products Table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category_id TEXT,
  tags TEXT[] DEFAULT '{}',
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  compare_price NUMERIC(10,2) DEFAULT 0.00,
  cost NUMERIC(10,2) DEFAULT 0.00,
  seo_slug TEXT UNIQUE,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('published', 'draft', 'out-of-stock', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create Product Variants Table
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  sku TEXT UNIQUE NOT NULL,
  option_values JSONB DEFAULT '{}'::jsonb,
  price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  stock INT NOT NULL DEFAULT 0,
  image_url TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Indexes for fast queries (<200ms P95)
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON public.products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_vendor_status_cat ON public.products(vendor_id, status, category_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON public.product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON public.product_variants(sku);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;

-- 5. Products RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_products_select') THEN
    CREATE POLICY vendor_products_select ON public.products
      FOR SELECT USING (auth.uid() = vendor_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_products_insert') THEN
    CREATE POLICY vendor_products_insert ON public.products
      FOR INSERT WITH CHECK (auth.uid() = vendor_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_products_update') THEN
    CREATE POLICY vendor_products_update ON public.products
      FOR UPDATE USING (auth.uid() = vendor_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_products_delete') THEN
    CREATE POLICY vendor_products_delete ON public.products
      FOR DELETE USING (auth.uid() = vendor_id);
  END IF;
END $$;

-- 6. Product Variants RLS Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_variants_select') THEN
    CREATE POLICY vendor_variants_select ON public.product_variants
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.products p
          WHERE p.id = product_variants.product_id AND p.vendor_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_variants_insert') THEN
    CREATE POLICY vendor_variants_insert ON public.product_variants
      FOR INSERT WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.products p
          WHERE p.id = product_variants.product_id AND p.vendor_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_variants_update') THEN
    CREATE POLICY vendor_variants_update ON public.product_variants
      FOR UPDATE USING (
        EXISTS (
          SELECT 1 FROM public.products p
          WHERE p.id = product_variants.product_id AND p.vendor_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_variants_delete') THEN
    CREATE POLICY vendor_variants_delete ON public.product_variants
      FOR DELETE USING (
        EXISTS (
          SELECT 1 FROM public.products p
          WHERE p.id = product_variants.product_id AND p.vendor_id = auth.uid()
        )
      );
  END IF;
END $$;
