-- Vendors table
-- id is 1:1 with auth.users(id): a vendor row is created for the Supabase
-- Auth user that signs up (email/password), which is what makes the RLS
-- "own row" policies below a simple auth.uid() = id check. `phone` is kept
-- as an optional contact field, not an auth identifier.
create table if not exists public.vendors (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  business_name text not null,
  phone text unique,
  email text unique,
  category text,
  region text,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'suspended', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- email/phone already have unique indexes from the constraints above.
create index if not exists vendors_status_idx on public.vendors (status);
create index if not exists vendors_category_idx on public.vendors (category);
create index if not exists vendors_region_idx on public.vendors (region);
create index if not exists vendors_created_at_idx on public.vendors (created_at desc);

-- Keep updated_at current on every row change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists vendors_set_updated_at on public.vendors;
create trigger vendors_set_updated_at
  before update on public.vendors
  for each row
  execute function public.set_updated_at();

-- Vendors can edit their own profile fields but not self-approve or
-- reassign their row: id/status/created_at are pinned back to their
-- existing values whenever the actor isn't the service role.
create or replace function public.protect_vendor_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.role() = 'authenticated' then
    new.id = old.id;
    new.status = old.status;
    new.created_at = old.created_at;
  end if;
  return new;
end;
$$;

drop trigger if exists vendors_protect_admin_fields on public.vendors;
create trigger vendors_protect_admin_fields
  before update on public.vendors
  for each row
  execute function public.protect_vendor_admin_fields();

-- RLS: a vendor may only read/update the row matching their own auth uid.
-- No insert/delete policy for `authenticated` — rows are created by the
-- service role (e.g. in an API route or an auth.users signup trigger) so
-- that unverified accounts can't self-provision a vendor profile.
alter table public.vendors enable row level security;

create policy "Vendors can view own row"
  on public.vendors
  for select
  to authenticated
  using (auth.uid() = id);

create policy "Vendors can update own row"
  on public.vendors
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);
