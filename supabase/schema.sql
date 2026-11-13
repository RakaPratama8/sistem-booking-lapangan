-- Run once in the Supabase SQL editor.
create table bookings (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  start_hour smallint not null,
  name text not null,
  phone text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Double-booking guard: only one approved booking per slot. Pending requests may overlap.
create unique index bookings_one_approved_per_slot
  on bookings (date, start_hour) where status = 'approved';

-- No policies on purpose: anon/authenticated keys can't read phone numbers.
-- All access goes through server code using the service-role key.
alter table bookings enable row level security;
