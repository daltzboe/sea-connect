-- Multi-school foundation for SEAConnect.
-- This migration is additive: existing accounts remain intact and are linked to UTSA.

create table if not exists public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  short_name text not null,
  slug text not null unique,
  city text,
  state text,
  country text not null default 'United States',
  school_type text not null default 'university'
    check (school_type in ('university','community_college','college')),
  logo_url text,
  primary_color text,
  is_listed boolean not null default true,
  community_enabled boolean not null default false,
  created_at timestamptz not null default now()
);

create unique index if not exists schools_name_location_uidx
  on public.schools (lower(name), lower(coalesce(state,'')), lower(country));

alter table public.profiles
  add column if not exists primary_school_id uuid
  references public.schools(id) on delete set null;

create table if not exists public.school_memberships (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending','active','rejected')),
  role text not null default 'member' check (role in ('member','officer')),
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  unique (school_id, user_id)
);

create index if not exists school_memberships_user_status_idx
  on public.school_memberships (user_id, status);
create index if not exists school_memberships_school_status_idx
  on public.school_memberships (school_id, status);

insert into public.schools (name, short_name, slug, city, state, country, school_type, community_enabled)
values
('The University of Texas at San Antonio','UTSA','utsa','San Antonio','Texas','United States','university',true),
('University of North Texas','UNT','unt','Denton','Texas','United States','university',false),
('The University of Texas at Dallas','UTD','ut-dallas','Richardson','Texas','United States','university',false),
('The University of Texas at Arlington','UTA','uta','Arlington','Texas','United States','university',false),
('The University of Texas at Austin','UT Austin','ut-austin','Austin','Texas','United States','university',false),
('University of Houston','UH','uh','Houston','Texas','United States','university',false),
('Texas A&M University','TAMU','texas-am','College Station','Texas','United States','university',false),
('Texas Tech University','TTU','texas-tech','Lubbock','Texas','United States','university',false),
('Texas State University','TXST','texas-state','San Marcos','Texas','United States','university',false),
('University of Texas at El Paso','UTEP','utep','El Paso','Texas','United States','university',false),
('University of Texas Rio Grande Valley','UTRGV','utrgv','Edinburg','Texas','United States','university',false),
('University of Texas at Tyler','UT Tyler','ut-tyler','Tyler','Texas','United States','university',false),
('University of Texas Permian Basin','UTPB','utpb','Odessa','Texas','United States','university',false),
('University of North Texas at Dallas','UNT Dallas','unt-dallas','Dallas','Texas','United States','university',false),
('East Texas A&M University','ETAMU','east-texas-am','Commerce','Texas','United States','university',false),
('Texas A&M International University','TAMIU','tamiu','Laredo','Texas','United States','university',false),
('Texas A&M University-Corpus Christi','TAMU-CC','tamu-corpus-christi','Corpus Christi','Texas','United States','university',false),
('Texas A&M University-Kingsville','TAMUK','tamuk','Kingsville','Texas','United States','university',false),
('Texas A&M University-San Antonio','TAMUSA','tamusa','San Antonio','Texas','United States','university',false),
('Texas A&M University-Texarkana','TAMUT','tamut','Texarkana','Texas','United States','university',false),
('Texas A&M University-Central Texas','A&M-Central Texas','tamuct','Killeen','Texas','United States','university',false),
('Tarleton State University','Tarleton','tarleton','Stephenville','Texas','United States','university',false),
('West Texas A&M University','WTAMU','wtamu','Canyon','Texas','United States','university',false),
('Prairie View A&M University','PVAMU','pvamu','Prairie View','Texas','United States','university',false),
('Texas Southern University','TSU','texas-southern','Houston','Texas','United States','university',false),
('Sam Houston State University','SHSU','shsu','Huntsville','Texas','United States','university',false),
('Lamar University','Lamar','lamar','Beaumont','Texas','United States','university',false),
('Midwestern State University','MSU','midwestern-state','Wichita Falls','Texas','United States','university',false),
('Stephen F. Austin State University','SFA','sfa','Nacogdoches','Texas','United States','university',false),
('Sul Ross State University','SRSU','sul-ross','Alpine','Texas','United States','university',false),
('Angelo State University','ASU','angelo-state','San Angelo','Texas','United States','university',false),
('Texas Woman’s University','TWU','twu','Denton','Texas','United States','university',false),
('Baylor University','Baylor','baylor','Waco','Texas','United States','university',false),
('Rice University','Rice','rice','Houston','Texas','United States','university',false),
('Southern Methodist University','SMU','smu','Dallas','Texas','United States','university',false),
('Texas Christian University','TCU','tcu','Fort Worth','Texas','United States','university',false),
('Trinity University','Trinity','trinity-university','San Antonio','Texas','United States','university',false),
('St. Mary’s University','St. Mary’s','stmarys','San Antonio','Texas','United States','university',false),
('University of the Incarnate Word','UIW','uiw','San Antonio','Texas','United States','university',false),
('St. Edward’s University','St. Edward’s','stedwards','Austin','Texas','United States','university',false),
('University of Dallas','UD','udallas','Irving','Texas','United States','university',false),
('Abilene Christian University','ACU','acu','Abilene','Texas','United States','university',false),
('Houston Christian University','HCU','hcu','Houston','Texas','United States','university',false),
('Dallas Baptist University','DBU','dbu','Dallas','Texas','United States','university',false),
('University of Mary Hardin-Baylor','UMHB','umhb','Belton','Texas','United States','university',false),
('Texas Lutheran University','TLU','tlu','Seguin','Texas','United States','university',false),
('Southwestern University','Southwestern','southwestern','Georgetown','Texas','United States','university',false),
('Alamo Colleges District','Alamo Colleges','alamo-colleges','San Antonio','Texas','United States','community_college',false),
('Austin Community College District','Austin CC','austin-cc','Austin','Texas','United States','community_college',false),
('Dallas College','Dallas College','dallas-college','Dallas','Texas','United States','community_college',false),
('Houston Community College','HCC','hcc','Houston','Texas','United States','community_college',false),
('Tarrant County College','TCC','tarrant-county-college','Fort Worth','Texas','United States','community_college',false),
('Collin College','Collin','collin-college','McKinney','Texas','United States','community_college',false),
('Lone Star College','Lone Star','lone-star','The Woodlands','Texas','United States','community_college',false),
('San Jacinto College','San Jac','san-jacinto','Pasadena','Texas','United States','community_college',false),
('El Paso Community College','EPCC','epcc','El Paso','Texas','United States','community_college',false),
('South Texas College','STC','south-texas-college','McAllen','Texas','United States','community_college',false),
('University of Oklahoma','OU','ou','Norman','Oklahoma','United States','university',false),
('Oklahoma State University','OSU','oklahoma-state','Stillwater','Oklahoma','United States','university',false),
('University of Arkansas','UArk','uark','Fayetteville','Arkansas','United States','university',false),
('University of Kansas','KU','ku','Lawrence','Kansas','United States','university',false),
('Kansas State University','K-State','k-state','Manhattan','Kansas','United States','university',false),
('University of Missouri','Mizzou','mizzou','Columbia','Missouri','United States','university',false),
('University of Colorado Boulder','CU Boulder','cu-boulder','Boulder','Colorado','United States','university',false),
('Arizona State University','ASU','asu','Tempe','Arizona','United States','university',false),
('University of Arizona','UArizona','uarizona','Tucson','Arizona','United States','university',false),
('University of Minnesota','UMN','umn','Minneapolis','Minnesota','United States','university',false),
('University of Illinois Urbana-Champaign','UIUC','uiuc','Urbana','Illinois','United States','university',false),
('University of Maryland','UMD','umd','College Park','Maryland','United States','university',false),
('University of Georgia','UGA','uga','Athens','Georgia','United States','university',false),
('Georgia State University','GSU','georgia-state','Atlanta','Georgia','United States','university',false),
('Florida International University','FIU','fiu','Miami','Florida','United States','university',false),
('University of Florida','UF','uf','Gainesville','Florida','United States','university',false),
('University of South Florida','USF','usf','Tampa','Florida','United States','university',false),
('Ohio State University','OSU','ohio-state','Columbus','Ohio','United States','university',false),
('Michigan State University','MSU','michigan-state','East Lansing','Michigan','United States','university',false),
('University of Cincinnati','UC','ucincinnati','Cincinnati','Ohio','United States','university',false),
('Pennsylvania State University','Penn State','penn-state','State College','Pennsylvania','United States','university',false),
('Purdue University','Purdue','purdue','West Lafayette','Indiana','United States','university',false),
('Rutgers University','Rutgers','rutgers','New Brunswick','New Jersey','United States','university',false),
('North Carolina State University','NC State','nc-state','Raleigh','North Carolina','United States','university',false),
('Virginia Tech','Virginia Tech','virginia-tech','Blacksburg','Virginia','United States','university',false),
('Louisiana State University','LSU','lsu','Baton Rouge','Louisiana','United States','university',false),
('University of Alabama','UA','ua','Tuscaloosa','Alabama','United States','university',false),
('Auburn University','Auburn','auburn','Auburn','Alabama','United States','university',false),
('University of Tennessee','UTK','utk','Knoxville','Tennessee','United States','university',false)
on conflict (slug) do update set
  name=excluded.name, short_name=excluded.short_name, city=excluded.city,
  state=excluded.state, school_type=excluded.school_type;

insert into public.school_memberships (school_id, user_id, status, role, reviewed_at)
select s.id, p.id, 'active', case when p.role='officer' then 'officer' else 'member' end, now()
from public.profiles p cross join public.schools s where s.slug='utsa'
on conflict (school_id,user_id) do update
set status='active', role=excluded.role,
    reviewed_at=coalesce(public.school_memberships.reviewed_at, now());

update public.profiles
set primary_school_id=(select id from public.schools where slug='utsa')
where primary_school_id is null;

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.is_school_officer(p_school_id uuid)
returns boolean language sql stable security definer set search_path=''
as $$
  select exists (
    select 1 from public.school_memberships sm
    where sm.school_id=p_school_id and sm.user_id=(select auth.uid())
      and sm.status='active' and sm.role='officer'
  );
$$;
revoke all on function private.is_school_officer(uuid) from public, anon;
grant execute on function private.is_school_officer(uuid) to authenticated;

alter table public.schools enable row level security;
alter table public.school_memberships enable row level security;

drop policy if exists "Listed schools are visible" on public.schools;
create policy "Listed schools are visible" on public.schools for select to anon, authenticated using (is_listed=true);

drop policy if exists "Users and their school officers can view memberships" on public.school_memberships;
create policy "Users and their school officers can view memberships"
on public.school_memberships for select to authenticated
using (user_id=(select auth.uid()) or private.is_school_officer(school_id));

drop policy if exists "School officers can review pending memberships" on public.school_memberships;
create policy "School officers can review pending memberships"
on public.school_memberships for update to authenticated
using (status='pending' and private.is_school_officer(school_id))
with check (
  status in ('active','rejected') and role='member'
  and reviewed_by=(select auth.uid()) and private.is_school_officer(school_id)
);

grant select on public.schools to anon, authenticated;
revoke insert, update, delete on public.schools from anon, authenticated;
grant select, update on public.school_memberships to authenticated;
revoke insert, delete on public.school_memberships from anon, authenticated;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path=''
as $$
declare v_school_id uuid;
begin
  insert into public.profiles (id,full_name,role,position,country,primary_school_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name','SEA Member'),
    'member','SEA Member',
    coalesce(new.raw_user_meta_data->>'country','Not provided'),
    null
  );

  if nullif(new.raw_user_meta_data->>'school_id','') is not null then
    begin
      v_school_id := (new.raw_user_meta_data->>'school_id')::uuid;
    exception when invalid_text_representation then
      raise exception 'INVALID_SCHOOL_SELECTION';
    end;

    if not exists (select 1 from public.schools s where s.id=v_school_id and s.is_listed=true) then
      raise exception 'INVALID_SCHOOL_SELECTION';
    end if;

    update public.profiles set primary_school_id=v_school_id where id=new.id;
    insert into public.school_memberships (school_id,user_id,status,role)
    values (v_school_id,new.id,'pending','member');
  end if;
  return new;
end;
$$;
revoke all on function public.handle_new_user() from public, anon, authenticated;
