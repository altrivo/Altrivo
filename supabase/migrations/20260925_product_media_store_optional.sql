-- ==============================================================================
-- Fix: Make product_media.store_id optional so gallery images can be saved
--      even when the product belongs to the vendor-scoped products table
--      (which uses vendor_id instead of store_id).
--
-- Also adds an images TEXT[] column to the products table so all gallery URLs
-- are stored directly on the product record as a fast-access array.
-- ==============================================================================

-- 1. Make store_id nullable in product_media (it was NOT NULL, blocking inserts)
ALTER TABLE IF EXISTS public.product_media
  ALTER COLUMN store_id DROP NOT NULL;

-- 2. Add images array column to the products table (if not already present)
ALTER TABLE IF EXISTS public.products
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- 3. Public read policy for product_media so storefront join works
DO $migrate$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'product_media'
      AND policyname = 'Public can read product media'
  ) THEN
    CREATE POLICY "Public can read product media" ON public.product_media
      FOR SELECT TO public USING (true);
  END IF;
END $migrate$;
