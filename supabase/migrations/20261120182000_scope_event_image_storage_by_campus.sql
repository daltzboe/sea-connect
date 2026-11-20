-- Limit event image reads to the owning campus. Event image paths are stored on events.image_url.
drop policy if exists "Members can view event images" on storage.objects;
drop policy if exists "Officers can upload event images" on storage.objects;

create policy "Campus members and platform admins view event images"
on storage.objects for select to authenticated
using (
  bucket_id = 'event-images'
  and (
    private.is_platform_admin()
    or exists (
      select 1
      from public.events e
      where e.image_url = storage.objects.name
        and private.is_school_member(e.school_id)
    )
  )
);

create policy "Campus officers upload event images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'event-images'
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.primary_school_id is not null
      and private.is_school_officer(p.primary_school_id)
  )
);

create policy "Campus officers delete their own event image uploads"
on storage.objects for delete to authenticated
using (
  bucket_id = 'event-images'
  and split_part(storage.objects.name, '/', 1) = (select auth.uid())::text
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.primary_school_id is not null
      and private.is_school_officer(p.primary_school_id)
  )
);
