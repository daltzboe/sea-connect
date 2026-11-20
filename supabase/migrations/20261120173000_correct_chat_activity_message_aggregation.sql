-- Avoid multiplying message counts by participant count in the chat summary.
create or replace function public.get_school_chat_activity(p_school_id uuid)
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
revoke all on function public.get_school_chat_activity(uuid) from public, anon;
grant execute on function public.get_school_chat_activity(uuid) to authenticated;
