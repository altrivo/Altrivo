-- ==============================================================================
-- DIGISHOP AI: COMPLETE ORDER MANAGEMENT SYSTEM (A to Z) SCHEMA
-- Migration: 20260906_complete_order_management_system.sql
-- ==============================================================================

-- 1. ORDERS TABLE ENHANCEMENTS
-- Note: Alter table safely to preserve existing data while adding all required columns
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(50);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS tax_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS grand_total DECIMAL(12, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS order_status VARCHAR(50) NOT NULL DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fulfillment_status VARCHAR(50) NOT NULL DEFAULT 'unfulfilled';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS return_status VARCHAR(50) NOT NULL DEFAULT 'none';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS refund_status VARCHAR(50) NOT NULL DEFAULT 'none';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cod_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_region TEXT DEFAULT 'Punjab';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_country TEXT DEFAULT 'Pakistan';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_city TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_region TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_postal_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS billing_country TEXT DEFAULT 'Pakistan';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_id UUID;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code VARCHAR(50);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS customer_note TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS vendor_note TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS internal_note TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancelled_by VARCHAR(50);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS idempotency_key TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS fraud_status VARCHAR(30) DEFAULT 'normal';
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 2. ORDER ITEMS SNAPSHOT ENHANCEMENTS
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_name_snapshot TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS product_sku_snapshot TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS variant_snapshot TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS image_snapshot TEXT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS quantity INT;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(12, 2) DEFAULT 0.00;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(12, 2) DEFAULT 0.00;
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS line_total DECIMAL(12, 2);
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL;

-- 3. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID,
  provider VARCHAR(50) NOT NULL DEFAULT 'cod',
  payment_method VARCHAR(50) NOT NULL,
  provider_payment_id TEXT,
  transaction_id TEXT,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'PKR',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  failure_code TEXT,
  failure_message TEXT,
  paid_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. PAYMENT TRANSACTIONS TABLE (Multiple attempts & audit)
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID NOT NULL REFERENCES public.payments(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  attempt_number INT DEFAULT 1,
  provider VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  response_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. ORDER EVENTS (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  event_type VARCHAR(80) NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  actor_type VARCHAR(30) NOT NULL, -- 'system', 'customer', 'vendor', 'courier'
  actor_id TEXT,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. STOCK RESERVATIONS
CREATE TABLE IF NOT EXISTS public.stock_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID,
  quantity INT NOT NULL,
  status VARCHAR(30) DEFAULT 'reserved', -- 'reserved', 'committed', 'released'
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. RETURNS
CREATE TABLE IF NOT EXISTS public.returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID,
  status VARCHAR(50) NOT NULL DEFAULT 'requested', -- requested, approved, rejected, pickup_scheduled, received, inspected, approved_for_refund, completed
  reason VARCHAR(100) NOT NULL,
  description TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  restock_decision VARCHAR(50), -- restock, damaged_writeoff
  requested_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  received_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. REFUNDS
CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  customer_id UUID,
  amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'PKR',
  reason TEXT NOT NULL,
  refund_type VARCHAR(50) DEFAULT 'full', -- full, partial, item, shipping
  status VARCHAR(50) NOT NULL DEFAULT 'completed', -- pending, processing, completed, failed
  provider VARCHAR(50) DEFAULT 'cod',
  provider_refund_id TEXT,
  requested_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  failed_at TIMESTAMPTZ
);

-- 9. COMPLAINTS (CUSTOMER SUPPORT TICKETS)
CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  customer_id UUID,
  subject TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open', -- open, in_review, waiting_customer, resolved, rejected, closed
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. COMPLAINT MESSAGES
CREATE TABLE IF NOT EXISTS public.complaint_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES public.complaints(id) ON DELETE CASCADE,
  sender_type VARCHAR(20) NOT NULL, -- customer, vendor, admin
  sender_id TEXT NOT NULL,
  sender_name TEXT NOT NULL,
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- INDEXES FOR ULTRA-FAST LOOKUPS (<50ms)
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_store_id ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS idx_orders_vendor_id ON public.orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON public.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_idempotency ON public.orders(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(order_status, delivery_status, payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_order ON public.payments(order_id);
CREATE INDEX IF NOT EXISTS idx_order_events_order ON public.order_events(order_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_returns_order ON public.returns(order_id);
CREATE INDEX IF NOT EXISTS idx_refunds_order ON public.refunds(order_id);
CREATE INDEX IF NOT EXISTS idx_complaints_order ON public.complaints(order_id);

-- ==============================================================================
-- STRICT ROW LEVEL SECURITY POLICIES (MULTI-TENANT ISOLATION)
-- ==============================================================================
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaint_messages ENABLE ROW LEVEL SECURITY;

-- 1. Vendors can only read/manage orders belonging to their own stores
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Vendor store order access') THEN
    CREATE POLICY "Vendor store order access" ON public.orders
      FOR ALL USING (
        vendor_id = auth.uid()
        OR store_id IN (SELECT id FROM public.stores WHERE vendor_id = auth.uid())
      );
  END IF;
END $$;

-- 2. Customers can only view their own orders in that specific store
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'orders' AND policyname = 'Customer own order access') THEN
    CREATE POLICY "Customer own order access" ON public.orders
      FOR SELECT USING (
        customer_id IN (SELECT id FROM public.store_customers WHERE auth_user_id = auth.uid())
      );
  END IF;
END $$;

-- 3. Order Items RLS (through order ownership)
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'order_items' AND policyname = 'Order items access') THEN
    CREATE POLICY "Order items access" ON public.order_items
      FOR ALL USING (
        order_id IN (
          SELECT id FROM public.orders 
          WHERE vendor_id = auth.uid() 
          OR store_id IN (SELECT id FROM public.stores WHERE vendor_id = auth.uid())
          OR customer_id IN (SELECT id FROM public.store_customers WHERE auth_user_id = auth.uid())
        )
      );
  END IF;
END $$;
