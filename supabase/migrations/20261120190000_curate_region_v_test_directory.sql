-- Keep the initial test directory focused on 20 universities in NSBE Region V.
-- Existing school rows and memberships are retained; only directory visibility changes.
-- UTSA remains the only launched community during the test phase.

insert into public.schools
  (name, short_name, slug, city, state, country, school_type, community_enabled, is_listed)
values
  ('Louisiana Tech University', 'Louisiana Tech', 'louisiana-tech', 'Ruston', 'Louisiana', 'United States', 'university', false, true),
  ('University of Iowa', 'Iowa', 'iowa', 'Iowa City', 'Iowa', 'United States', 'university', false, true)
on conflict (slug) do update set
  name = excluded.name,
  short_name = excluded.short_name,
  city = excluded.city,
  state = excluded.state,
  country = excluded.country,
  school_type = excluded.school_type;

update public.schools
set is_listed = (slug = any (array[
  'utsa',
  'baylor',
  'uh',
  'unt',
  'ut-dallas',
  'ut-austin',
  'texas-state',
  'texas-am',
  'pvamu',
  'texas-southern',
  'rice',
  'ou',
  'texas-tech',
  'utep',
  'shsu',
  'oklahoma-state',
  'uark',
  'southern-university',
  'louisiana-tech',
  'iowa'
]::text[]));

update public.schools
set community_enabled = (slug = 'utsa')
where slug = any (array[
  'utsa','baylor','uh','unt','ut-dallas','ut-austin','texas-state',
  'texas-am','pvamu','texas-southern','rice','ou','texas-tech','utep',
  'shsu','oklahoma-state','uark','southern-university','louisiana-tech','iowa'
]::text[]);
