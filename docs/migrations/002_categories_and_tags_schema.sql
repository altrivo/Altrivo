-- Migration: 002_categories_and_tags_schema.sql
-- Description: Create categories table with 3-level tree structure, unique vendor slugs, and GIN index for product tags

-- 1. Create Categories Table
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  slug TEXT NOT NULL,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_categories_vendor_slug UNIQUE (vendor_id, slug)
);

-- 2. Indexes for Categories Tree & Search
CREATE INDEX IF NOT EXISTS idx_categories_vendor_id ON public.categories(vendor_id);
CREATE INDEX IF NOT EXISTS idx_categories_parent_id ON public.categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_vendor_slug ON public.categories(vendor_id, slug);

-- 3. GIN Index on Products Tags Array for Fast Tag Search (<100ms SLA)
CREATE INDEX IF NOT EXISTS idx_products_tags_gin ON public.products USING GIN (tags);

-- 4. Enable RLS on Categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_categories_select') THEN
    CREATE POLICY vendor_categories_select ON public.categories
      FOR SELECT USING (auth.uid() = vendor_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_categories_insert') THEN
    CREATE POLICY vendor_categories_insert ON public.categories
      FOR INSERT WITH CHECK (auth.uid() = vendor_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_categories_update') THEN
    CREATE POLICY vendor_categories_update ON public.categories
      FOR UPDATE USING (auth.uid() = vendor_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'vendor_categories_delete') THEN
    CREATE POLICY vendor_categories_delete ON public.categories
      FOR DELETE USING (auth.uid() = vendor_id);
  END IF;
END $$;
