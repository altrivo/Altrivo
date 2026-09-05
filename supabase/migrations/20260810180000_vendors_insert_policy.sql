-- Lets a newly-verified user create their own vendor row post-signup.
-- status is pinned to 'pending' in the check so they can't insert
-- themselves as already 'active'; only the service role can approve.
create policy "Vendors can insert own row"
  on public.vendors
  for insert
  to authenticated
  with check (auth.uid() = id and status = 'pending');
