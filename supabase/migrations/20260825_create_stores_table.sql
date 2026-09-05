-- Create stores table
CREATE TABLE IF NOT EXISTS public.stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    niche TEXT DEFAULT 'general',
    description TEXT,
    logo_url TEXT,
    layout_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    seo_config JSONB DEFAULT '{}'::jsonb,
    commerce_config JSONB DEFAULT '{}'::jsonb,
    is_published BOOLEAN DEFAULT FALSE,
    is_generating BOOLEAN DEFAULT FALSE,
    custom_domain TEXT,
    subdomain TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create store_versions table
CREATE TABLE IF NOT EXISTS public.store_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL DEFAULT 1,
    layout_snapshot JSONB NOT NULL,
    operation_type TEXT NOT NULL,
    operation_summary TEXT,
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Create ai_operations table
CREATE TABLE IF NOT EXISTS public.ai_operations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    vendor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    operation_type TEXT NOT NULL,
    user_prompt TEXT,
    ai_response JSONB,
    patch_applied JSONB,
    tokens_used INTEGER,
    cost_usd NUMERIC(8,6),
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_operations ENABLE ROW LEVEL SECURITY;

-- Stores policies
CREATE POLICY "Vendors can view their own stores"
    ON public.stores FOR SELECT
    USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert their own stores"
    ON public.stores FOR INSERT
    WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY "Vendors can update their own stores"
    ON public.stores FOR UPDATE
    USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can delete their own stores"
    ON public.stores FOR DELETE
    USING (auth.uid() = vendor_id);

-- Store versions policies
CREATE POLICY "Vendors can view their store versions"
    ON public.store_versions FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = store_versions.store_id
        AND stores.vendor_id = auth.uid()
    ));

CREATE POLICY "Vendors can insert their store versions"
    ON public.store_versions FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM public.stores
        WHERE stores.id = store_versions.store_id
        AND stores.vendor_id = auth.uid()
    ));

-- AI operations policies
CREATE POLICY "Vendors can view their AI operations"
    ON public.ai_operations FOR SELECT
    USING (auth.uid() = vendor_id);

CREATE POLICY "Vendors can insert their AI operations"
    ON public.ai_operations FOR INSERT
    WITH CHECK (auth.uid() = vendor_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_stores_vendor_id ON public.stores(vendor_id);
CREATE INDEX IF NOT EXISTS idx_stores_slug ON public.stores(slug);
CREATE INDEX IF NOT EXISTS idx_stores_subdomain ON public.stores(subdomain);
CREATE INDEX IF NOT EXISTS idx_store_versions_store_number ON public.store_versions(store_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_ai_operations_store_id ON public.ai_operations(store_id);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_stores_updated_at
    BEFORE UPDATE ON public.stores
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
