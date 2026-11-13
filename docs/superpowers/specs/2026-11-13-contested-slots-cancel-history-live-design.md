# Contested slots, admin cancel, booking history, live dashboard

Date: 2026-11-13. Status: draft for approval.

## Intent and why

Two groups, four changes. Residents can't tell which free slots are in demand, so they can't judge their odds. The admin can't undo an approval, can't look back at past bookings, and has to reload the dashboard to learn that a request arrived.

1. **Contested slots (resident):** a free slot shows how many pending requests it has, e.g. `Tersedia · 2 peminta`.
2. **Cancel an approved booking (admin):** a resident who wants out contacts the admin, who cancels from the dashboard.
3. **Booking history (admin):** a read-only log of every booking ever made, kept so the admin can look back.
4. **Live dashboard (admin):** while the dashboard is open it updates itself, so new requests appear without a reload.

## Goals

- All four work on a phone at 320px, in Indonesian, using the existing shared styles.
- Cancelling frees the slot immediately, and any pending requests for it can then be approved.
- The history keeps every row, including cancelled and rejected ones, so the data stays usable later.

## Non-goals

- Resident accounts or any way for residents to check their status (parked, no plan).
- Linking competing requests, or auto-rejecting the others when one is approved (parked, later).
- Notifications of any kind: push, WhatsApp, email, sound. Live updates exist only while the dashboard tab is open.
- Statistics, charts, export, or ML on the history data. The rows simply stay in the database.
- Resident self-cancel, cancel reasons, editing a booking.

## Anti-goals

- Names or phone numbers reaching the public page or any client-side code.
- A second place that decides who the admin is (the live update must not need a database rule that repeats `ADMIN_EMAIL`).
- Anything that makes cancelling feel as easy as a mis-tap. It must ask for confirmation.

## Constraints (from `CLAUDE.md` and the code)

- All database access is server-side through `createAdminClient()`. RLS stays on with no policies.
- Every admin page and action calls `requireAdmin()`.
- Double-booking stays blocked by the partial unique index on `(date, start_hour) where status='approved'`. Don't re-implement it in app code.
- Mutations are Server Actions. Selection and filter state lives in the URL.
- Tailwind only; shared classes live in `globals.css` with `dark:` variants there. Tap targets at least 40px, inputs at least 16px.
- Slots live in code (`SLOT_HOURS`); no slots table.

## Approaches

**Live updates** is the only part with real alternatives.

| | How | Trade-off |
|---|---|---|
| **A. Polling (chosen)** | A client component calls `router.refresh()` every ~5 s while the tab is visible, and once when the tab becomes visible again | Up to ~5 s delay. No database rule, no browser Supabase client, no second admin check. |
| B. Realtime database changes | The admin's browser subscribes to `bookings` changes | Instant, but needs a SQL policy that hard-codes the admin email and a browser Supabase client. This breaks "all DB access is server-side". |
| C. Broadcast from the server | `createBooking` pings a channel after each insert | Public channel, or a private one with the same SQL policy as B. Adds a failure point to every resident submission. |

Chosen: A, by the user. B is a small step up later if 5 s ever feels slow.

The other three have one sensible way each. Cancel keeps the row (new status) instead of deleting it, because the history is a goal. Public counts come from one more query on the existing page, not a new endpoint, because there is no REST layer.

## Design

### 1. Contested slots (public page)

- `src/app/page.tsx` runs a second query for the selected date: `start_hour` of rows with `status='pending'`. It counts per hour in code.
- A free slot (not booked, not past) shows `Tersedia · N peminta` when N > 0, otherwise `Tersedia`. Booked and past slots are unchanged. The selected slot shows `✓ Dipilih` as today.
- Only the number leaves the server, never names or phones.
- If the pending query fails, show `Tersedia` with no count and no error message. The approved query already drives the error banner.
- Update the `CLAUDE.md` rule to say the public page may expose approved `date` + `start_hour` and a per-slot pending count.

### 2. Cancel an approved booking

- **Schema:** the `status` check gains `'cancelled'`. `supabase/schema.sql` is updated for new installs. Existing databases need this one-time SQL, run before deploying the code:
  ```sql
  alter table bookings drop constraint bookings_status_check;
  alter table bookings add constraint bookings_status_check
    check (status in ('pending', 'approved', 'rejected', 'cancelled'));
  ```
  The unique index is unchanged, because a cancelled row is no longer `approved`, so the slot is free.
- **Action:** `cancelBooking` in `src/app/admin/actions.ts`. It calls `requireAdmin()`, then updates the row to `cancelled` only where `status='approved'`. On error it redirects to `/admin?error=failed`; on success to `/admin`. It reuses the existing `setStatus` shape where it fits.
- **UI:** each card in "Sudah disetujui" gets a `btn-danger` "Batalkan" button inside `ConfirmForm`, e.g. `Batalkan booking {name} untuk {when}?`, next to the Telepon / WhatsApp buttons. The admin will usually have called the resident already.
- **Afterwards:** pending requests for that slot stay pending and can be approved normally.
- Remove "An approved booking can't be cancelled from the UI" from Known limits in `CLAUDE.md`.

### 3. Booking history

- New page `src/app/admin/history/page.tsx`, calling `requireAdmin()` first. Linked from the dashboard header.
- Lists every booking, all dates, all statuses. Sorted by `date` descending, then `start_hour` descending.
- Each row shows: date and slot, name, phone (plain text), status badge, and when it was requested (`created_at`, Jakarta time).
- Filter by status with chips: Semua, Menunggu, Disetujui, Ditolak, Dibatalkan. State is `?status=`. An unknown value falls back to Semua.
- Pagination: 30 per page, `?page=`, with Sebelumnya / Berikutnya links. An invalid or out-of-range page falls back to 1 or the last page.
- Read-only: no approve, reject, or contact buttons. Those stay on the dashboard.
- New badge styles in `globals.css` for rejected and cancelled (the existing `badge-warn` and `badge-ok` cover pending and approved), each with `dark:` variants.
- The dashboard keeps showing only upcoming pending and approved bookings.

### 4. Live dashboard

- New client component `src/components/AutoRefresh.tsx`, rendered by `AdminDashboard`.
- Every 5 s, if `document.visibilityState === 'visible'`, call `router.refresh()`. On `visibilitychange` to visible, refresh once at once. Clear the timer on unmount.
- Dashboard only. The public page and history page don't poll.
- No UI beyond the updated list. A failed refresh leaves the old data on screen without an error.

## Decided by the builder's seat (my calls, change freely)

- History sort: by schedule date, not by request time.
- 30 rows per page.
- Phone numbers in history are plain text, not links.
- 5 s polling interval.
- The public count includes every pending request for the slot, with the same label for 1 or many.
- No cancel reason.

## Left to the builder

- Exact markup and copy for badges, chips, and pager, following existing classes.
- Whether to extract a small pure helper for the history query parameters (status whitelist, page clamp) so it can be unit-tested with vitest next to the code, per the project convention. A test for it is expected; the rest is thin UI and DB calls.
- Query shape for counting history pages (`count: 'exact'` with `range`).

## Risks

- **Deploy order:** if the code ships before the SQL change, "Batalkan" fails and the admin sees the generic "Gagal memperbarui" message. Run the SQL first.
- Polling means a phone with the screen locked doesn't update until the admin opens the page again. That matches the agreed scope (no notifications).
- The pending count tells everyone how contested a slot is. Intended, but it's new public information.
