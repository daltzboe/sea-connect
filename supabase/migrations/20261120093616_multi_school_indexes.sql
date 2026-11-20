-- Supporting indexes for school lookups and membership reviews.
create index if not exists profiles_primary_school_id_idx
  on public.profiles(primary_school_id);

create index if not exists school_memberships_reviewed_by_idx
  on public.school_memberships(reviewed_by);
