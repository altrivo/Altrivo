-- Design carts table

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID, -- NULL for guests (handled via cookie but structure permits DB sync)
  vendor_id UUID NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and standard policies
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view their own carts" ON carts
  FOR SELECT USING (auth.uid() = customer_id);

CREATE POLICY "Customers can update their own carts" ON carts
  FOR ALL USING (auth.uid() = customer_id);
