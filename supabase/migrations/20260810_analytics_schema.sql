-- Migration: Analytics Backend Data Model + Aggregation Materialized Views
-- Date: 2026-08-10

-- 1. Create page_views table
CREATE TABLE IF NOT EXISTS public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vendor_id UUID NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    page VARCHAR(255) NOT NULL,
    city VARCHAR(100) DEFAULT 'Unknown',
    country VARCHAR(100) DEFAULT 'Pakistan',
    device VARCHAR(50) DEFAULT 'desktop', -- desktop, mobile, tablet
    referrer VARCHAR(255) DEFAULT 'direct',
    timestamp TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Create sessions table
CREATE TABLE IF NOT EXISTS public.sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    vendor_id UUID NOT NULL,
    customer_id UUID,
    started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0
);

-- 3. Targeted B-tree Indexes for sub-200ms query performance on 100k+ rows
CREATE INDEX IF NOT EXISTS idx_page_views_vendor_timestamp ON public.page_views (vendor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_vendor_city ON public.page_views (vendor_id, city);
CREATE INDEX IF NOT EXISTS idx_page_views_vendor_referrer ON public.page_views (vendor_id, referrer);
CREATE INDEX IF NOT EXISTS idx_sessions_vendor_started ON public.sessions (vendor_id, started_at DESC);

-- 4. Enable Row Level Security (RLS) on tables
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS Policies for Vendor Isolation
CREATE POLICY page_views_vendor_select_policy ON public.page_views
    FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY page_views_vendor_insert_policy ON public.page_views
    FOR INSERT WITH CHECK (auth.uid() = vendor_id);

CREATE POLICY sessions_vendor_select_policy ON public.sessions
    FOR SELECT USING (auth.uid() = vendor_id);

CREATE POLICY sessions_vendor_insert_policy ON public.sessions
    FOR INSERT WITH CHECK (auth.uid() = vendor_id);

-- 6. Materialized View 1: daily_summary_mv
CREATE MATERIALIZED VIEW IF NOT EXISTS public.daily_summary_mv AS
SELECT
    vendor_id,
    DATE_TRUNC('day', timestamp) AS date,
    COUNT(id) AS total_page_views,
    COUNT(DISTINCT session_id) AS total_sessions,
    COUNT(DISTINCT referrer) AS unique_referrers
FROM public.page_views
GROUP BY vendor_id, DATE_TRUNC('day', timestamp);

-- Unique index required for CONCURRENTLY refreshing daily_summary_mv
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_summary_mv_pk ON public.daily_summary_mv (vendor_id, date);

-- 7. Materialized View 2: geo_heatmap_mv
CREATE MATERIALIZED VIEW IF NOT EXISTS public.geo_heatmap_mv AS
SELECT
    vendor_id,
    country,
    city,
    COUNT(id) AS page_views_count,
    COUNT(DISTINCT session_id) AS unique_visitors
FROM public.page_views
GROUP BY vendor_id, country, city;

-- Unique index required for CONCURRENTLY refreshing geo_heatmap_mv
CREATE UNIQUE INDEX IF NOT EXISTS idx_geo_heatmap_mv_pk ON public.geo_heatmap_mv (vendor_id, country, city);

-- 8. Materialized View 3: source_attribution_mv
CREATE MATERIALIZED VIEW IF NOT EXISTS public.source_attribution_mv AS
SELECT
    vendor_id,
    referrer,
    COUNT(id) AS total_views,
    COUNT(DISTINCT session_id) AS total_sessions
FROM public.page_views
GROUP BY vendor_id, referrer;

-- Unique index required for CONCURRENTLY refreshing source_attribution_mv
CREATE UNIQUE INDEX IF NOT EXISTS idx_source_attribution_mv_pk ON public.source_attribution_mv (vendor_id, referrer);

-- 9. Function to refresh all materialized views concurrently (runs every 5 minutes)
CREATE OR REPLACE FUNCTION refresh_analytics_materialized_views()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.daily_summary_mv;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.geo_heatmap_mv;
    REFRESH MATERIALIZED VIEW CONCURRENTLY public.source_attribution_mv;
END;
$$;
