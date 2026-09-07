# Supabase setup

Human-only steps to give Rastafari a shared Postgres database. Agents cannot create a Supabase project or paste secrets into Cursor. After this is done, agents can run the Next.js dev server and persist users, shops (artist studios), reviews, claims, products, courses, ads, and analytics.

Without these keys the app still runs. Admin shows `Database: this browser (localStorage)` and `GET /api/store` returns `{"backend":"local"}`.

## What the repo already does

- Schema lives in `supabase/schema.sql`.
- Server access is `src/lib/supabase.ts` + `src/lib/db.ts`. The browser talks to `/api/store`, never to Postgres.
- First load with working credentials **seeds** demo users, shops, reviews, products, courses, and ads if `shops` is empty.
- Cloud Agent install/dev server is already in `.cursor/environment.json` (`npm ci`, `npm run dev` on port `43127`). Do **not** put secrets in that file.

## 1. Create a Supabase project

1. Open [https://supabase.com](https://supabase.com) and create a project.
2. Wait until the project is healthy.
3. SQL Editor → New query → paste the full contents of `supabase/schema.sql` → Run.
4. Settings → API. Copy:
   - **Project URL** (`https://<project-ref>.supabase.co`)
   - **anon / public** key
   - **service_role** key (server only; never ship this to the browser or commit it)

The schema enables Row Level Security. Public reads cover shops, published reviews, products, courses, and active ads. Writes and private rows (users, pending reviews, reports, claims, events) go through the Next.js server with the service role key, which bypasses RLS.

## 2. Laptop (local `.env.local`)

From the repo root:

```bash
cp .env.example .env.local
```

Fill at least:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

`NEXT_PUBLIC_*` must be set **before** `npm run dev` starts. Restart the dev server after editing.

Optional:

```bash
AUTH_SECRET=<long-random-string>
AUTH_URL=http://127.0.0.1:43127
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Google OAuth is not required for Supabase. Demo sign-in still upserts the user into `public.users` when the database is connected.

`.env.local` is gitignored. Never commit keys.

## 3. Cursor Cloud Agent environment

Secrets are injected as environment variables on **new** agent VMs. This does not update an already-running agent.

1. Open [Cloud Agents secrets](https://cursor.com/dashboard/cloud-agents) (or environment-scoped secrets for this repo’s environment).
2. Add the same three names as in `.env.example`:

| Name | Value |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role key |

3. Optional, same Secrets tab: `AUTH_SECRET`, `AUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
4. Start a **new** Cloud Agent after saving. The current session will not pick up new secrets.

`NEXT_PUBLIC_*` must be present when the `dev` terminal runs `npm run dev`. Cursor secrets are exported into that environment.

If the environment later uses a restricted egress allowlist, allow `<project-ref>.supabase.co` (or `*.supabase.co`). This app uses the HTTPS Data API (`supabase-js`), not a direct Postgres port, so Supabase Database → Network Restrictions do not apply.

## 4. Verify

Restart `npm run dev` (laptop) or start a new agent (Cloud).

| Check | Expected |
| --- | --- |
| `GET /api/store` | `"backend":"supabase"` and a `state` object with shops/reviews |
| Sign in as admin | Admin header: `Database: Supabase (shared)` |
| Sign in as artist or client | Row appears in `public.users` |
| Submit a review and confirm email | Row in `public.reviews`; after verify, `status` is `published` |
| Claim / import a studio | Row in `public.shops` (and `public.claims` if claimed) |

If Admin still says `this browser (localStorage)`:

- The process started without the env vars (`NEXT_PUBLIC_SUPABASE_URL` empty).
- You are still on an old Cloud Agent VM (start a new one).
- `supabase/schema.sql` was not applied (`GET /api/store` returns 500 with a hint to run the SQL).

## 5. Reset

Admin → **Reset database** (only when backend is Supabase) truncates app tables via `clear_app_data()` and re-seeds. That wipes all user-generated shops, reviews, and claims in that project. Use a dedicated staging project, not production data.

## Do not

- Put keys in `.cursor/environment.json`, Dockerfiles, or committed scripts.
- Use the service role key in client components. Only `/api/store` and auth routes import `src/lib/db.ts`.
- Point Cloud Agents at a production database if you are not comfortable with agents writing seed/reset data.
