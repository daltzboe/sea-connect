-- RLS policies call this helper for signed-in users only.
revoke all on function public.is_officer() from public, anon;
grant execute on function public.is_officer() to authenticated;
