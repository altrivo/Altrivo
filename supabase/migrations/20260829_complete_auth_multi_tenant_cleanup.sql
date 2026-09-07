-- ============================================================================
-- DIGISHOP AI: Complete Multi-Tenant Auth, Store Customers, Orders & Tracking
-- Migration: 20260829_complete_auth_multi_tenant_cleanup.sql
-- ============================================================================

-- 1. Idempotent set_updated_at helper function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Vendors table hardening & status transition guard
CREATE TABLE IF NOT EXISTS public.vendors (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  email TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  region TEXT DEFAULT 'Pakistan',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger to protect vendor admin fields (prevent self-approval of status)
CREATE OR REPLACE FUNCTION public.protect_vendor_admin_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If invoked by normal authenticated client (not service_role)
  IF (auth.jwt() ->> 'role') != 'service_role' THEN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      RAISE EXCEPTION 'Vendors cannot alter their own approval status.';
    END IF;
    IF OLD.id IS DISTINCT FROM NEW.id THEN
      RAISE EXCEPTION 'Vendor ID cannot be altered.';
    END IF;
    IF OLD.created_at IS DISTINCT FROM NEW.created_at THEN
      RAISE EXCEPTION 'created_at cannot be altered.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_protect_vendor_admin_fields ON public.vendors;
CREATE TRIGGER tr_protect_vendor_admin_fields
BEFORE UPDATE ON public.vendors
FOR EACH ROW EXECUTE FUNCTION public.protect_vendor_admin_fields();

-- Vendors RLS
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can view own profile" ON public.vendors;
CREATE POLICY "Vendors can view own profile"
ON public.vendors FOR SELECT
TO authenticated
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Vendors can insert own pending profile" ON public.vendors;
CREATE POLICY "Vendors can insert own pending profile"
ON public.vendors FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id AND status = 'pending');

DROP POLICY IF EXISTS "Vendors can update own profile" ON public.vendors;
CREATE POLICY "Vendors can update own profile"
ON public.vendors FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Stores Table schema verification
CREATE TABLE IF NOT EXISTS public.stores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  niche TEXT DEFAULT 'retail',
  description TEXT,
  logo_url TEXT,
  layout_config JSONB DEFAULT '{}'::jsonb,
  seo_config JSONB DEFAULT '{}'::jsonb,
  commerce_config JSONB DEFAULT '{"currency": "PKR", "cod_enabled": true}'::jsonb,
  is_published BOOLEAN NOT NULL DEFAULT true,
  is_generating BOOLEAN NOT NULL DEFAULT false,
  custom_domain TEXT UNIQUE,
  subdomain TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stores_vendor_id ON public.stores(vendor_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_subdomain ON public.stores(subdomain);
CREATE INDEX IF NOT EXISTS idx_stores_custom_domain ON public.stores(custom_domain);

ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can view published stores" ON public.stores;
CREATE POLICY "Public can view published stores"
ON public.stores FOR SELECT
TO public
USING (is_published = true);

DROP POLICY IF EXISTS "Vendors manage own stores" ON public.stores;
CREATE POLICY "Vendors manage own stores"
ON public.stores FOR ALL
TO authenticated
USING (auth.uid() = vendor_id)
WITH CHECK (auth.uid() = vendor_id);

-- 4. Store Customers Table (Customer account scoped to store)
CREATE TABLE IF NOT EXISTS public.store_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_store_customer_email UNIQUE (store_id, email)
);

CREATE INDEX IF NOT EXISTS idx_store_customers_store_auth ON public.store_customers(store_id, auth_user_id);
CREATE INDEX IF NOT EXISTS idx_store_customers_store_email ON public.store_customers(store_id, email);

ALTER TABLE public.store_customers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers view own profile in store" ON public.store_customers;
CREATE POLICY "Customers view own profile in store"
ON public.store_customers FOR SELECT
TO authenticated
USING (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Customers update own profile in store" ON public.store_customers;
CREATE POLICY "Customers update own profile in store"
ON public.store_customers FOR UPDATE
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

DROP POLICY IF EXISTS "Vendors view customers of own store" ON public.store_customers;
CREATE POLICY "Vendors view customers of own store"
ON public.store_customers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = store_customers.store_id
    AND stores.vendor_id = auth.uid()
  )
);

-- 5. Customer Addresses Table
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.store_customers(id) ON DELETE CASCADE,
  label VARCHAR(50) DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT DEFAULT 'Punjab',
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_customer_addresses_lookup ON public.customer_addresses(customer_id, is_default);

ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers manage own addresses" ON public.customer_addresses;
CREATE POLICY "Customers manage own addresses"
ON public.customer_addresses FOR ALL
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.store_customers WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  customer_id IN (
    SELECT id FROM public.store_customers WHERE auth_user_id = auth.uid()
  )
);

-- 6. Customer Wishlist Table
CREATE TABLE IF NOT EXISTS public.customer_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.store_customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_customer_wishlist_item UNIQUE (customer_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_customer_wishlist_lookup ON public.customer_wishlist(customer_id);

ALTER TABLE public.customer_wishlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers manage own wishlist" ON public.customer_wishlist;
CREATE POLICY "Customers manage own wishlist"
ON public.customer_wishlist FOR ALL
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.store_customers WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  customer_id IN (
    SELECT id FROM public.store_customers WHERE auth_user_id = auth.uid()
  )
);

-- 7. Carts & Cart Items Table
CREATE TABLE IF NOT EXISTS public.carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.store_customers(id) ON DELETE SET NULL,
  session_id TEXT,
  currency VARCHAR(10) DEFAULT 'PKR',
  subtotal DECIMAL(12,2) DEFAULT 0.00,
  discount DECIMAL(12,2) DEFAULT 0.00,
  shipping DECIMAL(12,2) DEFAULT 0.00,
  total DECIMAL(12,2) DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_carts_store_customer ON public.carts(store_id, customer_id);
CREATE INDEX IF NOT EXISTS idx_carts_session_id ON public.carts(session_id);

CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID NOT NULL REFERENCES public.carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID,
  quantity INT NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON public.cart_items(cart_id);

ALTER TABLE public.carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers manage own carts" ON public.carts;
CREATE POLICY "Customers manage own carts"
ON public.carts FOR ALL
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.store_customers WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  customer_id IN (
    SELECT id FROM public.store_customers WHERE auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Customers manage own cart items" ON public.cart_items;
CREATE POLICY "Customers manage own cart items"
ON public.cart_items FOR ALL
TO authenticated
USING (
  cart_id IN (
    SELECT c.id FROM public.carts c
    JOIN public.store_customers sc ON c.customer_id = sc.id
    WHERE sc.auth_user_id = auth.uid()
  )
)
WITH CHECK (
  cart_id IN (
    SELECT c.id FROM public.carts c
    JOIN public.store_customers sc ON c.customer_id = sc.id
    WHERE sc.auth_user_id = auth.uid()
  )
);

-- 8. Orders Table schema enhancements
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping DECIMAL(12,2) DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_region TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);

-- Orders RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can view store orders" ON public.orders;
CREATE POLICY "Vendors can view store orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  auth.uid() = vendor_id OR
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = orders.store_id
    AND stores.vendor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Vendors can update store orders" ON public.orders;
CREATE POLICY "Vendors can update store orders"
ON public.orders FOR UPDATE
TO authenticated
USING (
  auth.uid() = vendor_id OR
  EXISTS (
    SELECT 1 FROM public.stores
    WHERE stores.id = orders.store_id
    AND stores.vendor_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders"
ON public.orders FOR SELECT
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM public.store_customers WHERE auth_user_id = auth.uid()
  )
);

-- 9. Shipments and Shipment Events
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  courier_provider VARCHAR(50) DEFAULT 'trax',
  courier_name VARCHAR(100) DEFAULT 'Trax Express',
  tracking_number VARCHAR(100) NOT NULL,
  waybill_number VARCHAR(100),
  status VARCHAR(50) NOT NULL DEFAULT 'shipment_created',
  estimated_delivery TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipments_order ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON public.shipments(tracking_number);

CREATE TABLE IF NOT EXISTS public.shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  location VARCHAR(150),
  description TEXT,
  event_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  raw_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment ON public.shipment_events(shipment_id);

ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors view shipments for their orders" ON public.shipments;
CREATE POLICY "Vendors view shipments for their orders"
ON public.shipments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.stores s ON o.store_id = s.id
    WHERE o.id = shipments.order_id AND (s.vendor_id = auth.uid() OR o.vendor_id = auth.uid())
  )
);

DROP POLICY IF EXISTS "Customers view shipments for their orders" ON public.shipments;
CREATE POLICY "Customers view shipments for their orders"
ON public.shipments FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.store_customers sc ON o.customer_id = sc.id
    WHERE o.id = shipments.order_id AND sc.auth_user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Public or auth view shipment events by shipment" ON public.shipment_events;
CREATE POLICY "Public or auth view shipment events by shipment"
ON public.shipment_events FOR SELECT
TO public
USING (true);
