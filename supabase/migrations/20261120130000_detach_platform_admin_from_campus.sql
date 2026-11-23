-- Keep the global SEAConnect Platform Admin independent from any campus.
-- This is safe to run more than once.
update public.profiles p
set role = 'member',
    primary_school_id = null
from auth.users u
where p.id = u.id
  and lower(u.email) = lower('daltonjohncharles@gmail.com');

delete from public.school_memberships sm
using auth.users u
where sm.user_id = u.id
  and lower(u.email) = lower('daltonjohncharles@gmail.com');
