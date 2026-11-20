-- Keep privileged chat aggregation in the private schema behind an invoker wrapper.
-- Also prevent direct RPC execution of notification trigger functions.
create or replace function private.get_school_chat_activity(p_school_id uuid)
returns table (
  conversation_id uuid,
  conversation_title text,
  created_at timestamptz,
  participant_count bigint,
  message_count bigint,
  last_message_at timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_platform_admin() then
    raise exception 'FORBIDDEN';
  end if;

  return query
  select c.id, c.title, c.created_at,
         count(distinct cm.user_id),
         count(distinct m.id),
         max(m.created_at)
  from public.conversations c
  left join public.conversation_members cm on cm.conversation_id = c.id
  left join public.messages m on m.conversation_id = c.id
  where c.school_id = p_school_id
  group by c.id, c.title, c.created_at
  order by max(m.created_at) desc nulls last, c.created_at desc;
end;
$$;
revoke all on function private.get_school_chat_activity(uuid) from public, anon;
grant usage on schema private to authenticated;
grant execute on function private.get_school_chat_activity(uuid) to authenticated;

create or replace function public.get_school_chat_activity(p_school_id uuid)
returns table (
  conversation_id uuid,
  conversation_title text,
  created_at timestamptz,
  participant_count bigint,
  message_count bigint,
  last_message_at timestamptz
)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from private.get_school_chat_activity(p_school_id);
$$;
revoke all on function public.get_school_chat_activity(uuid) from public, anon;
grant execute on function public.get_school_chat_activity(uuid) to authenticated;

revoke all on function public.delete_announcement_notifications() from public, anon, authenticated;
revoke all on function public.delete_event_notifications() from public, anon, authenticated;
revoke all on function public.delete_meeting_notifications() from public, anon, authenticated;
