-- Expand the directory with additional U.S. campuses and clarify duplicate abbreviations.
update public.schools set short_name='Angelo State' where slug='angelo-state';
update public.schools set short_name='Midwestern' where slug='midwestern-state';
update public.schools set short_name='Oklahoma State' where slug='oklahoma-state';
update public.schools set short_name='Ohio State' where slug='ohio-state';

insert into public.schools
  (name, short_name, slug, city, state, country, school_type, community_enabled)
values
  ('Howard University','Howard','howard','Washington','District of Columbia','United States','university',false),
  ('North Carolina A&T State University','NC A&T','nc-at','Greensboro','North Carolina','United States','university',false),
  ('Florida A&M University','FAMU','famu','Tallahassee','Florida','United States','university',false),
  ('Tennessee State University','Tennessee State','tennessee-state','Nashville','Tennessee','United States','university',false),
  ('Morgan State University','Morgan State','morgan-state','Baltimore','Maryland','United States','university',false),
  ('Hampton University','Hampton','hampton','Hampton','Virginia','United States','university',false),
  ('Alabama A&M University','Alabama A&M','alabama-am','Huntsville','Alabama','United States','university',false),
  ('Alabama State University','Alabama State','alabama-state','Montgomery','Alabama','United States','university',false),
  ('Jackson State University','Jackson State','jackson-state','Jackson','Mississippi','United States','university',false),
  ('Southern University and A&M College','Southern','southern-university','Baton Rouge','Louisiana','United States','university',false),
  ('University of Central Florida','UCF','ucf','Orlando','Florida','United States','university',false),
  ('Florida State University','FSU','fsu','Tallahassee','Florida','United States','university',false)
on conflict (slug) do update set
  name=excluded.name,
  short_name=excluded.short_name,
  city=excluded.city,
  state=excluded.state,
  school_type=excluded.school_type;
