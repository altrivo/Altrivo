-- ==============================================================================
-- DIGISHOP AI: MASTER AUTHENTICATION, NOTIFICATIONS & SHIPMENT SCHEMA
-- Migration: 20260828_master_auth_notifications_shipments.sql
-- ==============================================================================

-- 1. STORE CUSTOMERS (Multi-Tenant Store Shoppers)
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

-- 2. CUSTOMER ADDRESSES
CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.store_customers(id) ON DELETE CASCADE,
  label VARCHAR(50) DEFAULT 'Home',
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  street_address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT DEFAULT 'Punjab',
  postal_code TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. CUSTOMER WISHLIST
CREATE TABLE IF NOT EXISTS public.customer_wishlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.store_customers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_customer_product_wishlist UNIQUE (customer_id, product_id)
);

-- 4. SHIPMENTS
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  courier_provider VARCHAR(50) DEFAULT 'tcs',
  courier_name VARCHAR(100) DEFAULT 'TCS Express Courier',
  tracking_number VARCHAR(100) NOT NULL,
  waybill_number VARCHAR(100),
  status VARCHAR(50) DEFAULT 'label_created',
  estimated_delivery TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SHIPMENT EVENTS (Checkpoints)
CREATE TABLE IF NOT EXISTS public.shipment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id UUID NOT NULL REFERENCES public.shipments(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL,
  location VARCHAR(150),
  description TEXT,
  event_time TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. NOTIFICATIONS (Central In-App & Audit)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  recipient_user_id UUID,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  recipient_type VARCHAR(20) DEFAULT 'vendor',
  event_type VARCHAR(80),
  title TEXT,
  message TEXT,
  data JSONB DEFAULT '{}'::jsonb,
  payload JSONB DEFAULT '{}'::jsonb,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Safely add columns if notifications table already existed in earlier schema
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS recipient_user_id UUID;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS recipient_type VARCHAR(20) DEFAULT 'vendor';
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS event_type VARCHAR(80);
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS data JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT false;

-- Sync recipient_user_id from user_id if null
UPDATE public.notifications SET recipient_user_id = user_id WHERE recipient_user_id IS NULL AND user_id IS NOT NULL;

-- 7. NOTIFICATION DELIVERIES (Multi-Channel Delivery Audit)
CREATE TABLE IF NOT EXISTS public.notification_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notification_id UUID NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  channel VARCHAR(30) NOT NULL CHECK (channel IN ('email', 'in_app', 'whatsapp')),
  status VARCHAR(30) NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'sending', 'sent', 'delivered', 'failed', 'skipped')),
  provider VARCHAR(50) DEFAULT 'resend',
  provider_message_id TEXT,
  attempt_count INT DEFAULT 1,
  last_error TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. NOTIFICATION PREFERENCES
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
  email_order_updates BOOLEAN DEFAULT true,
  email_shipping_updates BOOLEAN DEFAULT true,
  email_marketing BOOLEAN DEFAULT false,
  email_security BOOLEAN DEFAULT true,
  in_app_orders BOOLEAN DEFAULT true,
  in_app_shipping BOOLEAN DEFAULT true,
  in_app_marketing BOOLEAN DEFAULT true,
  whatsapp_order_updates BOOLEAN DEFAULT true,
  whatsapp_cod BOOLEAN DEFAULT true,
  whatsapp_marketing BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT unique_user_notification_prefs UNIQUE (user_id)
);

-- ==============================================================================
-- PERFORMANCE INDEXES (<50ms lookups)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_store_customers_auth ON public.store_customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_store_customers_store ON public.store_customers(store_id);
CREATE INDEX IF NOT EXISTS idx_shipments_order ON public.shipments(order_id);
CREATE INDEX IF NOT EXISTS idx_shipments_tracking ON public.shipments(tracking_number);
CREATE INDEX IF NOT EXISTS idx_shipment_events_shipment ON public.shipment_events(shipment_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_user_id, is_read, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_store ON public.notifications(store_id);
CREATE INDEX IF NOT EXISTS idx_notification_deliveries_notif ON public.notification_deliveries(notification_id, status);

-- ==============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ==============================================================================
ALTER TABLE public.store_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Customers can view/update their own profile
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'store_customers' AND policyname = 'Customers own profile') THEN
    CREATE POLICY "Customers own profile" ON public.store_customers FOR ALL USING (auth.uid() = auth_user_id);
  END IF;
END $$;

-- Customers can view their own addresses
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'customer_addresses' AND policyname = 'Customers own addresses') THEN
    CREATE POLICY "Customers own addresses" ON public.customer_addresses FOR ALL USING (customer_id IN (SELECT id FROM public.store_customers WHERE auth_user_id = auth.uid()));
  END IF;
END $$;

-- Notifications RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notifications' AND policyname = 'Users own notifications') THEN
    CREATE POLICY "Users own notifications" ON public.notifications FOR ALL USING (auth.uid() = recipient_user_id OR auth.uid() = user_id);
  END IF;
END $$;

-- Preferences RLS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notification_preferences' AND policyname = 'Users own preferences') THEN
    CREATE POLICY "Users own preferences" ON public.notification_preferences FOR ALL USING (auth.uid() = user_id);
  END IF;
END $$;
