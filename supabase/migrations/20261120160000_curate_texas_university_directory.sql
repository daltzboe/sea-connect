-- Curate the initial SEAConnect directory to a focused set of Texas universities.
-- Keep existing school rows and memberships; only change directory visibility.
-- Includes UT/A&M campuses, Texas HBCUs, major universities, and campuses
-- with known NSBE collegiate activity. Safe to re-run.

update public.schools
set is_listed = (slug = any (array[
  'acu','angelo-state','baylor','east-texas-am','huston-tillotson',
  'jarvis-christian','lamar','midwestern-state','paul-quinn','pvamu',
  'rice','shsu','smu','sfa','tarleton','tamiu','texas-am','tamuct',
  'tamu-corpus-christi','tamuk','tamusa','tamut','tcu','texas-college',
  'tlu','texas-southern','texas-state','texas-tech','twu','uta',
  'ut-austin','ut-dallas','utsa','trinity-university','uh','unt',
  'unt-dallas','utep','ut-tyler','utpb','utrgv','uiw','wtamu',
  'wiley-university'
]::text[]))
where state = 'Texas';
