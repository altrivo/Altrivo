-- Design orders & order_items tables

CREATE TYPE order_delivery_status AS ENUM ('pending', 'paid', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded');
CREATE TYPE order_payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE order_escrow_status AS ENUM ('held_in_escrow', 'released_to_vendor', 'refunded_a2_escrow');

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL,
  customer_id UUID,
  total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'PKR',
  payment_method VARCHAR(50) NOT NULL,
  payment_status order_payment_status NOT NULL DEFAULT 'pending',
  delivery_status order_delivery_status NOT NULL DEFAULT 'pending',
  escrow_status order_escrow_status NOT NULL DEFAULT 'held_in_escrow',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID NOT NULL,
  variant_id UUID,
  qty INT NOT NULL CHECK (qty > 0),
  unit_price DECIMAL(12, 2) NOT NULL
);

-- Enable RLS and standard policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own orders" ON orders
  FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own orders" ON orders
  FOR UPDATE USING (auth.uid() = vendor_id);
