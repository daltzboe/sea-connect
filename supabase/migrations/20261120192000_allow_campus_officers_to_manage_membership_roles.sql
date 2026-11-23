-- Let a campus officer manage another active member's role within that same campus.
-- Officers cannot change their own membership role through this policy.
create policy "Campus officers update other campus membership roles"
on public.school_memberships
for update
to authenticated
using (
  private.is_school_officer(school_id)
  and user_id <> (select auth.uid())
)
with check (
  private.is_school_officer(school_id)
  and user_id <> (select auth.uid())
);
