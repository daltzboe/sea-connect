-- Limit the initial SEAConnect directory to Texas four-year universities.
-- Existing accounts and memberships are preserved; out-of-scope schools are hidden,
-- not deleted. This migration is safe to run more than once.

update public.schools
set is_listed = false
where state is distinct from 'Texas'
   or school_type = 'community_college';

insert into public.schools
  (name, short_name, slug, city, state, country, school_type, is_listed, community_enabled)
values
  ('Huston-Tillotson University', 'Huston-Tillotson', 'huston-tillotson', 'Austin', 'Texas', 'United States', 'university', true, false),
  ('Jarvis Christian University', 'Jarvis Christian', 'jarvis-christian', 'Hawkins', 'Texas', 'United States', 'university', true, false),
  ('Paul Quinn College', 'Paul Quinn', 'paul-quinn', 'Dallas', 'Texas', 'United States', 'university', true, false),
  ('Texas College', 'Texas College', 'texas-college', 'Tyler', 'Texas', 'United States', 'university', true, false),
  ('Wiley University', 'Wiley', 'wiley-university', 'Marshall', 'Texas', 'United States', 'university', true, false)
on conflict (slug) do update
set name = excluded.name,
    short_name = excluded.short_name,
    city = excluded.city,
    state = excluded.state,
    country = excluded.country,
    school_type = excluded.school_type,
    is_listed = true;
