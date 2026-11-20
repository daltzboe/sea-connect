-- Restrict profile directory visibility and push subscription access.
drop policy if exists "Authenticated users can view member profiles" on public.profiles;
drop policy if exists "officers can update profiles" on public.profiles;
drop policy if exists "profiles_update" on public.profiles;

create policy "Users view profiles within their campus"
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or private.is_platform_admin()
  or private.shares_school_with(id)
);

create policy "Campus officers update profiles in their campus"
on public.profiles for update to authenticated
using (
  private.is_platform_admin()
  or exists (
    select 1
    from public.school_memberships officer_membership
    join public.school_memberships target_membership
      on target_membership.school_id = officer_membership.school_id
     and target_membership.user_id = profiles.id
     and target_membership.status = 'active'
    where officer_membership.user_id = (select auth.uid())
      and officer_membership.status = 'active'
      and officer_membership.role = 'officer'
      and profiles.primary_school_id = officer_membership.school_id
  )
)
with check (
  private.is_platform_admin()
  or exists (
    select 1
    from public.school_memberships officer_membership
    join public.school_memberships target_membership
      on target_membership.school_id = officer_membership.school_id
     and target_membership.user_id = profiles.id
     and target_membership.status = 'active'
    where officer_membership.user_id = (select auth.uid())
      and officer_membership.status = 'active'
      and officer_membership.role = 'officer'
      and profiles.primary_school_id = officer_membership.school_id
  )
);

drop policy if exists "Authenticated users can view push subscriptions" on public.push_subscriptions;
drop policy if exists "Authenticated users can insert push subscriptions" on public.push_subscriptions;
drop policy if exists "Authenticated users can delete push subscriptions" on public.push_subscriptions;
