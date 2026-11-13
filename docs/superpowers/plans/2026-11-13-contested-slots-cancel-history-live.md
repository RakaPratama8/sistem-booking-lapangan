# Contested slots, cancel, history, live dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Residents see how many pending requests each free slot has; the admin can cancel approved bookings, browse the full booking history, and see new requests appear on the dashboard without reloading.

**Architecture:** Same shape as today: server components query Supabase with the service-role client, mutations are Server Actions guarded by `requireAdmin()`. Cancel adds a `cancelled` status (row kept). Pure logic (counting, history query params, date formatting) lives in `src/lib/` with vitest tests; UI is thin. Live updates are a small client component that calls `router.refresh()` on a timer.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind 4, Supabase (`@supabase/supabase-js`, `@supabase/ssr`), vitest.

**Spec:** `docs/superpowers/specs/2026-11-13-contested-slots-cancel-history-live-design.md`

## Global Constraints

- All DB access is server-side via `createAdminClient()` (`src/lib/supabase/server.ts`). RLS stays on with no policies. No browser Supabase client.
- Every admin page and action calls `requireAdmin()` (`src/lib/admin.ts`).
- Double-booking is blocked only by the DB unique index `(date, start_hour) where status='approved'`. Do not re-implement it in app code.
- The public page may expose only: `date` + `start_hour` of approved bookings, and a per-slot pending **count**. Never names or phones.
- UI text is Indonesian. Tailwind only; reuse shared classes in `src/app/globals.css` and put `dark:` variants there. Use `brand-*`, never `green-*`.
- Mobile first: layouts must work at 320px with no horizontal overflow, tap targets ≥ 40px, inputs ≥ 16px text.
- Form buttons that call Server Actions use `SubmitButton`; destructive admin actions use `ConfirmForm`.
- Selection/filter state lives in the URL (`?status=&page=`), not client state.
- Next.js 16 differs from older versions: read `node_modules/next/dist/docs/` before using an API you're unsure of.
- Unit tests live next to the code as `*.test.ts` (vitest, `npm test`). Existing style: `import { expect, test } from "vitest"`, one-line tests.
- Commit steps below run only with the user's go-ahead in the session (the session rule is to commit only when asked). Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.
- Out of scope: resident accounts, linking competing requests, notifications, statistics/export, cancel reasons, resident self-cancel.

## Review Focus

- Home page pending-count query fails → slots still render as `Tersedia`, no count, no extra error banner. (Task 2: `countByHour` of null/undefined is empty.)
- History URL junk: `?page=abc`, `0`, `-1`, `2.5`, `999`, and `?status=hack` → fall back to page 1 / last page / Semua, never a crash or empty-by-mistake. (Task 3: `parsePage`, `parseStatus`, `lastPage` tests.)
- A request made at 17:05 UTC shows as 00:05 the **next day** in Jakarta, and never as `24.05`. (Task 3: `formatRequested` test.)
- Cancel pressed on a card whose booking was already cancelled (stale page, double tap) → no error page; the row stays `cancelled` and the admin lands on `/admin`. (Task 1: manual check; the update is guarded by `status='approved'`.)
- History with no rows (or a filter with no matches) → an empty-state card, no pager. (Task 3: manual check.)

---

## File Structure

| File | Responsibility |
|---|---|
| `supabase/schema.sql` | Modify: status check gains `'cancelled'` (new installs) |
| `supabase/upgrade-2026-11-13-cancelled.sql` | Create: one-time ALTER for existing databases |
| `src/app/admin/actions.ts` | Modify: add `cancelBooking` |
| `src/components/AdminDashboard.tsx` | Modify: "Batalkan" on approved cards, "Riwayat" link, render `AutoRefresh` |
| `src/lib/slots.ts` + `src/lib/slots.test.ts` | Modify/Create: `countByHour` |
| `src/app/page.tsx` | Modify: pending query + count label |
| `src/lib/history.ts` + `src/lib/history.test.ts` | Create: statuses, labels, URL param parsing, `formatRequested` |
| `src/components/BookingHistory.tsx` | Create: history list, status chips, pager |
| `src/app/admin/history/page.tsx` | Create: guarded page that queries and renders history |
| `src/app/globals.css` | Modify: badge styles for rejected and cancelled |
| `src/components/AutoRefresh.tsx` | Create: polling client component |
| `CLAUDE.md` | Modify: privacy rule, statuses, Known limits, history route |

## Task order

Task 1 → 3 (history needs the `cancelled` status). Tasks 2 and 4 are independent of the others.

---

### Task 1: Cancel an approved booking

**Files:**
- Modify: `supabase/schema.sql:8`
- Create: `supabase/upgrade-2026-11-13-cancelled.sql`
- Modify: `src/app/admin/actions.ts:26-38`
- Modify: `src/components/AdminDashboard.tsx` (approved list, lines 81-86)
- Modify: `CLAUDE.md` (Table `bookings` line, Known limits)

**Interfaces:**
- Produces: `cancelBooking(form: FormData): Promise<void>` exported from `src/app/admin/actions.ts`; DB status value `'cancelled'` used by Task 3.

- [ ] **Step 1: Create branch.** `git switch -c feat/contested-cancel-history-live` (currently on `main`).
- [ ] **Step 2: Update `supabase/schema.sql`** so the `status` check is `in ('pending', 'approved', 'rejected', 'cancelled')`.
- [ ] **Step 3: Create `supabase/upgrade-2026-11-13-cancelled.sql`** containing exactly the two statements from the spec (drop `bookings_status_check`, re-add it with four values), preceded by a comment: run once in the Supabase SQL editor **before deploying** this code.
- [ ] **Step 4: Extend `setStatus(form, status, from?)`** in `src/app/admin/actions.ts`: `status` accepts `"cancelled"`; when `from` is given the update also filters `.eq("status", from)`. Add `export const cancelBooking = async (form: FormData) => setStatus(form, "cancelled", "approved")`. `approveBooking`/`rejectBooking` behave as before. Zero rows matched is not an error (redirects to `/admin`).
- [ ] **Step 5: In `AdminDashboard.tsx`**, on each "Sudah disetujui" card add, below `Contact`, a `ConfirmForm` with `action={cancelBooking}`, message `` `Batalkan booking ${b.name} untuk ${when(b)}?` ``, a hidden `id` input, and `<SubmitButton className="btn-danger w-full">Batalkan</SubmitButton>`.
- [ ] **Step 6: Update `CLAUDE.md`:** add `cancelled` to the `status` list in the `bookings` line, and delete the "An approved booking can't be cancelled from the UI" bullet under Known limits.
- [ ] **Step 7: Verify.** Run `npm run lint && npm run build && npm test`. Expected: all pass. If `.env.local` points at a Supabase project with the upgrade SQL applied, also run `npm run dev`, approve a test booking, click Batalkan, confirm: the card disappears from "Sudah disetujui", the home page shows that slot as `Tersedia`, and a second pending request for it can now be approved. If no Supabase env is available, say so in the report instead of claiming this was exercised.
- [ ] **Step 8: Commit** `feat: admin can cancel approved bookings`.

---

### Task 2: Contested slots on the public page

**Files:**
- Modify: `src/lib/slots.ts`
- Create: `src/lib/slots.test.ts`
- Modify: `src/app/page.tsx:15-23` (queries), `:62-77` (free slot markup)
- Modify: `CLAUDE.md` (public-page privacy rule)

**Interfaces:**
- Produces: `countByHour(rows: { start_hour: number }[] | null | undefined): Map<number, number>` in `src/lib/slots.ts`.

- [ ] **Step 1: Write failing tests** in `src/lib/slots.test.ts`:
  - `countByHour counts rows per start_hour`: `countByHour([{start_hour:17},{start_hour:17},{start_hour:18}])` equals `new Map([[17,2],[18,1]])`.
  - `countByHour of null or undefined is empty` (a failed query): both give `new Map()`.
- [ ] **Step 2: Run** `npx vitest run src/lib/slots.test.ts`. Expected: FAIL, `countByHour` not exported.
- [ ] **Step 3: Implement `countByHour`** in `src/lib/slots.ts`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: In `page.tsx`**, run the approved query and a second query (`start_hour` where `date` = selected date and `status='pending'`) with `Promise.all`. Build `pending = countByHour(pendingResult.data)`. Only the approved query's `error` drives the error banner; a failed pending query is ignored.
- [ ] **Step 6: Free-slot label.** In the available-slot link, the caption becomes: selected → `✓ Dipilih` (unchanged); otherwise `` `Tersedia · ${n} peminta` `` when `pending.get(hour)` is > 0, else `Tersedia`. Booked and past slots are unchanged.
- [ ] **Step 7: Update `CLAUDE.md`:** the "public page may expose only…" rule now also allows a per-slot pending count (number only).
- [ ] **Step 8: Verify.** `npm run lint && npm run build && npm test` pass. With Supabase env: submit two requests for one slot from the UI; the slot shows `Tersedia · 2 peminta`; the page's HTML contains no names or phones.
- [ ] **Step 9: Commit** `feat: show pending request count on free slots`.

---

### Task 3: Booking history

**Files:**
- Create: `src/lib/history.ts`, `src/lib/history.test.ts`
- Create: `src/components/BookingHistory.tsx`
- Create: `src/app/admin/history/page.tsx`
- Modify: `src/app/globals.css` (badges), `src/components/AdminDashboard.tsx` (link), `CLAUDE.md`

**Interfaces:**
- Consumes: DB statuses incl. `'cancelled'` (Task 1); `formatDate`, `slotLabel`, `TZ` from `src/lib/slots.ts`.
- Produces, all in `src/lib/history.ts`:
  - `PAGE_SIZE = 30`
  - `STATUSES = ["pending","approved","rejected","cancelled"] as const`; `type Status`
  - `STATUS_LABEL: Record<Status, string>` = Menunggu, Disetujui, Ditolak, Dibatalkan
  - `parseStatus(v: string | undefined): Status | null` (`null` means Semua)
  - `parsePage(v: string | undefined): number` (integer ≥ 1, else 1)
  - `lastPage(total: number): number` (`Math.max(1, Math.ceil(total / PAGE_SIZE))`)
  - `formatRequested(iso: string): string` (Jakarta time, e.g. `11 Jan 00.05`)

- [ ] **Step 1: Write failing tests** in `src/lib/history.test.ts`:
  - `parseStatus accepts each status`: for every entry of `STATUSES`, `parseStatus(s) === s`.
  - `parseStatus falls back to null`: `undefined`, `""`, `"all"`, `"hack"` → `null`.
  - `parsePage`: `"3"` → 3; `undefined`, `"abc"`, `"0"`, `"-1"`, `"2.5"` → 1.
  - `lastPage`: 0 → 1, 30 → 1, 31 → 2, 90 → 3.
  - `formatRequested uses Jakarta time`: `formatRequested("2030-01-10T17:05:00Z")` matches `/^11 Jan.*00\.05$/` (next day, `00` not `24`). Run once and pin the exact string if ICU formats differently, but keep the next-day and `00.05` assertions.
- [ ] **Step 2: Run** `npx vitest run src/lib/history.test.ts`. Expected: FAIL, module missing.
- [ ] **Step 3: Implement `src/lib/history.ts`** per the Interfaces block. `formatRequested` uses `Intl.DateTimeFormat("id-ID", { timeZone: TZ, day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })`.
- [ ] **Step 4: Run** the same command. Expected: PASS.
- [ ] **Step 5: Badge styles.** In `globals.css`, add `.badge-bad` (red, for Ditolak) and `.badge-off` (zinc, for Dibatalkan) with `dark:` variants, and add them to the grouped `.badge-warn, .badge-ok` base selector. Status → badge: pending `badge-warn`, approved `badge-ok`, rejected `badge-bad`, cancelled `badge-off`.
- [ ] **Step 6: `BookingHistory.tsx`** (server component). Props: `{ rows: HistoryRow[]; status: Status | null; page: number; lastPage: number }` where `HistoryRow = { id: string; date: string; start_hour: number; name: string; phone: string; status: Status; created_at: string }` (export it). Renders: a row of filter chips (Semua + the four statuses) as `Link`s to `/admin/history?status=…` (reuse `.chip` / `.chip-active`; scrollable like the home date chips so it fits 320px); one `.card` per row showing date + slot (as in `When`), name · phone as plain text, the status badge, and `Diminta {formatRequested(created_at)}`; an empty-state `.card muted text-center` ("Belum ada booking." / "Tidak ada booking dengan status ini.") when `rows` is empty; and, only when `lastPage > 1`, Sebelumnya / Berikutnya links keeping `status` in the URL and `Halaman {page} dari {lastPage}`. No action buttons.
- [ ] **Step 7: `src/app/admin/history/page.tsx`.** Calls `await requireAdmin()` first. Reads `searchParams` (`status`, `page`). Runs a count query (`select("id", { count: "exact", head: true })`, filtered by status when set), computes `page = Math.min(parsePage(sp.page), lastPage(total))`, then fetches rows ordered `date` desc, `start_hour` desc, `created_at` desc with `.range((page-1)*PAGE_SIZE, page*PAGE_SIZE-1)`. On any query error show the existing `.alert-error` pattern ("Data gagal dimuat. Muat ulang halaman."). Renders `BookingHistory` inside the same `main` wrapper classes as the dashboard, with a "← Dashboard" link and an `h1` "Riwayat Booking".
- [ ] **Step 8: Dashboard link.** In `AdminDashboard.tsx` header add a `btn-ghost` link "Riwayat" to `/admin/history` beside "Keluar". Let the header wrap (`flex-wrap`) so there is no horizontal overflow at 320px.
- [ ] **Step 9: Update `CLAUDE.md`:** mention `/admin/history` (read-only, all statuses, `?status=&page=`) in the Admin bullet.
- [ ] **Step 10: Verify.** `npm run lint && npm run build && npm test` pass. With Supabase env: open `/admin/history` signed in (shows all rows incl. cancelled/rejected), signed out (redirects to login), `?page=999` (last page), `?status=hack` (Semua), a filter with no matches (empty state, no pager); check at 320px width.
- [ ] **Step 11: Commit** `feat: admin booking history page`.

---

### Task 4: Live dashboard

**Files:**
- Create: `src/components/AutoRefresh.tsx`
- Modify: `src/components/AdminDashboard.tsx` (render it)

**Interfaces:**
- Produces: default export `AutoRefresh({ intervalMs }: { intervalMs?: number }): null` (client component, default `5000`).

- [ ] **Step 1: Check the API.** Confirm `useRouter().refresh()` in `node_modules/next/dist/docs/` for Next 16.
- [ ] **Step 2: Implement `AutoRefresh`** (`"use client"`, renders nothing). Behavior: every `intervalMs`, call `router.refresh()` only if `document.visibilityState === "visible"`; on `visibilitychange` to visible, call `router.refresh()` once at once; on unmount clear the interval and remove the listener. The hidden→visible case must not start a second timer.
- [ ] **Step 3: Render** `<AutoRefresh />` once inside `AdminDashboard`'s `main`. Not added to the history page or the public page.
- [ ] **Step 4: Verify.** `npm run lint && npm run build && npm test` pass. With Supabase env, open `/admin` in one tab and submit a request from `/` in another: within ~5 s the card appears with no manual reload, and the pending badge count updates. Switch away from the dashboard tab: Network panel shows no refresh requests while hidden, and one fires on return. If no Supabase env is available, say so in the report.
- [ ] **Step 5: Commit** `feat: live-refresh admin dashboard`.

---

## Final check (after Task 4)

- [ ] `npm run lint && npm run build && npm test` all pass on the branch.
- [ ] `CLAUDE.md` reflects: public count rule, `cancelled` status, `/admin/history`, Known limits entry removed.
- [ ] Remind the user to run `supabase/upgrade-2026-11-13-cancelled.sql` on their existing database **before** deploying.
