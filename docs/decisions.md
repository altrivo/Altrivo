# Architecture Decision Records

## ADR-001: Supabase over custom backend
**Decision:** Use Supabase for Auth, DB, Realtime, and Storage.
**Rationale:** Reduces infra overhead; built-in RLS; realtime subscriptions for live features.

## ADR-002: Monorepo per side (admin / vendor)
**Decision:** Separate repos for admin and vendor rather than a single monorepo.
**Rationale:** Independent deploy cycles; smaller blast radius; cleaner CODEOWNERS.

## ADR-003: Tailwind + CSS Variables for theming
**Decision:** All design tokens as CSS variables consumed via Tailwind.
**Rationale:** Enables per-vendor theme injection at SSR without rebuilding CSS.
