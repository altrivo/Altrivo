-- Migration: 20260828_create_store_customers.sql
-- Description: Create store_customers, customer_addresses, and customer_wishlist tables with tenant isolation

CREATE TABLE IF NOT EXISTS public.store_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_store_customer_email UNIQUE (store_id, email)
);

CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.store_customers(id) ON DELETE CASCADE,
  address_type VARCHAR(20) DEFAULT 'home',
  recipient_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  province TEXT DEFAULT 'Punjab',
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.customer_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.store_customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_customer_product_wishlist UNIQUE (customer_id, product_id)
);

-- Indexes for performance (<100ms lookup)
CREATE INDEX IF NOT EXISTS idx_store_customers_store_auth ON public.store_customers(store_id, auth_user_id);
CREATE INDEX IF NOT EXISTS idx_store_customers_store_email ON public.store_customers(store_id, email);
CREATE INDEX IF NOT EXISTS idx_customer_addresses_customer ON public.customer_addresses(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_wishlist_customer ON public.customer_wishlist(customer_id);

-- Enable RLS
ALTER TABLE public.store_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wishlist ENABLE ROW LEVEL SECURITY;

-- Policies for store_customers
CREATE POLICY "Customers can view their own profile" ON public.store_customers
  FOR SELECT USING (auth.uid() = auth_user_id);

CREATE POLICY "Customers can update their own profile" ON public.store_customers
  FOR UPDATE USING (auth.uid() = auth_user_id);
