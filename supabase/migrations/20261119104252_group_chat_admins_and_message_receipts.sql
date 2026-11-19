create schema if not exists private;

alter table public.conversation_members
  add column if not exists role text not null default 'member';

alter table public.conversation_members
  drop constraint if exists conversation_members_role_check;
alter table public.conversation_members
  add constraint conversation_members_role_check
  check (role in ('admin', 'member'));

update public.conversation_members cm
set role = 'admin'
from public.conversations c
where c.id = cm.conversation_id
  and c.created_by = cm.user_id
  and cm.role <> 'admin';

create or replace function private.is_conversation_admin(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.conversation_members cm
    join public.conversations c on c.id = cm.conversation_id
    where cm.conversation_id = p_conversation_id
      and cm.user_id = (select auth.uid())
      and cm.role = 'admin'
      and c.is_group = true
  )
  or exists (
    select 1 from public.conversations c
    where c.id = p_conversation_id
      and c.created_by = (select auth.uid())
      and c.is_group = true
  );
$$;

grant usage on schema private to authenticated;
revoke all on function private.is_conversation_admin(uuid) from public, anon;
grant execute on function private.is_conversation_admin(uuid) to authenticated;

create or replace function private.set_conversation_creator_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.conversations c
    where c.id = new.conversation_id and c.created_by = new.user_id
  ) then
    new.role := 'admin';
  end if;
  return new;
end;
$$;

drop trigger if exists set_conversation_creator_admin on public.conversation_members;
create trigger set_conversation_creator_admin
before insert on public.conversation_members
for each row execute function private.set_conversation_creator_admin();

create or replace function private.keep_group_admin_on_departure()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_group boolean;
begin
  if old.role <> 'admin' then return old; end if;
  select c.is_group into v_is_group from public.conversations c where c.id = old.conversation_id;
  if coalesce(v_is_group, false)
     and not exists (select 1 from public.conversation_members cm where cm.conversation_id = old.conversation_id and cm.role = 'admin') then
    update public.conversation_members cm
    set role = 'admin'
    where cm.conversation_id = old.conversation_id
      and cm.user_id = (
        select candidate.user_id from public.conversation_members candidate
        where candidate.conversation_id = old.conversation_id
        order by candidate.joined_at asc, candidate.user_id asc limit 1
      );
  end if;
  return old;
end;
$$;

drop trigger if exists keep_group_admin_on_departure on public.conversation_members;
create trigger keep_group_admin_on_departure
after delete on public.conversation_members
for each row execute function private.keep_group_admin_on_departure();

drop policy if exists "Creators can add conversation participants" on public.conversation_members;
drop policy if exists "Group admins can add conversation participants" on public.conversation_members;
create policy "Group admins can add conversation participants"
on public.conversation_members for insert to authenticated
with check (
  public.is_conversation_creator(conversation_id, (select auth.uid()))
  or private.is_conversation_admin(conversation_id)
);

drop policy if exists "Group admins can update member roles" on public.conversation_members;
create policy "Group admins can update member roles"
on public.conversation_members for update to authenticated
using (private.is_conversation_admin(conversation_id))
with check (
  private.is_conversation_admin(conversation_id)
  and role in ('admin', 'member')
);

drop policy if exists "Members can leave and admins can remove members" on public.conversation_members;
create policy "Members can leave and admins can remove members"
on public.conversation_members for delete to authenticated
using (
  user_id = (select auth.uid())
  or private.is_conversation_admin(conversation_id)
);

create table if not exists public.message_receipts (
  message_id uuid not null references public.messages(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  delivered_at timestamptz,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);
alter table public.message_receipts enable row level security;
revoke all on public.message_receipts from anon;
grant select, update on public.message_receipts to authenticated;

drop policy if exists "Conversation members can view message receipts" on public.message_receipts;
create policy "Conversation members can view message receipts"
on public.message_receipts for select to authenticated
using (
  exists (
    select 1 from public.messages m
    where m.id = message_id
      and public.is_conversation_member(m.conversation_id, (select auth.uid()))
  )
);

drop policy if exists "Recipients can update their own message receipts" on public.message_receipts;
create policy "Recipients can update their own message receipts"
on public.message_receipts for update to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.messages m
    where m.id = message_id
      and public.is_conversation_member(m.conversation_id, (select auth.uid()))
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.messages m
    where m.id = message_id
      and public.is_conversation_member(m.conversation_id, (select auth.uid()))
  )
);

create or replace function private.create_message_receipts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.message_receipts (message_id, user_id)
  select new.id, cm.user_id
  from public.conversation_members cm
  where cm.conversation_id = new.conversation_id
    and cm.user_id <> new.sender_id
  on conflict (message_id, user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_message_receipts_after_insert on public.messages;
create trigger create_message_receipts_after_insert
after insert on public.messages
for each row execute function private.create_message_receipts();

revoke all on function private.set_conversation_creator_admin() from public, anon, authenticated;
revoke all on function private.keep_group_admin_on_departure() from public, anon, authenticated;
revoke all on function private.create_message_receipts() from public, anon, authenticated;

insert into public.message_receipts (message_id, user_id)
select m.id, cm.user_id
from public.messages m
join public.conversation_members cm
  on cm.conversation_id = m.conversation_id
 and cm.user_id <> m.sender_id
on conflict (message_id, user_id) do nothing;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'public'
         and tablename = 'message_receipts'
     ) then
    alter publication supabase_realtime add table public.message_receipts;
  end if;
end $$;
