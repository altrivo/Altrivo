# Altrivo Admin — Architecture

## Overview
Next.js 15 App Router on Vercel. Shared Supabase instance with admin-specific RLS.

## Modules
| Module | Owner | Key Tables |
|--------|-------|------------|
| Design System & Vendor Mgmt | A1 | vendors, admin_users, audit_log |
| Escrow & Finance | A2 | escrow_ledger, disputes, payouts, subscriptions |
| Logistics & Domains | A3 | shipments, courier_partners, domains |
| Email, Security & AI Core | A4 | email_templates, ai_usage, cost_tracking |

## Auth
Supabase Auth with roles: SuperAdmin, OpsAdmin, FinanceAdmin, SupportAdmin.
