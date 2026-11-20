-- Promote the SEAConnect founder to global platform administration and
-- activate school memberships immediately when a user selects a listed school.

begin;

create table if not exists public.platform_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);
alter table public.platform_admins enable row level security;
revoke all on public.platform_admins from anon, authenticated;
grant select on public.platform_admins to authenticated;
drop policy if exists "Platform admins can view their own admin record" on public.platform_admins;
create policy "Platform admins can view their own admin record"
on public.platform_admins for select to authenticated
using (user_id = (select auth.uid()));

insert into public.platform_admins (user_id,email)
select id, lower(email)
from auth.users
where lower(email) = 'daltonjohncharles@gmail.com'
  and email_confirmed_at is not null
on conflict (user_id) do update set email=excluded.email;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins pa
    where pa.user_id = (select auth.uid())
  );
$$;
revoke all on function private.is_platform_admin() from public, anon, authenticated;
grant execute on function private.is_platform_admin() to authenticated;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $
  select private.is_platform_admin();
$$;
revoke all on function public.is_platform_admin() from public, anon;
grant execute on function public.is_platform_admin() to authenticated;

drop policy if exists "Listed schools are visible" on public.schools;
create policy "Listed schools are visible"
on public.schools for select to anon, authenticated
using (is_listed = true);

drop policy if exists "Platform admins can manage schools" on public.schools;
create policy "Platform admins can manage schools"
on public.schools for all to authenticated
using (private.is_platform_admin())
with check (private.is_platform_admin());
grant select on public.schools to anon, authenticated;
grant insert, update, delete on public.schools to authenticated;

drop policy if exists "Platform admins can view all school memberships" on public.school_memberships;
create policy "Platform admins can view all school memberships"
on public.school_memberships for select to authenticated
using (private.is_platform_admin());

drop policy if exists "School officers can review pending memberships" on public.school_memberships;
drop policy if exists "Platform admins can manage school memberships" on public.school_memberships;
create policy "Platform admins can manage school memberships"
on public.school_memberships for all to authenticated
using (private.is_platform_admin())
with check (private.is_platform_admin());
grant select, insert, update, delete on public.school_memberships to authenticated;

drop trigger if exists guard_school_membership_review on public.school_memberships;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_school_id uuid;
begin
  insert into public.profiles (id,full_name,role,position,country,primary_school_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name','SEA Member'),
    'member',
    'SEA Member',
    coalesce(new.raw_user_meta_data->>'country','Not provided'),
    null
  );

  if nullif(new.raw_user_meta_data->>'school_id','') is not null then
    begin
      v_school_id := (new.raw_user_meta_data->>'school_id')::uuid;
    exception when invalid_text_representation then
      raise exception 'INVALID_SCHOOL_SELECTION';
    end;

    if not exists (
      select 1 from public.schools s
      where s.id = v_school_id and s.is_listed = true
    ) then
      raise exception 'INVALID_SCHOOL_SELECTION';
    end if;

    update public.profiles
    set primary_school_id = v_school_id
    where id = new.id;

    insert into public.school_memberships (school_id,user_id,status,role)
    values (v_school_id,new.id,'active','member')
    on conflict (school_id,user_id) do update
      set status='active', role='member';
  end if;

  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

commit;
