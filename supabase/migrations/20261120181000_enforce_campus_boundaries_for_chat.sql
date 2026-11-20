-- Enforce campus membership through every chat child table.
-- Platform admins receive aggregate chat metrics only; message bodies remain participant-only.
drop policy if exists "Group admins can add conversation participants" on public.conversation_members;
drop policy if exists "Group admins can update member roles" on public.conversation_members;
drop policy if exists "Members can leave and admins can remove members" on public.conversation_members;
drop policy if exists "Members can view conversation participants" on public.conversation_members;

create policy "Campus conversation participants can view participants"
on public.conversation_members for select to authenticated
using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_members.conversation_id
      and private.is_school_member(c.school_id)
      and (
        conversation_members.user_id = (select auth.uid())
        or is_conversation_member(c.id, (select auth.uid()))
      )
  )
);

create policy "Campus group admins add campus participants"
on public.conversation_members for insert to authenticated
with check (
  (
    is_conversation_creator(conversation_id, (select auth.uid()))
    or private.is_conversation_admin(conversation_id)
  )
  and exists (
    select 1
    from public.conversations c
    join public.school_memberships sm
      on sm.school_id = c.school_id
     and sm.user_id = conversation_members.user_id
     and sm.status = 'active'
    where c.id = conversation_members.conversation_id
      and private.is_school_member(c.school_id)
  )
);

create policy "Campus group admins update participant roles"
on public.conversation_members for update to authenticated
using (
  private.is_conversation_admin(conversation_id)
  and exists (
    select 1 from public.conversations c
    where c.id = conversation_members.conversation_id
      and private.is_school_member(c.school_id)
  )
)
with check (
  private.is_conversation_admin(conversation_id)
  and role = any (array['admin'::text,'member'::text])
  and exists (
    select 1 from public.conversations c
    join public.school_memberships sm
      on sm.school_id = c.school_id
     and sm.user_id = conversation_members.user_id
     and sm.status = 'active'
    where c.id = conversation_members.conversation_id
      and private.is_school_member(c.school_id)
  )
);

create policy "Campus participants leave or admins remove"
on public.conversation_members for delete to authenticated
using (
  (
    user_id = (select auth.uid())
    or private.is_conversation_admin(conversation_id)
  )
  and exists (
    select 1 from public.conversations c
    where c.id = conversation_members.conversation_id
      and private.is_school_member(c.school_id)
  )
);

drop policy if exists "Members can read conversation messages" on public.messages;
drop policy if exists "Members can send their own messages" on public.messages;
drop policy if exists "Senders can delete their own messages" on public.messages;

create policy "Campus conversation members read messages"
on public.messages for select to authenticated
using (
  is_conversation_member(conversation_id, (select auth.uid()))
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and private.is_school_member(c.school_id)
  )
);
create policy "Campus members send their own messages"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and is_conversation_member(conversation_id, (select auth.uid()))
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and private.is_school_member(c.school_id)
  )
);
create policy "Campus senders delete their own messages"
on public.messages for delete to authenticated
using (
  sender_id = (select auth.uid())
  and is_conversation_member(conversation_id, (select auth.uid()))
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and private.is_school_member(c.school_id)
  )
);

drop policy if exists "Conversation members can view message receipts" on public.message_receipts;
drop policy if exists "Recipients can update their own message receipts" on public.message_receipts;

create policy "Campus conversation members view message receipts"
on public.message_receipts for select to authenticated
using (
  exists (
    select 1
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = message_receipts.message_id
      and private.is_school_member(c.school_id)
      and is_conversation_member(c.id, (select auth.uid()))
  )
);
create policy "Campus recipients update their own message receipts"
on public.message_receipts for update to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = message_receipts.message_id
      and private.is_school_member(c.school_id)
      and is_conversation_member(c.id, (select auth.uid()))
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = message_receipts.message_id
      and private.is_school_member(c.school_id)
      and is_conversation_member(c.id, (select auth.uid()))
  )
);
