# Admin Database Schema
See supabase/migrations/ for full schema. Key admin tables: admin_users, audit_log, escrow_ledger, disputes, payouts, tickets, ticket_messages, cost_tracking, vendors.

## vendors
1:1 with `auth.users` (id is the same UUID). RLS restricts `authenticated` to
its own row for select/update; status/id/created_at are locked against
vendor self-edits via trigger, so approving a vendor (`status`) requires the
service role. See `supabase/migrations/20260810120000_create_vendors_table.sql`.
