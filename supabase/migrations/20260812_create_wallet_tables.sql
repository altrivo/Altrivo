-- Design wallets, ledger, and VCC cards tables

CREATE TABLE IF NOT EXISTS wallets (
  vendor_id UUID PRIMARY KEY,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  currency VARCHAR(10) NOT NULL DEFAULT 'PKR'
);

CREATE TABLE IF NOT EXISTS wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES wallets(vendor_id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- 'top-up' | 'charge' | 'refund' | 'vcc_funding'
  amount DECIMAL(12, 2) NOT NULL,
  balance_after DECIMAL(12, 2) NOT NULL,
  ref_id VARCHAR(100), -- order_id or VCC id reference
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS vcc_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES wallets(vendor_id) ON DELETE CASCADE,
  bank_ref VARCHAR(100) NOT NULL,
  masked_pan VARCHAR(20) NOT NULL,
  balance DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'frozen' | 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS and standard policies
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vcc_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can view their own wallets" ON wallets FOR SELECT USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can view their ledger" ON wallet_transactions FOR SELECT USING (auth.uid() = vendor_id);
CREATE POLICY "Vendors can view their VCCs" ON vcc_cards FOR SELECT USING (auth.uid() = vendor_id);
