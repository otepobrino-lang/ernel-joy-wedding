
create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.wedding_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null default true unique check (singleton = true),
  partner_one_name text not null default 'Ernel',
  partner_two_name text not null default 'Joy',
  wedding_datetime timestamptz not null default '2026-12-19 14:00:00+08',
  timezone text not null default 'Asia/Manila',
  rsvp_deadline timestamptz,
  welcome_message text not null default 'You didn''t receive this invitation by chance. On this special day, we truly hope you''ll be with us. We can''t wait to celebrate, laugh, and make unforgettable memories together! Browse through our website to know the details about our wedding.',
  dress_code text,
  color_motif text not null default 'Burgundy, champagne gold, and ivory',
  guest_instructions text,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.wedding_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null unique
    check (event_type in ('ceremony', 'reception')),
  title text not null,
  venue_name text not null,
  venue_address text,
  event_datetime timestamptz not null,
  description text,
  directions_url text,
  maps_url text,
  qr_target_url text,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.entourage_members (
  id uuid primary key default gen_random_uuid(),
  group_name text not null,
  role_name text not null,
  full_name text not null,
  description text,
  photo_path text,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gallery_photos (
  id uuid primary key default gen_random_uuid(),
  title text,
  caption text,
  alt_text text not null,
  storage_path text not null unique,
  display_order integer not null default 0,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.rsvp_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  contact_number text,
  relationship_to_couple text,
  attendance_response text not null
    check (attendance_response in ('attending', 'celebrating_from_afar')),
  dietary_restrictions text,
  message text,
  privacy_consent boolean not null default false
    check (privacy_consent = true),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role = 'admin'),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists wedding_events_published_order_idx
  on public.wedding_events (is_published, display_order);

create index if not exists entourage_published_order_idx
  on public.entourage_members (is_published, group_name, display_order);

create index if not exists gallery_published_order_idx
  on public.gallery_photos (is_published, display_order);

create index if not exists rsvp_created_at_idx
  on public.rsvp_submissions (created_at desc);

create index if not exists rsvp_attendance_idx
  on public.rsvp_submissions (attendance_response);

create index if not exists rsvp_name_search_idx
  on public.rsvp_submissions (lower(full_name));

create index if not exists audit_logs_created_at_idx
  on public.audit_logs (created_at desc);

create or replace function public.is_wedding_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.admin_users au
    where au.user_id = (select auth.uid())
      and au.is_active = true
      and au.role = 'admin'
  );
$$;

revoke all on function public.is_wedding_admin() from public;
grant execute on function public.is_wedding_admin() to anon, authenticated;

drop trigger if exists wedding_settings_updated_at
  on public.wedding_settings;
create trigger wedding_settings_updated_at
before update on public.wedding_settings
for each row execute function public.set_updated_at();

drop trigger if exists wedding_events_updated_at
  on public.wedding_events;
create trigger wedding_events_updated_at
before update on public.wedding_events
for each row execute function public.set_updated_at();

drop trigger if exists entourage_members_updated_at
  on public.entourage_members;
create trigger entourage_members_updated_at
before update on public.entourage_members
for each row execute function public.set_updated_at();

drop trigger if exists gallery_photos_updated_at
  on public.gallery_photos;
create trigger gallery_photos_updated_at
before update on public.gallery_photos
for each row execute function public.set_updated_at();

drop trigger if exists rsvp_submissions_updated_at
  on public.rsvp_submissions;
create trigger rsvp_submissions_updated_at
before update on public.rsvp_submissions
for each row execute function public.set_updated_at();

drop trigger if exists admin_users_updated_at
  on public.admin_users;
create trigger admin_users_updated_at
before update on public.admin_users
for each row execute function public.set_updated_at();

alter table public.wedding_settings enable row level security;
alter table public.wedding_events enable row level security;
alter table public.entourage_members enable row level security;
alter table public.gallery_photos enable row level security;
alter table public.rsvp_submissions enable row level security;
alter table public.admin_users enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "Published wedding settings are readable"
  on public.wedding_settings;
create policy "Published wedding settings are readable"
on public.wedding_settings
for select
to anon, authenticated
using (is_published = true or (select public.is_wedding_admin()));

drop policy if exists "Admins manage wedding settings"
  on public.wedding_settings;
create policy "Admins manage wedding settings"
on public.wedding_settings
for all
to authenticated
using ((select public.is_wedding_admin()))
with check ((select public.is_wedding_admin()));

drop policy if exists "Published events are readable"
  on public.wedding_events;
create policy "Published events are readable"
on public.wedding_events
for select
to anon, authenticated
using (is_published = true or (select public.is_wedding_admin()));

drop policy if exists "Admins manage events"
  on public.wedding_events;
create policy "Admins manage events"
on public.wedding_events
for all
to authenticated
using ((select public.is_wedding_admin()))
with check ((select public.is_wedding_admin()));

drop policy if exists "Published entourage is readable"
  on public.entourage_members;
create policy "Published entourage is readable"
on public.entourage_members
for select
to anon, authenticated
using (is_published = true or (select public.is_wedding_admin()));

drop policy if exists "Admins manage entourage"
  on public.entourage_members;
create policy "Admins manage entourage"
on public.entourage_members
for all
to authenticated
using ((select public.is_wedding_admin()))
with check ((select public.is_wedding_admin()));

drop policy if exists "Published gallery metadata is readable"
  on public.gallery_photos;
create policy "Published gallery metadata is readable"
on public.gallery_photos
for select
to anon, authenticated
using (is_published = true or (select public.is_wedding_admin()));

drop policy if exists "Admins manage gallery metadata"
  on public.gallery_photos;
create policy "Admins manage gallery metadata"
on public.gallery_photos
for all
to authenticated
using ((select public.is_wedding_admin()))
with check ((select public.is_wedding_admin()));

drop policy if exists "Admins read RSVP submissions"
  on public.rsvp_submissions;
create policy "Admins read RSVP submissions"
on public.rsvp_submissions
for select
to authenticated
using ((select public.is_wedding_admin()));

drop policy if exists "Admins update RSVP submissions"
  on public.rsvp_submissions;
create policy "Admins update RSVP submissions"
on public.rsvp_submissions
for update
to authenticated
using ((select public.is_wedding_admin()))
with check ((select public.is_wedding_admin()));

drop policy if exists "Admins delete RSVP submissions"
  on public.rsvp_submissions;
create policy "Admins delete RSVP submissions"
on public.rsvp_submissions
for delete
to authenticated
using ((select public.is_wedding_admin()));

drop policy if exists "Admins read audit logs"
  on public.audit_logs;
create policy "Admins read audit logs"
on public.audit_logs
for select
to authenticated
using ((select public.is_wedding_admin()));

insert into public.wedding_settings (
  singleton,
  partner_one_name,
  partner_two_name,
  wedding_datetime,
  timezone,
  color_motif,
  is_published
)
values (
  true,
  'Ernel',
  'Joy',
  '2026-12-19 14:00:00+08',
  'Asia/Manila',
  'Burgundy, champagne gold, and ivory',
  true
)
on conflict (singleton) do nothing;

insert into public.wedding_events (
  event_type,
  title,
  venue_name,
  event_datetime,
  display_order,
  is_published
)
values
(
  'ceremony',
  'Wedding Ceremony',
  'Cathedral Parish of the Nativity of Our Lady',
  '2026-12-19 14:00:00+08',
  1,
  true
),
(
  'reception',
  'Wedding Reception',
  'Oikos Village Borongan',
  '2026-12-19 17:00:00+08',
  2,
  true
)
on conflict (event_type) do nothing;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'wedding-gallery',
  'wedding-gallery',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
on conflict (id) do nothing;

drop policy if exists "Admins read wedding gallery files"
  on storage.objects;
create policy "Admins read wedding gallery files"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'wedding-gallery'
  and (select public.is_wedding_admin())
);

drop policy if exists "Admins upload wedding gallery files"
  on storage.objects;
create policy "Admins upload wedding gallery files"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'wedding-gallery'
  and (select public.is_wedding_admin())
);

drop policy if exists "Admins update wedding gallery files"
  on storage.objects;
create policy "Admins update wedding gallery files"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'wedding-gallery'
  and (select public.is_wedding_admin())
)
with check (
  bucket_id = 'wedding-gallery'
  and (select public.is_wedding_admin())
);

drop policy if exists "Admins delete wedding gallery files"
  on storage.objects;
create policy "Admins delete wedding gallery files"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'wedding-gallery'
  and (select public.is_wedding_admin())
);
