-- Restrict event attendance data and notification fan-out to the owning campus.

create or replace function public.create_seaconnect_notifications()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  notification_title text;
  notification_message text;
  notification_type text;
  notification_link text;
begin
  if tg_table_name = 'events' then
    notification_title := 'New Event';
    notification_message := coalesce(new.title, 'A new SEA event has been posted.');
    notification_type := 'event';
    notification_link := '/events/' || new.id;
  elsif tg_table_name = 'meetings' then
    notification_title := 'New Meeting';
    notification_message := coalesce(new.title, 'A new SEA meeting has been posted.');
    notification_type := 'meeting';
    notification_link := '/meetings/' || new.id;
  elsif tg_table_name = 'announcements' then
    notification_title := 'New Announcement';
    notification_message := coalesce(new.title, 'A new SEA announcement has been posted.');
    notification_type := 'announcement';
    notification_link := '/announcements/' || new.id;
  else
    return new;
  end if;

  insert into public.notifications (user_id,title,message,type,link,is_read)
  select sm.user_id, notification_title, notification_message,
         notification_type, notification_link, false
  from public.school_memberships sm
  where sm.school_id = new.school_id
    and sm.status = 'active'
    and sm.user_id is distinct from (select auth.uid());

  return new;
end;
$$;
revoke all on function public.create_seaconnect_notifications() from public, anon, authenticated;

drop policy if exists "Authenticated members can view event RSVPs" on public.event_rsvps;
drop policy if exists "Members can RSVP for themselves" on public.event_rsvps;
drop policy if exists "Members can cancel their own RSVP" on public.event_rsvps;
drop policy if exists "Members can update their own RSVP" on public.event_rsvps;

create policy "Campus members and platform admins view event RSVPs"
on public.event_rsvps for select to authenticated
using (
  private.is_platform_admin()
  or exists (
    select 1 from public.events e
    where e.id = event_rsvps.event_id
      and private.is_school_member(e.school_id)
  )
);
create policy "Campus members RSVP for themselves"
on public.event_rsvps for insert to authenticated
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.events e
    where e.id = event_rsvps.event_id
      and private.is_school_member(e.school_id)
  )
);
create policy "Members cancel their own campus RSVP"
on public.event_rsvps for delete to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.events e
    where e.id = event_rsvps.event_id
      and private.is_school_member(e.school_id)
  )
);
create policy "Members update their own campus RSVP"
on public.event_rsvps for update to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.events e
    where e.id = event_rsvps.event_id
      and private.is_school_member(e.school_id)
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1 from public.events e
    where e.id = event_rsvps.event_id
      and private.is_school_member(e.school_id)
  )
);

drop policy if exists "Campus users view their event tickets" on public.event_tickets;
create policy "Ticket owners and campus admins view tickets"
on public.event_tickets for select to authenticated
using (
  user_id = (select auth.uid())
  or private.is_platform_admin()
  or exists (
    select 1 from public.events e
    where e.id = event_tickets.event_id
      and private.is_school_officer(e.school_id)
  )
);

drop policy if exists "Officers can view event check-ins" on public.event_checkins;
create policy "Campus officers and platform admins view event check-ins"
on public.event_checkins for select to authenticated
using (
  private.is_platform_admin()
  or exists (
    select 1 from public.events e
    where e.id = event_checkins.event_id
      and private.is_school_officer(e.school_id)
  )
);

create index if not exists conversations_created_by_idx on public.conversations(created_by);
create index if not exists event_checkins_checked_in_by_idx on public.event_checkins(checked_in_by);
create index if not exists message_receipts_user_id_idx on public.message_receipts(user_id);
create index if not exists messages_sender_id_idx on public.messages(sender_id);

create or replace function public.check_in_event_ticket(p_event_id uuid, p_ticket_code text)
returns table(attendee_name text, event_title text, checked_in_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid;
  v_attendee_name text;
  v_event_title text;
  v_checked_in_at timestamptz;
  v_school_id uuid;
begin
  if (select auth.uid()) is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  select e.school_id into v_school_id
  from public.events e where e.id = p_event_id;

  if v_school_id is null then
    raise exception 'EVENT_NOT_FOUND';
  end if;

  if not private.is_platform_admin()
     and not private.is_school_officer(v_school_id) then
    raise exception 'FORBIDDEN';
  end if;

  select t.user_id,
         coalesce(nullif(trim(p.full_name), ''), 'SEA Member'),
         e.title
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
  values (p_event_id, v_user_id, (select auth.uid()))
  on conflict (event_id, user_id) do nothing
  returning event_checkins.checked_in_at into v_checked_in_at;

  if v_checked_in_at is null then
    raise exception 'ALREADY_CHECKED_IN';
  end if;

  return query select v_attendee_name, v_event_title, v_checked_in_at;
end;
$$;
revoke all on function public.check_in_event_ticket(uuid,text) from public, anon;
grant execute on function public.check_in_event_ticket(uuid,text) to authenticated;

create or replace function public.issue_event_ticket(p_event_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ticket_code text;
  v_user_id uuid := (select auth.uid());
  v_school_id uuid;
begin
  if v_user_id is null then
    raise exception 'UNAUTHENTICATED';
  end if;

  select e.school_id into v_school_id
  from public.events e where e.id = p_event_id;

  if v_school_id is null or not private.is_school_member(v_school_id) then
    raise exception 'FORBIDDEN';
  end if;

  if not exists (
    select 1 from public.event_rsvps r
    where r.event_id = p_event_id
      and r.user_id = v_user_id
      and r.status = 'going'
  ) then
    raise exception 'RSVP_REQUIRED';
  end if;

  insert into public.event_tickets (event_id,user_id)
  values (p_event_id,v_user_id)
  on conflict (event_id,user_id) do nothing;

  select t.ticket_code into v_ticket_code
  from public.event_tickets t
  where t.event_id = p_event_id and t.user_id = v_user_id;

  return v_ticket_code;
end;
$$;
revoke all on function public.issue_event_ticket(uuid) from public, anon;
grant execute on function public.issue_event_ticket(uuid) to authenticated;
