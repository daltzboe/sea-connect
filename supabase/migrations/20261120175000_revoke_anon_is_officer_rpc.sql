-- This helper is used by authenticated RLS policies, not by anonymous RPC callers.
revoke execute on function public.is_officer() from anon;
