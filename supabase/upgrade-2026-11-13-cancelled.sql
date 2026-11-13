-- Existing databases only (new installs get this from schema.sql).
-- Run once in the Supabase SQL editor BEFORE deploying the code that adds "Batalkan".
alter table bookings drop constraint bookings_status_check;
alter table bookings add constraint bookings_status_check
  check (status in ('pending', 'approved', 'rejected', 'cancelled'));
