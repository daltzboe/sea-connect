-- Add campus ownership to top-level community records and enforce campus-aware RLS.
-- Existing content is preserved and assigned to UTSA during the initial rollout.

create or replace function private.is_school_member(p_school_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.school_memberships sm
    where sm.school_id = p_school_id
      and sm.user_id = (select auth.uid())
      and sm.status = 'active'
  );
$$;
revoke all on function private.is_school_member(uuid) from public, anon;
grant execute on function private.is_school_member(uuid) to authenticated;

create or replace function private.assign_primary_school_id()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.school_id is null then
    select p.primary_school_id into new.school_id
    from public.profiles p
    where p.id = (select auth.uid());
  end if;
  if new.school_id is null then
    raise exception 'A campus must be selected before creating this record';
  end if;
  return new;
end;
$$;

alter table public.events add column if not exists school_id uuid references public.schools(id);
alter table public.announcements add column if not exists school_id uuid references public.schools(id);
alter table public.meetings add column if not exists school_id uuid references public.schools(id);
alter table public.conversations add column if not exists school_id uuid references public.schools(id);
alter table public.members add column if not exists school_id uuid references public.schools(id);

update public.events set school_id = (select id from public.schools where slug='utsa') where school_id is null;
update public.announcements set school_id = (select id from public.schools where slug='utsa') where school_id is null;
update public.meetings set school_id = (select id from public.schools where slug='utsa') where school_id is null;
update public.conversations set school_id = (select id from public.schools where slug='utsa') where school_id is null;
update public.members set school_id = (select id from public.schools where slug='utsa') where school_id is null;

alter table public.events alter column school_id set not null;
alter table public.announcements alter column school_id set not null;
alter table public.meetings alter column school_id set not null;
alter table public.conversations alter column school_id set not null;
alter table public.members alter column school_id set not null;

create index if not exists events_school_id_idx on public.events(school_id);
create index if not exists announcements_school_id_idx on public.announcements(school_id);
create index if not exists meetings_school_id_idx on public.meetings(school_id);
create index if not exists conversations_school_id_idx on public.conversations(school_id);
create index if not exists members_school_id_idx on public.members(school_id);

drop trigger if exists events_assign_school on public.events;
create trigger events_assign_school before insert on public.events
for each row execute function private.assign_primary_school_id();
drop trigger if exists announcements_assign_school on public.announcements;
create trigger announcements_assign_school before insert on public.announcements
for each row execute function private.assign_primary_school_id();
drop trigger if exists meetings_assign_school on public.meetings;
create trigger meetings_assign_school before insert on public.meetings
for each row execute function private.assign_primary_school_id();
drop trigger if exists conversations_assign_school on public.conversations;
create trigger conversations_assign_school before insert on public.conversations
for each row execute function private.assign_primary_school_id();
drop trigger if exists members_assign_school on public.members;
create trigger members_assign_school before insert on public.members
for each row execute function private.assign_primary_school_id();

do $$
declare r record;
begin
  for r in select schemaname, tablename, policyname
    from pg_policies
    where schemaname='public'
      and tablename in ('events','announcements','meetings','members','conversations')
  loop
    execute format('drop policy %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

create policy "Campus members and platform admins view events" on public.events
for select to authenticated
using (private.is_platform_admin() or private.is_school_member(school_id));
create policy "Campus officers and platform admins create events" on public.events
for insert to authenticated
with check (private.is_platform_admin() or private.is_school_officer(school_id));
create policy "Campus officers and platform admins update events" on public.events
for update to authenticated
using (private.is_platform_admin() or private.is_school_officer(school_id))
with check (private.is_platform_admin() or private.is_school_officer(school_id));
create policy "Campus officers and platform admins delete events" on public.events
for delete to authenticated
using (private.is_platform_admin() or private.is_school_officer(school_id));

create policy "Campus members and platform admins view announcements" on public.announcements
for select to authenticated
using (private.is_platform_admin() or private.is_school_member(school_id));
create policy "Campus officers and platform admins create announcements" on public.announcements
for insert to authenticated
with check (private.is_platform_admin() or private.is_school_officer(school_id));
create policy "Campus officers and platform admins update announcements" on public.announcements
for update to authenticated
using (private.is_platform_admin() or private.is_school_officer(school_id))
with check (private.is_platform_admin() or private.is_school_officer(school_id));
create policy "Campus officers and platform admins delete announcements" on public.announcements
for delete to authenticated
using (private.is_platform_admin() or private.is_school_officer(school_id));

create policy "Campus members and platform admins view meetings" on public.meetings
for select to authenticated
using (private.is_platform_admin() or private.is_school_member(school_id));
create policy "Campus officers and platform admins create meetings" on public.meetings
for insert to authenticated
with check (private.is_platform_admin() or private.is_school_officer(school_id));
create policy "Campus officers and platform admins update meetings" on public.meetings
for update to authenticated
using (private.is_platform_admin() or private.is_school_officer(school_id))
with check (private.is_platform_admin() or private.is_school_officer(school_id));
create policy "Campus officers and platform admins delete meetings" on public.meetings
for delete to authenticated
using (private.is_platform_admin() or private.is_school_officer(school_id));

create policy "Campus members and platform admins view member directory" on public.members
for select to authenticated
using (private.is_platform_admin() or private.is_school_member(school_id));
create policy "Campus officers and platform admins create members" on public.members
for insert to authenticated
with check (private.is_platform_admin() or private.is_school_officer(school_id));
create policy "Campus officers and platform admins update members" on public.members
for update to authenticated
using (private.is_platform_admin() or private.is_school_officer(school_id))
with check (private.is_platform_admin() or private.is_school_officer(school_id));
create policy "Campus officers and platform admins delete members" on public.members
for delete to authenticated
using (private.is_platform_admin() or private.is_school_officer(school_id));

create policy "Campus participants and platform admins view conversations" on public.conversations
for select to authenticated
using (
  private.is_platform_admin()
  or (
    private.is_school_member(school_id)
    and (
      created_by = (select auth.uid())
      or is_conversation_member(id, (select auth.uid()))
    )
  )
);
create policy "Campus members create conversations" on public.conversations
for insert to authenticated
with check (
  created_by = (select auth.uid())
  and private.is_school_member(school_id)
);
