-- SEAConnect: event RSVP foundation
-- Additive schema only; existing event records and event workflows remain intact.

create unique index if not exists events_id_unique_idx
  on public.events (id);

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'going'
    check (status in ('going', 'maybe')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint event_rsvps_event_user_unique unique (event_id, user_id)
);

create index if not exists event_rsvps_event_status_idx
  on public.event_rsvps (event_id, status);

alter table public.event_rsvps enable row level security;
revoke all on public.event_rsvps from anon;
grant select, insert, update, delete on public.event_rsvps to authenticated;

drop policy if exists "Authenticated members can view event RSVPs" on public.event_rsvps;
create policy "Authenticated members can view event RSVPs"
  on public.event_rsvps for select to authenticated
  using (true);

drop policy if exists "Members can RSVP for themselves" on public.event_rsvps;
create policy "Members can RSVP for themselves"
  on public.event_rsvps for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.events e where e.id = event_id)
  );

drop policy if exists "Members can update their own RSVP" on public.event_rsvps;
create policy "Members can update their own RSVP"
  on public.event_rsvps for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "Members can cancel their own RSVP" on public.event_rsvps;
create policy "Members can cancel their own RSVP"
  on public.event_rsvps for delete to authenticated
  using (user_id = (select auth.uid()));
