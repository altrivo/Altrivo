-- Migration: Theme Tokens & AI Rebranding History Table
-- Date: 2026-08-10

CREATE TABLE IF NOT EXISTS public.theme_tokens (
    vendor_id UUID PRIMARY KEY,
    primary_color VARCHAR(20) NOT NULL DEFAULT '#694873',
    accent_color VARCHAR(20) NOT NULL DEFAULT '#F2DDE1',
    background_color VARCHAR(20) DEFAULT '#FFFFFF',
    text_color VARCHAR(20) DEFAULT '#111827',
    heading_font VARCHAR(100) DEFAULT 'Inter',
    body_font VARCHAR(100) DEFAULT 'Inter',
    border_radius VARCHAR(50) DEFAULT 'rounded-xl',
    spacing_density VARCHAR(50) DEFAULT 'comfortable',
    last_prompt TEXT,
    llm_cost_usd NUMERIC(10, 6) DEFAULT 0.001200,
    total_tokens_used INTEGER DEFAULT 300,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.theme_tokens ENABLE ROW LEVEL SECURITY;

-- Vendor RLS Policy
CREATE POLICY theme_tokens_vendor_select ON public.theme_tokens
    FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY theme_tokens_vendor_update ON public.theme_tokens
    FOR UPDATE USING (auth.uid() = vendor_id);

CREATE POLICY theme_tokens_vendor_insert ON public.theme_tokens
    FOR INSERT WITH CHECK (auth.uid() = vendor_id);
