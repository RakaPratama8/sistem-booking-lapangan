# Simple timetable redesign

Date: 2026-11-13. Status: approved in conversation ("Go ahead"); short design.

## Intent and why

The UI is functional but busy: white rounded cards, pills, chips and a three-section page ("1. 2. 3."). The owner wants it simpler: calmer, fewer elements, fewer steps to book. The subject is a neighbourhood sport field used by residents and one admin, almost always on a phone, so the design should read like a timetable: clear times, plain-word status, little decoration.

## Goals

- Every screen redesigned: resident page, booking form, admin dashboard, admin history, admin login, header, footer, logo/icon.
- Booking takes fewer steps: tap a slot, fill two fields, send.
- One accent colour; everything else neutral.
- One row pattern shared by resident slots, admin lists and history.

## Non-goals

- No behaviour changes: same server actions, queries, validation, copy meaning, rules (past slots disabled, honeypot, confirmations).
- No new features, no dark-mode toggle (dark still follows the device), no extra fonts beyond one family.
- Resident accounts, notifications etc. stay out of scope (see `CLAUDE.md`).

## Anti-goals

- A design that drifts back to the card/pill look.
- Decoration that does not carry information (numbering, all-caps labels, eyebrows, gradient washes, `·`-joined meta strings, entrance animations).
- Losing the 320px / 40px tap target / 16px input rules, or the URL-as-state rule.

## Constraints

From `CLAUDE.md`: Tailwind only; shared look in `@layer components` of `src/app/globals.css`; use `brand-*` colour classes; mobile first (320px, taps ≥ 40px, inputs ≥ 16px); `SubmitButton` for server-action forms; `ConfirmForm` for destructive admin actions; selection state in the URL (`?date=&slot=`); logo is `public/logo.svg` + `src/app/icon.svg` (hard-coded fill, edit both); read `node_modules/next/dist/docs/` before using an unfamiliar Next 16 API.

## Approaches

The only real fork was how the booking form appears after picking a slot.

| | How | Trade-off |
|---|---|---|
| Separate section below the list (today) | Form under the grid, scrolled to with `#form` | Extra scroll, extra "step 3" |
| Inline, opens inside the slot row | Row expands | Short, but the list jumps and the form competes with the timetable |
| **Dialog (chosen by the owner)** | Native `<dialog>` as a bottom sheet on phones, centred from 640px; background dimmed and lightly blurred | Needs a small client component; keyboard handling on iOS must be checked |

## Design

### Tokens

- **Colour, light:** ground `#F6F7F7`, surface `#FFFFFF`, ink `#1E2227`, muted `#5F6872`, line `#DCDFE2`, alert `#B42318` (destructive actions and errors only).
- **Colour, dark** (follows the device): ground `#15181B`, surface `#1D2125`, ink `#E8EAEC`, muted `#9AA3AD`, line `#2D3338`.
- **Accent: teal.** `brand-*` is re-pointed from Tailwind green to teal (`teal-700` = `#0F766E` is the main accent in light mode; a lighter teal in dark mode). Used for "free or act now": free-slot status, the active day, the primary button. Logo and icon fill become `#0F766E`.
- **Semantic tokens as CSS variables** that flip in dark mode once, so components rarely need `dark:` variants. *(My call, to keep the stylesheet small; the `CLAUDE.md` rule about `dark:` is updated to match.)*

### Type

One family, **Archivo** (variable, with the width axis), via `next/font/google`, replacing Geist. Slot times and page titles: semi-condensed width, bold, tabular figures. Body: normal width, 16px / 1.5. Small text 14px. Sentence case everywhere; no all-caps, no monospace.

### Layout

Left-aligned. Single column about 32rem wide. Hairline dividers (`line` colour) and spacing group content; no cards. Surface colour is used only for the dialog.

Resident page: header (small logo + wordmark), title and one helper line, a day strip (7 text tabs, active one underlined in the accent; "Hari ini" / "Besok" kept), a quiet "Tanggal lain" disclosure holding the native date input, then the slot list. Each row: time on the left (large, condensed), status on the right in plain words (`Tersedia`, `Sudah dibooking`, `Sudah lewat`); a free slot with pending requests shows the count as a second muted line (`2 peminta`), not joined with a dot. Taken and past rows are muted with the time struck through.

Booking dialog: opens when `?slot=` names a valid, free, not-yet-started slot; the slot and date are the heading; fields Nama and Nomor HP; primary button "Kirim permintaan booking"; "Batal" below. After sending, the dialog shows the existing confirmation and a "Selesai" button.

Admin dashboard and history: same rows. "Setujui" is the only solid button; "Tolak" and "Batalkan" are quiet red text (still behind `ConfirmForm`); Telepon / WhatsApp are text links. History status is a plain word, status filters are underlined text tabs. Login: plain form, no card.

### Dialog behaviour

- Native `<dialog>` + `showModal()` (focus trap, Esc, inert background). Guard against calling `showModal()` twice (React strict mode).
- Backdrop: dark tint plus `backdrop-filter: blur(~5px)`; tint alone where blur is unsupported.
- URL is the state: open ↔ `?slot=` present. Closing (Batal, Esc, backdrop, Selesai) replaces the URL with `/?date=…`, so Back also closes it.
- Backdrop tap closes only if no field has been typed in; Esc and "Batal" always close. *(My call.)*
- Bottom sheet below 640px, `max-height: 90dvh`, scrollable, so the iOS keyboard can't hide the send button. Slide up ~180ms; no animation under `prefers-reduced-motion`.

### Motion

Only the dialog opening. Nothing animates on page load or hover.

### Copy

Existing Indonesian copy is kept. Removed: the "1. 2. 3." headings and the "Pilih jam yang tersedia untuk melanjutkan." line. `·` separators between facts become separate lines or spacing.

## Left to the builder

- Exact Tailwind classes and the names of shared classes in `globals.css` (expect to delete `.card`, `.card-success`, `.badge-*`, `.chip*`, `.slot*`, `.bar` and add a row, tab and sheet set).
- Whether `tabular-nums` takes effect in Archivo; if not, accept proportional figures.
- The lighter teal used for the accent in dark mode, chosen for readable contrast.

## Risks

- iOS keyboard + bottom sheet behaviour is untested until built.
- `backdrop-filter` costs frames on very old phones; the tint-only fallback is acceptable.
- Admin screens need a login, so they are checked visually through a throwaway fixture page that is not committed.
