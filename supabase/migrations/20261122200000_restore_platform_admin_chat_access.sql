-- Restore Platform Admin access to chats they already belong to.
-- Admins do not gain access to every campus conversation: participant membership is still required.
-- Also support creating new chats while a Platform Admin is previewing a campus.

create or replace function private.is_platform_admin_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.platform_admins pa
    where pa.user_id = p_user_id
  );
$$;
revoke all on function private.is_platform_admin_user(uuid) from public, anon;
grant execute on function private.is_platform_admin_user(uuid) to authenticated;

-- Let campus members see the Platform Admin's profile row so the chat UI can
-- identify the account; ordinary profile visibility remains campus-scoped.
drop policy if exists "Users view profiles within their campus" on public.profiles;
create policy "Users view profiles within their campus"
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or private.is_platform_admin()
  or private.shares_school_with(id)
  or private.is_platform_admin_user(id)
);

-- A safe display-name helper. It only returns the caller's own profile,
-- same-campus profiles, or the SEA Admin profile. Admin identity is labeled
-- SEA Admin in chat without overwriting the person's actual profile name.
create or replace function public.chat_profile_names(p_user_ids uuid[])
returns table (id uuid, full_name text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id,
         case
           when private.is_platform_admin_user(p.id) then 'SEA Admin'
           else coalesce(p.full_name, 'SEA Member')
         end
  from public.profiles p
  where p.id = any(coalesce(p_user_ids, array[]::uuid[]))
    and (
      p.id = (select auth.uid())
      or private.is_platform_admin()
      or private.shares_school_with(p.id)
      or private.is_platform_admin_user(p.id)
    );
$$;
revoke all on function public.chat_profile_names(uuid[]) from public, anon;
grant execute on function public.chat_profile_names(uuid[]) to authenticated;

-- Platform Admin may create a conversation in the campus currently selected
-- in the secure admin-preview cookie (the client supplies that verified id).
drop policy if exists "Campus members create conversations" on public.conversations;
create policy "Campus members and platform admins create conversations"
on public.conversations for insert to authenticated
with check (
  created_by = (select auth.uid())
  and (
    private.is_school_member(school_id)
    or private.is_platform_admin()
  )
);

-- A platform admin can view participant rows only for chats they joined.
drop policy if exists "Campus conversation participants can view participants" on public.conversation_members;
create policy "Campus members and chat-participating platform admins view participants"
on public.conversation_members for select to authenticated
using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_members.conversation_id
      and (
        (
          private.is_school_member(c.school_id)
          and (
            conversation_members.user_id = (select auth.uid())
            or is_conversation_member(c.id, (select auth.uid()))
          )
        )
        or (
          private.is_platform_admin()
          and is_conversation_member(c.id, (select auth.uid()))
        )
      )
  )
);

-- Campus participants create membership rows. A Platform Admin may add their
-- own account as a participant while creating a campus-preview conversation.
drop policy if exists "Campus group admins add campus participants" on public.conversation_members;
create policy "Conversation creators add campus participants or admin self"
on public.conversation_members for insert to authenticated
with check (
  (
    is_conversation_creator(conversation_id, (select auth.uid()))
    or private.is_conversation_admin(conversation_id)
  )
  and exists (
    select 1
    from public.conversations c
    where c.id = conversation_members.conversation_id
      and (
        (
          private.is_school_member(c.school_id)
          and exists (
            select 1 from public.school_memberships sm
            where sm.school_id = c.school_id
              and sm.user_id = conversation_members.user_id
              and sm.status = 'active'
          )
        )
        or (
          private.is_platform_admin()
          and conversation_members.user_id = (select auth.uid())
        )
      )
  )
);

-- Restore read/send access only when the admin is an actual conversation member.
drop policy if exists "Campus conversation members read messages" on public.messages;
create policy "Campus members and participating platform admins read messages"
on public.messages for select to authenticated
using (
  is_conversation_member(conversation_id, (select auth.uid()))
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (
        private.is_school_member(c.school_id)
        or private.is_platform_admin()
      )
  )
);

drop policy if exists "Campus members send their own messages" on public.messages;
create policy "Campus members and participating platform admins send messages"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and is_conversation_member(conversation_id, (select auth.uid()))
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (
        private.is_school_member(c.school_id)
        or private.is_platform_admin()
      )
  )
);

drop policy if exists "Campus senders delete their own messages" on public.messages;
create policy "Campus members and participating platform admins delete own messages"
on public.messages for delete to authenticated
using (
  sender_id = (select auth.uid())
  and is_conversation_member(conversation_id, (select auth.uid()))
  and exists (
    select 1 from public.conversations c
    where c.id = messages.conversation_id
      and (
        private.is_school_member(c.school_id)
        or private.is_platform_admin()
      )
  )
);

drop policy if exists "Campus conversation members view message receipts" on public.message_receipts;
create policy "Campus members and participating platform admins view receipts"
on public.message_receipts for select to authenticated
using (
  exists (
    select 1
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = message_receipts.message_id
      and is_conversation_member(c.id, (select auth.uid()))
      and (
        private.is_school_member(c.school_id)
        or private.is_platform_admin()
      )
  )
);

drop policy if exists "Campus recipients update their own message receipts" on public.message_receipts;
create policy "Campus members and participating platform admins update own receipts"
on public.message_receipts for update to authenticated
using (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = message_receipts.message_id
      and is_conversation_member(c.id, (select auth.uid()))
      and (
        private.is_school_member(c.school_id)
        or private.is_platform_admin()
      )
  )
)
with check (
  user_id = (select auth.uid())
  and exists (
    select 1
    from public.messages m
    join public.conversations c on c.id = m.conversation_id
    where m.id = message_receipts.message_id
      and is_conversation_member(c.id, (select auth.uid()))
      and (
        private.is_school_member(c.school_id)
        or private.is_platform_admin()
      )
  )
);
