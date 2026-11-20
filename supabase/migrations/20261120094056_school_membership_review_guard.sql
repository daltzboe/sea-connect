-- Prevent school officers from changing the identity or school of a membership
-- while reviewing it. Officers may only approve/reject a pending request.
create or replace function private.guard_school_membership_review()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.school_id is distinct from old.school_id
     or new.user_id is distinct from old.user_id
     or new.role is distinct from old.role
     or new.requested_at is distinct from old.requested_at then
    raise exception 'SCHOOL_MEMBERSHIP_IDENTITY_IMMUTABLE';
  end if;

  if old.status <> 'pending' then
    raise exception 'SCHOOL_MEMBERSHIP_ALREADY_REVIEWED';
  end if;

  if new.status not in ('active','rejected') then
    raise exception 'INVALID_SCHOOL_MEMBERSHIP_REVIEW_STATUS';
  end if;

  if new.reviewed_by is distinct from auth.uid() or new.reviewed_at is null then
    raise exception 'INVALID_SCHOOL_MEMBERSHIP_REVIEWER';
  end if;

  return new;
end;
$$;

revoke all on function private.guard_school_membership_review() from public, anon, authenticated;

drop trigger if exists guard_school_membership_review on public.school_memberships;
create trigger guard_school_membership_review
before update on public.school_memberships
for each row execute function private.guard_school_membership_review();
