# DH Hospitals API

The public website remains a Vite application. This directory contains a
separate Next.js API service and owns all PostgreSQL access and secrets. During
development, Vite proxies `/api` requests to the API service.

## Requirements

- Node.js 20.19+.
- PostgreSQL 14 or newer.

## Configure PostgreSQL

Create a PostgreSQL database and user, then copy `server/.env.example` to
`server/.env` and replace every example value:

```powershell
Copy-Item server\.env.example server\.env
```

Set `DATABASE_URL` to the private PostgreSQL connection string. Generate a
separate random value for `DATA_HASH_SECRET`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

`APP_ORIGIN` must exactly match the browser origin serving the frontend. For
local development that is `http://localhost:5173`. Set a unique
`ADMIN_BOOTSTRAP_PASSWORD` of at least 16 characters. Keep `.env` out of source
control and never put database or bootstrap credentials in a `VITE_*` variable.

Image uploads accept JPEG, PNG, and WebP files up to 5 MB. They are stored in
`server/uploads` by default. Set `UPLOAD_DIR` to an absolute, writable,
persistent directory in production; the API serves uploaded images from
`/api/media/{id}`. Back up this directory alongside the database.

## Optional email notifications

Email is optional. When SMTP is not configured, appointment and contact requests
are still stored and available in the admin dashboard. To enable appointment
notifications, set `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_FROM`, and
`HOSPITAL_NOTIFICATION_EMAIL`. Set both `SMTP_USER` and `SMTP_PASSWORD` for
authenticated SMTP, or leave both blank for a trusted relay. The patient gets
an acknowledgement only if SMTP is configured and an email address was
provided. Neither email says that the appointment is confirmed.

## Apply the migration and seed the database

From the repository root:

```powershell
npm --prefix server run db:deploy
npm --prefix server run db:seed
```

For schema changes during development, run
`npm --prefix server run db:migrate -- --name describe-change`. The initial
checked-in migration is generated from `prisma/schema.prisma`.

The idempotent seed creates the initial super-administrator only when the
configured email is not already present; it never resets an existing admin
password or overwrites edited content. It also seeds the published
departments/doctors, four dental services listed on the accessible DH Hospitals
dental page, verified eye service summaries, existing hospital image assets,
and published contact settings. No sample blog posts or testimonials are
invented.

## Run the frontend and API

Open two terminals from the repository root:

```powershell
npm run dev:api
npm run dev
```

In production, route `/api/*` to this Next.js service through a same-origin
reverse proxy and set `APP_ORIGIN` to the real frontend origin. The proxy must
overwrite client-supplied `X-Real-IP` and `X-Forwarded-For` headers with the
verified client IP; admin login throttling uses these headers. Never expose
PostgreSQL to browsers.

## API overview

- `GET /api/health`
- Public reads: `GET /api/public/departments`, `/doctors`, `/services`,
  `/gallery-images`, `/blog-posts`, and `/website-settings`
- Public writes: `POST /api/public/appointments` and
  `POST /api/public/contact-messages`
- Admin authentication: `POST /api/admin/auth/login`,
  `POST /api/admin/auth/logout`, `GET /api/admin/auth/session`
- Admin dashboard: open `/admin/login` on the frontend and sign in with the
  bootstrap administrator credentials. The authenticated workspace is at
  `/admin`.
- Administrative CRUD:
  `/api/admin/{appointments,contact-messages,doctors,departments,services,gallery-images,blog-posts,website-settings,admin-users,audit-logs}`

Admin list endpoints accept `page` (1-based) and `pageSize` (1–100). Admin
records require the HTTP-only session cookie; mutating requests must include the
configured same-origin `Origin` header. Admin-user management and immutable
audit logs are super-administrator-only. Editor accounts can manage blog posts
and gallery entries.

Appointment references are unique, human-readable request identifiers; all
new requests start as `PENDING`. Administrators explicitly change status from
the dashboard. Public forms require appointment privacy consent, include a
honeypot field, enforce a per-mobile submission limit, and use duplicate
protection.

Appointment messages are limited to brief scheduling context. Do not submit
medical histories or clinical records through these public enquiry forms.

## Validation

```powershell
npm --prefix server run typecheck
npm --prefix server test
npm --prefix server run test:integration
npm --prefix server run test:admin
npm --prefix server run build
```

The API tests cover validation, authentication boundaries, pagination, and
unavailable-database behavior. The integration workflow applies the checked-in
migration SQL to an isolated PGlite database and exercises public submissions
and admin status changes. It does not replace verifying `db:deploy` against a
reachable PostgreSQL instance before deployment.
The Sprint 4 integration test exercises dashboard metrics and filters,
appointment/contact updates, CRUD permissions and operations, image uploads,
profile/password changes, and login rate limits against an isolated PGlite
database.
