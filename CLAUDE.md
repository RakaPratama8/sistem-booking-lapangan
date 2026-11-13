# Booking Lapangan

Booking system for one neighborhood sport field. Residents (no accounts) pick a date, see free slots, and submit name + phone. One admin approves or rejects. Approved slots show as booked for everyone.

**Out of scope (don't add without asking):** online payment, resident accounts, multiple fields, recurring bookings, notifications.

Stack: Next.js 16 (App Router) + TypeScript + Tailwind 4, Supabase (Postgres + Auth for the admin), Vercel.

> Next.js 16 differs from older versions (e.g. `middleware.ts` is now `src/proxy.ts`). Read `node_modules/next/dist/docs/` before using an API you're unsure of.

## Commands
- `npm run dev` / `npm run build` / `npm run lint`
- `npm test` (vitest, unit tests live next to the code as `*.test.ts`)

## Architecture rules
- **Slots live in code**: `src/lib/slots.ts` (`SLOT_HOURS`, `TZ`). No slots table. Dates are `YYYY-MM-DD` strings in `Asia/Jakarta`.
- **Table `bookings`** (`supabase/schema.sql`): `date`, `start_hour`, `name`, `phone`, `status` = `pending | approved | rejected | cancelled` (admin cancels an approved booking; the row is kept for history, and the slot frees up because the unique index only covers `approved`). Existing databases need `supabase/upgrade-2026-11-13-cancelled.sql` once, before deploying.
- **Double-booking is blocked by the DB**: partial unique index on `(date, start_hour) where status='approved'`. Pending requests may overlap and don't block a slot. Don't re-implement this check in app code; handle the `23505` error (see `src/app/admin/actions.ts`).
- **All DB access is server-side** via `src/lib/supabase/server.ts`. RLS is on with no policies, so the anon key reads nothing. `SUPABASE_SERVICE_ROLE_KEY` must never reach client code or a `NEXT_PUBLIC_*` var.
- The public page may expose only `date` + `start_hour` of approved bookings, plus a per-slot count of pending requests (a number only). Never names or phones.
- **Admin** = one Supabase Auth user whose email equals `ADMIN_EMAIL`. Every admin page and action calls `requireAdmin()` (`src/lib/admin.ts`); `src/proxy.ts` is only a convenience redirect and session refresh.
- Mutations are Server Actions (`src/app/actions.ts`, `src/app/admin/actions.ts`). No REST API layer.
- UI text is Indonesian. Styling is Tailwind only; light/dark follows the device (`dark:` variants live inside the component classes, not in pages). Shared look lives in `@layer components` in `src/app/globals.css` (`.card`, `.input`, `.btn-*`, `.chip*`, `.slot*`, `.alert-error`, `.muted`, `.link`, …); reuse them instead of repeating long class lists, and add `dark:` there. Tailwind v4 can't `@apply` a custom class, so variants repeat their base via grouped selectors. **Branding:** name/tagline in `src/lib/config.ts`; color = the `--color-brand-*` block in `globals.css` (use `brand-*` classes, never `green-*`); logo = `public/logo.svg` + `src/app/icon.svg` (hard-coded fill, edit both). **Mobile first** (admin mostly uses a phone): keep layouts working at 320px, tap targets ≥ 40px, inputs ≥ 16px text (stops iOS zoom). Admin UI is `src/components/AdminDashboard.tsx`; `/admin/history` (`src/components/BookingHistory.tsx`, read-only, every booking of every status, `?status=&page=`) is linked from it; form buttons that call server actions use `SubmitButton` (shows "Memproses…", blocks double taps). Destructive admin actions use `src/components/ConfirmForm.tsx`; admin contacts residents via `tel:` and `waLink()` (`src/lib/validate.ts`). Selection/date state lives in the URL (`?date=&slot=`), not client state. Slots whose hour already started today are disabled in the UI and rejected server-side.

## Env vars (`.env.local`; on Vercel: Project Settings → Environment Variables)
See `.env.example`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_EMAIL`.

## First-time setup
1. Create a Supabase project and run `supabase/schema.sql` in the SQL editor.
2. Supabase → Authentication → Users → add the admin (email + password, auto-confirm). Disable public sign-ups in Auth settings.
3. Copy `.env.example` to `.env.local` and fill it in.
4. `npm run dev`; admin is at `/admin`.
5. Deploy: push to GitHub, import into Vercel, set the 4 env vars.

## Known limits
- Residents get no status update after submitting; the admin calls them using the phone number.
- Anti-spam is a honeypot only (no rate limiting).