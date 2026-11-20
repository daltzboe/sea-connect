-- SEAConnect: private event tickets and one-time officer check-in
-- Ticket codes are never exposed through direct table access. Only SECURITY DEFINER
-- RPCs can issue a member's ticket or redeem it as an officer.

create table if not exists public.event_tickets (
  event_id uuid not null,
  user_id uuid not null,
  ticket_code text not null unique default gen_random_uuid()::text,
  created_at timestamptz not null default now(),
  primary key (event_id, user_id),
  constraint event_tickets_rsvp_fk
    foreign key (event_id, user_id)
    references public.event_rsvps (event_id, user_id)
    on delete cascade
);

create table if not exists public.event_checkins (
  event_id uuid not null,
  user_id uuid not null,
  checked_in_by uuid not null references auth.users(id),
  checked_in_at timestamptz not null default now(),
  primary key (event_id, user_id),
  constraint event_checkins_ticket_fk
    foreign key (event_id, user_id)
    references public.event_tickets (event_id, user_id)
    on delete cascade
);

create index if not exists event_checkins_event_checked_at_idx
  on public.event_checkins (event_id, checked_in_at);

alter table public.event_tickets enable row level security;
alter table public.event_checkins enable row level security;

revoke all on public.event_tickets from anon, authenticated;
revoke all on public.event_checkins from anon, authenticated;
grant select on public.event_checkins to authenticated;

drop policy if exists "Officers can view event check-ins" on public.event_checkins;
create policy "Officers can view event check-ins"
  on public.event_checkins for select to authenticated
  using (
    exists (
      select 1 from public.profiles p
      where p.id = (select auth.uid()) and p.role = 'officer'
    )
  );

create or replace function public.issue_event_ticket(p_event_id uuid)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ticket_code text;
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  if not exists (
    select 1
    from public.event_rsvps r
    where r.event_id = p_event_id
      and r.user_id = v_user_id
      and r.status = 'going'
  ) then
    raise exception 'RSVP_REQUIRED';
  end if;

  insert into public.event_tickets (event_id, user_id)
  values (p_event_id, v_user_id)
  on conflict (event_id, user_id) do nothing;

  select t.ticket_code into v_ticket_code
  from public.event_tickets t
  where t.event_id = p_event_id and t.user_id = v_user_id;

  return v_ticket_code;
end;
$$;

create or replace function public.check_in_event_ticket(
  p_event_id uuid,
  p_ticket_code text
)
returns table (
  attendee_name text,
  event_title text,
  checked_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_attendee_name text;
  v_event_title text;
  v_checked_in_at timestamptz;
begin
  if auth.uid() is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  if not exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'officer'
  ) then
    raise exception 'FORBIDDEN';
  end if;

  select t.user_id, coalesce(nullif(trim(p.full_name), ''), 'SEA Member'), e.title
    into v_user_id, v_attendee_name, v_event_title
  from public.event_tickets t
  join public.events e on e.id = t.event_id
  join public.profiles p on p.id = t.user_id
  join public.event_rsvps r
    on r.event_id = t.event_id
   and r.user_id = t.user_id
   and r.status = 'going'
  where t.event_id = p_event_id
    and t.ticket_code = p_ticket_code;

  if v_user_id is null then
    raise exception 'INVALID_TICKET';
  end if;

  insert into public.event_checkins (event_id, user_id, checked_in_by)
  values (p_event_id, v_user_id, auth.uid())
  on conflict (event_id, user_id) do nothing
  returning event_checkins.checked_in_at into v_checked_in_at;

  if v_checked_in_at is null then
    raise exception 'ALREADY_CHECKED_IN';
  end if;

  return query
    select v_attendee_name, v_event_title, v_checked_in_at;
end;
$$;

revoke all on function public.issue_event_ticket(uuid) from public, anon;
revoke all on function public.check_in_event_ticket(uuid, text) from public, anon;
grant execute on function public.issue_event_ticket(uuid) to authenticated;
grant execute on function public.check_in_event_ticket(uuid, text) to authenticated;
