-- Let the verified global platform admin upload and remove event images
-- while acting in a selected campus. Campus officers remain scoped to their own campus.

drop policy if exists "Campus officers upload event images" on storage.objects;
create policy "Campus officers and platform admins upload event images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'event-images'
  and (
    private.is_platform_admin()
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.primary_school_id is not null
        and private.is_school_officer(p.primary_school_id)
    )
  )
);

drop policy if exists "Campus officers delete their own event image uploads" on storage.objects;
create policy "Campus officers and platform admins delete own event image uploads"
on storage.objects for delete to authenticated
using (
  bucket_id = 'event-images'
  and split_part(storage.objects.name, '/', 1) = (select auth.uid())::text
  and (
    private.is_platform_admin()
    or exists (
      select 1
      from public.profiles p
      where p.id = (select auth.uid())
        and p.primary_school_id is not null
        and private.is_school_officer(p.primary_school_id)
    )
  )
);
