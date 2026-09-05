-- Migration: Postgres Full-Text Search + Trigram Similarity (pg_trgm)
-- Date: 2026-08-10

-- Enable pg_trgm extension for trigram similarity fuzzy typo tolerance
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add search_vector tsvector column on products table
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS search_vector tsvector
GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(category, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(tags, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C')
) STORED;

-- Add GIN Index on search_vector for fast tsvector full-text queries (<200ms)
CREATE INDEX IF NOT EXISTS idx_products_search_vector ON public.products USING GIN(search_vector);

-- Add GIN Trigram Index on name for typo tolerance
CREATE INDEX IF NOT EXISTS idx_products_name_trgm ON public.products USING GIN(name gin_trgm_ops);

-- Add Index on vendor_id and sales_count for domain scoping and sales ranking
CREATE INDEX IF NOT EXISTS idx_products_vendor_sales ON public.products(vendor_id, sales_count DESC);

-- Stored Procedure: Full-text + Trigram search with relevance & sales ranking
CREATE OR REPLACE FUNCTION search_vendor_products(
    p_vendor_id UUID,
    p_query TEXT,
    p_limit INT DEFAULT 20,
    p_offset INT DEFAULT 0
)
RETURNS TABLE (
    id UUID,
    name VARCHAR,
    description TEXT,
    price NUMERIC,
    category VARCHAR,
    image_url TEXT,
    sales_count INT,
    relevance_score FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.description,
        p.price,
        p.category,
        p.image_url,
        p.sales_count,
        (
            ts_rank_cd(p.search_vector, websearch_to_tsquery('english', p_query)) * 2.0 +
            similarity(p.name, p_query) * 1.5 +
            log(coalesce(p.sales_count, 0) + 1) * 0.1
        )::FLOAT AS relevance_score
    FROM public.products p
    WHERE p.vendor_id = p_vendor_id
      AND (
          p.search_vector @@ websearch_to_tsquery('english', p_query)
          OR similarity(p.name, p_query) > 0.2
      )
    ORDER BY relevance_score DESC, p.sales_count DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;
