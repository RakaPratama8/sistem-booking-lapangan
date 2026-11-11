# Booking Lapangan

A simple booking system for a neighborhood sport field. Residents check which slots are free and send a booking request, with no account needed. One admin approves or rejects each request.

## How it works

1. A resident opens the page and picks a date.
2. They pick a free time slot (e.g. 16:00–17:00) and enter their name and phone number.
3. The admin logs in at `/admin`, sees the request, and approves or rejects it.
4. Approved slots show as booked for everyone.

Not included: online payment, resident accounts, multiple fields, recurring bookings, notifications. The UI is in Indonesian.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Supabase (Postgres + Auth) · Vercel

## Setup

You need Node.js 20+ and a free [Supabase](https://supabase.com) account.

1. **Create a Supabase project.** In **SQL Editor**, run the contents of `supabase/schema.sql`.
2. **Create the admin.** In **Authentication → Users → Add user**, enter an email and password and tick *Auto Confirm User*. Then in **Authentication → Sign In / Providers → Email**, turn off *Allow new users to sign up*.
3. **Set environment variables.** Run `cp .env.example .env.local` and fill it in (see below). Find the keys in **Project Settings → API**.
4. **Run it.**
   ```bash
   npm install
   npm run dev
   ```
   Residents: <http://localhost:3000> · Admin: <http://localhost:3000/admin>

### Environment variables

| Variable | What it is |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon / publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service-role / secret key. **Server only.** Never commit it or expose it to the browser. |
| `ADMIN_EMAIL` | Email of the admin user from step 2, **in lowercase** |

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | Lint the code |
| `npm test` | Run the unit tests |

## Customize

| To change | Edit |
| --- | --- |
| Opening hours / slot length | `SLOT_HOURS` in `src/lib/slots.ts` |
| Site name and tagline | `src/lib/config.ts` |
| Brand color | the `--color-brand-*` block in `src/app/globals.css` |
| Logo and browser icon | `public/logo.svg` and `src/app/icon.svg` (change both) |

## Deploy

1. Push the code to a GitHub repository.
2. Import the repository in [Vercel](https://vercel.com/new).
3. Add the four environment variables above, then deploy.

## Known limits

- Residents get no confirmation after submitting. The admin contacts them by phone or WhatsApp (buttons are on each booking).
- Spam protection is a hidden form field only, with no rate limiting.
- An approved booking can't be cancelled from the UI. Edit the row in Supabase instead.

See [`CLAUDE.md`](CLAUDE.md) for architecture rules and project conventions.
