# Simple timetable redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restyle every screen into a calm, timetable-like UI (one teal accent, Archivo type, plain rows instead of cards) and move the booking form into a dialog.

**Architecture:** Presentation only. Colours become semantic CSS variables that flip for dark mode once; shared classes in `globals.css` are redefined (old class names kept until every page has moved, then dead ones are deleted). The booking form moves into a native `<dialog>` client component driven by the `?slot=` URL param. No server actions, queries or validation change.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind 4, `next/font/google` (Archivo), native `<dialog>`.

**Spec:** `docs/superpowers/specs/2026-11-13-simple-timetable-redesign-design.md`

## Global Constraints

- Tailwind only; shared look lives in `@layer components` of `src/app/globals.css`. Tailwind v4 can't `@apply` a custom class, so variants repeat their base via grouped selectors.
- Palette (light): ground `#F6F7F7`, surface `#FFFFFF`, ink `#1E2227`, muted `#5F6872`, line `#DCDFE2`, alert `#B42318` (destructive actions and errors only).
- Palette (dark, follows the device): ground `#15181B`, surface `#1D2125`, ink `#E8EAEC`, muted `#9AA3AD`, line `#2D3338`.
- Accent: teal. Light = Tailwind `teal-700` (`#0F766E`); dark = a lighter teal chosen for readable contrast. `brand-*` is re-pointed from green to teal. Logo and icon fill become `#0F766E` (edit both `public/logo.svg` and `src/app/icon.svg`).
- One font family: Archivo (variable, width axis) via `next/font/google`, replacing Geist. Times and page titles: semi-condensed, bold, tabular figures. Body 16px / 1.5, small 14px. Sentence case; no all-caps, no monospace.
- No `·`-joined meta strings (use separate lines or spacing), no numbered headings, no entrance or hover animations. Only motion: the dialog opening (~180ms slide up), disabled under `prefers-reduced-motion`.
- Mobile first: 320px works with no horizontal overflow, tap targets ≥ 40px, inputs ≥ 16px.
- Selection state stays in the URL (`?date=&slot=`). Form buttons that call Server Actions use `SubmitButton`; destructive admin actions use `ConfirmForm`.
- Dialog: native `<dialog>` + `showModal()`; guard against a second `showModal()` call (React strict mode); bottom sheet below 640px (`max-height: 90dvh`, scrollable), centred from 640px; backdrop = dark tint + `backdrop-filter` blur ~5px.
- No behaviour changes: same server actions, queries, validation, copy meaning, rules (past slots disabled, honeypot, confirmations). Existing Indonesian copy is kept except the removals named in Task 2.
- Next.js 16 differs from older versions: read `node_modules/next/dist/docs/` before using an API you're unsure of.
- TDD note: this is presentational work with no new pure logic, so there are no new unit tests; the existing 21 tests are the regression guard and must stay green. Verification is lint, build, tests, and looking at the screens in the built-in browser.
- The home page reads the real Supabase database (`.env.local`); **never submit the booking form** during checks. Admin pages need a login, so they are checked through a throwaway fixture page (Task 4) that is never committed.
- Commit steps below run only with the user's go-ahead in the session (the session rule is to commit only when asked). Commit trailer: `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`.

## Review Focus

- `?slot=` naming a taken, past or invalid slot → no dialog opens and the list shows normally. (Task 3: open `/?slot=99` and a taken/past slot URL in the browser.)
- Closing the dialog by Esc, "Batal", "Selesai" or the Back button always returns to `/?date=…` with no dimmed or scroll-locked page left behind. (Task 3.)
- Backdrop tap with text typed in a field keeps the dialog open; with both fields empty it closes. (Task 3.)
- 320px: slot rows, day strip, and admin rows with a long name and phone number wrap without horizontal overflow; every tap target ≥ 40px. (Tasks 2, 3, 4.)
- Dark mode: accent text and button, muted text and struck-through taken rows stay readable (≥ 4.5:1 for text); with reduced motion on, the dialog does not animate; the dev console shows no `showModal` error. (Tasks 1, 3, 5.)

---

## File Structure

| File | Responsibility |
|---|---|
| `src/app/globals.css` | Rewrite: semantic tokens, redefined shared classes, dialog styles |
| `src/app/layout.tsx` | Archivo font, quiet header, left-aligned footer |
| `public/logo.svg`, `src/app/icon.svg` | Fill `#15803d` → `#0F766E` |
| `src/app/page.tsx` | Day strip, slot rows, "Tanggal lain", dialog mount |
| `src/components/BookingDialog.tsx` | Create: native `<dialog>` wrapper bound to the URL |
| `src/components/BookingForm.tsx` | Restyle; add `onClose`; success view with "Selesai" |
| `src/components/AdminDashboard.tsx` | Rows, text actions |
| `src/components/BookingHistory.tsx` | Rows, status words, underlined tabs |
| `src/app/admin/history/page.tsx`, `src/app/admin/login/page.tsx` | Restyle |
| `CLAUDE.md` | Styling notes updated |

## Task order

Task 1 first (tokens and classes everything else uses). Tasks 2 → 3 (dialog replaces the form section Task 2 leaves in place). Task 4 is independent of 2–3. Task 5 last.

---

### Task 1: Foundation — tokens, font, shared classes, header, footer, logo

**Files:**
- Modify: `src/app/globals.css`, `src/app/layout.tsx`, `public/logo.svg`, `src/app/icon.svg`

**Interfaces:**
- Produces, as Tailwind colour utilities: `bg-ground`, `bg-surface`, `text-ink`, `text-muted`, `border-line`, `text-alert`, `bg-accent`, `text-accent`, `text-on-accent` (all flip in dark mode via CSS variables, so components need no `dark:` for them).
- Produces shared classes (the old names `.card`, `.card-success`, `.badge-*`, `.chip*`, `.slot*`, `.bar` stay defined until Task 5):
  - `.title` — page heading: semi-condensed, bold, 1.75rem.
  - `.time` — slot time: semi-condensed, bold, tabular figures, 1.375rem / 1.1.
  - `.row` — list row: flex, `border-b border-line`, vertical padding, min-height 3rem (≥ 40px target when it is a link).
  - `.tab`, `.tab-active` — text tabs for the day strip and filters; active = accent underline.
  - Redefined: `.btn-primary` (solid accent), `.btn-ghost` (plain ink text button, ≥ 40px tall), `.btn-danger` (alert-coloured text button), `.input` (16px, `line` border, `surface` background, accent focus ring), `.alert-error`, `.muted`, `.link`.
  - `.sheet` — the dialog: bottom sheet below 640px, centred from 640px; `::backdrop` with tint + blur; slide-up animation wrapped in `@media (prefers-reduced-motion: no-preference)`.

- [ ] **Step 1: Create branch** `git switch -c feat/simple-timetable-redesign` (from the current branch).
- [ ] **Step 2: Tokens.** In `globals.css`, define light variables in `:root` and dark values in `@media (prefers-color-scheme: dark)`; map them in `@theme inline` to the `--color-*` names above. Dark alert and dark accent are chosen for ≥ 4.5:1 text contrast on the dark ground. Re-point `--color-brand-*` to `var(--color-teal-*)`. Body uses `bg-ground text-ink font-sans`.
- [ ] **Step 3: Font.** In `layout.tsx` replace Geist with `Archivo({ variable: "--font-archivo", subsets: ["latin"], axes: ["wdth"] })` and set `--font-sans` to it. Check `node_modules/next/dist/docs/` for the `axes` option on variable fonts.
- [ ] **Step 4: Shared classes.** Add/redefine the classes in the Interfaces block. `.title` and `.time` use `font-stretch` semi-condensed (87.5%).
- [ ] **Step 5: Header/footer.** Header: hairline bottom border (`border-line`), no filled bar, logo at 24px beside the wordmark in ink. Footer tagline left-aligned within the same column width, muted.
- [ ] **Step 6: Logo and icon.** Change the fill to `#0F766E` in both SVG files.
- [ ] **Step 7: Verify.** `npm run lint && npm run build && npm test`. Expected: all pass, 21 tests. Start `npm run dev` (background), open `http://localhost:3000` in the built-in browser: page renders in Archivo, teal logo, no console errors; old screens still look intact (old classes remain). Check dark via `resize_window` with `colorScheme: "dark"`.
- [ ] **Step 8: Commit** `style: tokens, Archivo, teal accent`.

---

### Task 2: Resident page — day strip and slot rows

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: classes from Task 1.
- Produces: the page still renders `BookingForm` below the list (replaced in Task 3); slot rows link to `/?date=${date}&slot=${hour}`.

- [ ] **Step 1: Header block.** `h1.title` "Jadwal Lapangan" and the one-line helper `Pilih tanggal dan jam, lalu kirim permintaan. Tanpa akun.` (muted). Remove the numbered `h2` headings ("1. Pilih tanggal", "2. Pilih jam", "3. Isi data Anda") and the line "Pilih jam yang tersedia untuk melanjutkan."
- [ ] **Step 2: Day strip.** Seven `Link`s with `.tab` / `.tab-active`, horizontally scrollable at narrow widths, each showing the label (`Hari ini`, `Besok`, short weekday) and the day number with short month on a second line; keep `aria-current="date"` and `scroll={false}`. No pills or filled chips.
- [ ] **Step 3: "Tanggal lain".** Wrap the existing GET date form in `<details>` whose `<summary class="link">` reads `Tanggal lain`; keep the input (`id="date"`, `min={today}`) and the "Lihat" button unchanged in behaviour.
- [ ] **Step 4: Slot rows.** A `<ul>` of `.row` items. Free slot: a `Link` row with `.time` on the left and, on the right, `Tersedia` in the accent colour and, when `pending.get(hour)` > 0, `N peminta` as a second muted line (no `·`). Taken/past: muted row, `.time` struck through, right side `Sudah dibooking` / `Sudah lewat`. The selected slot's row gets `aria-current="true"`. Logic (`booked`, `isPast`, `pending`, `canSelect`) is unchanged.
- [ ] **Step 5: Verify.** `npm run lint && npm run build && npm test` pass. In the browser at `/`: rows read as a timetable; at 320px (`resize_window` width 320) no horizontal overflow and each free row ≥ 40px tall; dark mode readable (muted and struck rows); `/?slot=99` and a past-hour slot URL show the list with no form. Do not submit anything.
- [ ] **Step 6: Commit** `style: timetable rows on the resident page`.

---

### Task 3: Booking dialog

**Files:**
- Create: `src/components/BookingDialog.tsx`
- Modify: `src/components/BookingForm.tsx`, `src/app/page.tsx`, `src/app/globals.css` (only if `.sheet` needs adjustment)

**Interfaces:**
- Produces `BookingDialog({ closeHref, children }: { closeHref: string; children: (close: () => void) => React.ReactNode }): JSX.Element` — client component; renders `<dialog className="sheet">`; calls `showModal()` on mount unless already open; on dialog `close` event runs `router.replace(closeHref, { scroll: false })`; backdrop click (event target is the dialog element itself) closes it only when no `input[name=name]` / `input[name=phone]` inside has a value; returns the children render-prop a `close` function that calls `dialog.close()`.
- Changes `BookingForm({ date, hour, summary, onClose }: { date: string; hour: number; summary: string; onClose: () => void })` — heading shows the time range and date; "Kirim permintaan booking" primary button; "Batal" (`.btn-ghost`, `type="button"`, calls `onClose`); success view keeps the existing text and shows "Selesai" calling `onClose`. The hidden `date`, `hour`, honeypot `website` and action stay as they are.
- Consumes: `closeHref = ``/?date=${date}```.

- [ ] **Step 1: `BookingDialog.tsx`** per the Interfaces block. Open/close state is the URL: the component is mounted only while `?slot=` is valid, and unmounts when the URL changes.
- [ ] **Step 2: Restyle `BookingForm`** inside the sheet: no card wrapper, labels above inputs (≥ 16px text, `.input`), heading using `.title`, summary muted, error via `.alert-error`, the honeypot unchanged. Success view without the emoji card styling: plain heading, the existing two sentences, "Selesai".
- [ ] **Step 3: Mount in `page.tsx`.** Replace the old "Isi data Anda" section: when `canSelect`, render `<BookingDialog key={`${date}-${selected}`} closeHref={`/?date=${date}`}>{(close) => <BookingForm … onClose={close} />}</BookingDialog>`. Remove the `#form` anchor from slot links.
- [ ] **Step 4: Sheet styles.** Confirm `.sheet`: full width, `margin-top: auto`, rounded top corners, `max-height: 90dvh`, `overflow-y: auto`, `surface` background, safe-area bottom padding; from 640px: centred, `max-w-md`, fully rounded. `::backdrop`: ink at ~40% plus `backdrop-filter: blur(5px)`. Slide-up keyframes only inside `@media (prefers-reduced-motion: no-preference)`, ~180ms.
- [ ] **Step 5: Verify.** `npm run lint && npm run build && npm test` pass. In the browser (do not submit): open `/`, tap a free slot → dialog opens, background dimmed and blurred, focus is inside, URL has `?slot=`; Esc closes and URL returns to `/?date=…`; reopen, Back button closes it; "Batal" closes; type in the name field then click the backdrop → stays open; clear the field then click the backdrop → closes; `/?slot=99` and a taken/past slot URL → no dialog; at 320px the sheet is scrollable and the send button reachable; dark mode readable; console shows no errors (including no `showModal` InvalidStateError in dev).
- [ ] **Step 6: Commit** `feat: booking form in a dialog`.

---

### Task 4: Admin — dashboard, history, login

**Files:**
- Modify: `src/components/AdminDashboard.tsx`, `src/components/BookingHistory.tsx`, `src/app/admin/history/page.tsx`, `src/app/admin/login/page.tsx`
- Create (throwaway, never committed): `src/app/preview/page.tsx`

**Interfaces:**
- Consumes: Task 1 classes. Component props and exports are unchanged (`AdminDashboard`, `BookingHistory`, `HistoryRow`, `Booking`).

- [ ] **Step 1: Dashboard rows.** Each pending/approved item becomes a `.row`-style block (no `.card`): the date as a muted line, the time range in `.time`, then name and the phone number on separate lines (no `·`). Actions: "Setujui" stays `.btn-primary` and is the only solid button; "Tolak" and "Batalkan" use `.btn-danger` (text), still inside `ConfirmForm`; "Telepon" and "WhatsApp" are `.btn-ghost`/`.link` text actions. The pending/approved counts appear as plain text next to the section titles (no badge pills). Empty states are plain muted lines. Header: title `.title`, "Riwayat" and "Keluar" as text buttons; wraps cleanly at 320px.
- [ ] **Step 2: History rows.** Same row pattern; the status is a plain word (`Menunggu`, `Disetujui`, `Ditolak`, `Dibatalkan`) in muted or ink text, with no badge. Status filters use `.tab`/`.tab-active`. Remove `BADGE`. Pager links are text buttons. `Diminta …` stays as a muted line.
- [ ] **Step 3: Login.** Plain form on the ground background (no card), title `.title`, labels above inputs, `SubmitButton className="btn-primary w-full"`, error via `.alert-error`.
- [ ] **Step 4: Fixture page (throwaway).** Create `src/app/preview/page.tsx` rendering `AdminDashboard` with a few fixtures (include a very long name and a long phone string, both lists non-empty, plus an `error` case) and `BookingHistory` with rows of each status, with and without a pager. Add a note at its top: delete before finishing.
- [ ] **Step 5: Verify.** `npm run lint && npm run build && npm test` pass. In the browser open `/preview`, `/admin/login`: 320px no horizontal overflow, targets ≥ 40px, long strings wrap, destructive actions are red text only, only "Setujui" is solid; dark mode readable. Also open `/admin/history` signed out → redirects to login (no data shown).
- [ ] **Step 6: Commit** `style: admin dashboard, history and login`. (Do not stage `src/app/preview/`.)

---

### Task 5: Cleanup and docs

**Files:**
- Modify: `src/app/globals.css`, `CLAUDE.md`
- Delete: `src/app/preview/page.tsx` (and its folder)

- [ ] **Step 1: Delete dead classes.** For each of `.card`, `.card-success`, `.badge-warn`, `.badge-ok`, `.badge-bad`, `.badge-off`, `.chip`, `.chip-active`, `.slot`, `.slot-selected`, `.slot-off`, `.bar`: run `grep -rn "<name>" src` (class names as used in `className`); remove from `globals.css` only those with no hits, and fix any hit. Expected: none left in use.
- [ ] **Step 2: Delete the fixture.** Remove `src/app/preview/`. Expected: `git status` shows no `preview` path and `npm run build` route list has no `/preview`.
- [ ] **Step 3: Leftover scan.** `grep -rnE "green-|zinc-|Geist" src` and `grep -rn "dark:" src/components src/app/*.tsx src/app/admin`: only token definitions in `globals.css` may remain; otherwise convert to semantic tokens. `grep -rn " · " src/components src/app` shows no joined meta strings in rendered UI.
- [ ] **Step 4: Update `CLAUDE.md`** styling paragraph: semantic tokens (ground, surface, ink, muted, line, alert, accent) flip in dark mode via variables so components rarely need `dark:`; the current shared class set (`.title`, `.time`, `.row`, `.tab*`, `.btn-*`, `.input`, `.sheet`, `.alert-error`, `.muted`, `.link`); Archivo; `brand-*` is teal and the logo/icon fill is `#0F766E`; the booking form lives in `BookingDialog` bound to `?slot=`; no cards or badges. Keep every other rule.
- [ ] **Step 5: Final verify.** `npm run lint && npm run build && npm test` pass (21 tests). Re-check `/` and `/admin/login` in the browser in light and dark at 320px, with reduced-motion emulated if available; console clean.
- [ ] **Step 6: Commit** `style: remove old card styles, update docs`.
