create or replace function private.shares_school_with(p_target_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.school_memberships target_membership
    join public.school_memberships viewer_membership
      on viewer_membership.school_id = target_membership.school_id
    where target_membership.user_id = p_target_user_id
      and target_membership.status = 'active'
      and viewer_membership.user_id = (select auth.uid())
      and viewer_membership.status = 'active'
  );
$$;
revoke all on function private.shares_school_with(uuid) from public, anon;
grant execute on function private.shares_school_with(uuid) to authenticated;

drop policy if exists "Users view profiles within their campus" on public.profiles;
create policy "Users view profiles within their campus"
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or private.is_platform_admin()
  or private.shares_school_with(id)
);
