# FlipGauge Production v0.1 Setup

## 1. Create the Supabase project

Create a new Supabase project. This creates the PostgreSQL database and Auth service.

## 2. Run the database migration

Open **SQL Editor** in Supabase and run:

`supabase/migrations/0001_production_foundation.sql`

Optionally run `supabase/seed.sql` afterward.

## 3. Configure authentication

In Supabase:

1. Open **Authentication → URL Configuration**.
2. Set the local Site URL to `http://localhost:3000`.
3. Add redirect URL `http://localhost:3000/**`.
4. When deployed, add the Vercel production URL and preview wildcard.
5. Keep email confirmation enabled for production.

## 4. Configure environment variables

Copy `.env.example` to `.env.local`.

Use the Supabase **publishable key**, not the server secret, for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The `SUPABASE_SECRET_KEY` is intentionally unused in this release. Keep it server-only when future background jobs require it.

## 5. Install and run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## 6. Test the complete auth path

1. Create an account.
2. Confirm the email.
3. Sign in.
4. Confirm `/dashboard` is protected while signed out.
5. Request a password recovery email.
6. Set a new password.
7. Sign out.

## 7. Deploy to Vercel

Import this project into Vercel and add the same environment variables.

Set:

`NEXT_PUBLIC_SITE_URL=https://YOUR_PRODUCTION_DOMAIN`

Then add that production URL to Supabase Authentication redirect URLs.

## Security choices already included

- Cookie-based server-side sessions.
- Session refresh through Next.js `proxy.ts`.
- Server verification with `auth.getUser()`.
- Password validation.
- Safe post-login redirects.
- Row Level Security on every user-data table.
- Organization-aware access policies.
- Provider credentials represented only by an encrypted reference.
- No secret keys shipped to browser code.
