# DH Hospitals

DH Hospitals is a React/Vite public website backed by a separate Next.js API.
The API uses Prisma with an embedded SQLite database file; no database server
is required. Public appointment and contact requests are saved as enquiries;
appointments remain pending until an administrator changes their status.

## Application structure

- `src/` — React 18, React Router, and the responsive Vite frontend.
- `public/images/` — published hospital images and the DH Hospitals logo.
- `server/` — Next.js 15 API, Prisma schema/migrations/seed, and API tests.
- `/admin/login` — administrator sign-in; `/admin` — protected workspace.

Run the frontend and API as separate Node services. In production, serve the
Vite `dist/` output and route `/api/*` to the Next.js service on the same origin.
The API host must support persistent writable storage for both the SQLite file
and uploaded media. Keep the database outside the public web root. Stateless or
multi-instance serverless deployments are not supported by this file-based
storage setup.

## Requirements

- Node.js 20.19 or newer.
- npm.
- A Node.js host that allows the API to write to a persistent local filesystem.
- SQLite is bundled through the API's native `better-sqlite3` driver; no database
  service or separate SQLite installation is required.

Install dependencies from the repository root and API directory:

```powershell
npm ci
npm --prefix server ci
```

## Configure the API

Copy the example environment file and edit `server/.env`:

```powershell
Copy-Item server\.env.example server\.env
```

Required production settings:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | SQLite `file:` URL used only by the API. The example is suitable for local development; use an absolute path on persistent, non-public storage in production. |
| `APP_ORIGIN` | Exact public frontend origin, for example `https://dhhospitals.com`. |
| `DATA_HASH_SECRET` | Random secret of at least 32 bytes for hashing public request identifiers and rate-limit keys. |
| `ADMIN_BOOTSTRAP_EMAIL` | Email address for the initial super-administrator. |
| `ADMIN_BOOTSTRAP_PASSWORD` | Initial password, 16–128 characters; use a unique secret. |
| `UPLOAD_DIR` | Absolute writable persistent directory for uploaded image files. |

Generate a suitable `DATA_HASH_SECRET` with:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64url'))"
```

Keep all secrets on the API host. Do not expose them through `VITE_*` variables,
the frontend build, source control, or browser responses. Use the hosting
provider's secret manager in production rather than copying local `.env` files.

## Create the database and administrator

Create the parent directory for the SQLite file and make it writable by the API
process. Configure `DATABASE_URL`, then apply the checked-in migrations and run
the idempotent seed:

```powershell
npm --prefix server run db:deploy
npm --prefix server run db:seed
```

Prisma creates the database file and schema. The seed creates the configured
initial super-administrator if that email does not exist. It will not reset an
existing administrator password. Sign in at `/admin/login`, then update the
profile/password in the admin workspace. Do not deploy with sample credentials.

The former migrations were PostgreSQL-specific and have been replaced by a
fresh SQLite baseline. Existing PostgreSQL data is **not** copied into the new
file. If an earlier PostgreSQL database contains records, export and migrate
those records separately before switching production traffic.

For a local development database, use:

```powershell
npm --prefix server run db:migrate -- --name describe-change
```

Commit generated migration SQL and use `db:deploy` in staging/production. Never
use a development migration command as a production deployment step.

## Run locally

Start the API and frontend in separate terminals:

```powershell
npm run dev:api
npm run dev
```

Vite serves `http://localhost:5173` and proxies `/api` to
`http://127.0.0.1:3001`. The API reads `server/.env`. Check `GET /api/health`
before testing database-backed workflows.

## Backend API

- `GET /api/health`
- Public reads: `GET /api/public/{departments,doctors,services,gallery-images,blog-posts,website-settings}`
- Public submissions: `POST /api/public/appointments` and
  `POST /api/public/contact-messages`
- Authentication: `POST /api/admin/auth/login`,
  `POST /api/admin/auth/logout`, `GET /api/admin/auth/session`
- Protected dashboard: `GET /api/admin/dashboard/summary`
- Protected CRUD: `/api/admin/{appointments,contact-messages,doctors,departments,services,gallery-images,blog-posts,website-settings,admin-users,audit-logs}`
- Protected media upload: `POST /api/admin/media/upload`; public image retrieval:
  `GET /api/media/{uuid}`

Admin list endpoints support one-based `page` and `pageSize` (1–100).
Appointment requests initially have `PENDING` status. Public forms validate
inputs, include a honeypot, rate-limit submissions, and do not collect medical
histories. SMTP is optional; failed email delivery does not undo a saved
request.

Administrative cookies are HTTP-only and same-site. Mutating API requests
require the configured same-origin `Origin`. The production reverse proxy must
overwrite client-provided `X-Real-IP` and `X-Forwarded-For` with the verified
client address because login throttling uses those headers.

## Email notifications

Email is optional. Configure the following on the API service to send
appointment notifications:

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, and `SMTP_FROM`.
- `HOSPITAL_NOTIFICATION_EMAIL`.
- `SMTP_USER` and `SMTP_PASSWORD` together for authenticated SMTP, or leave
  both blank when the SMTP relay does not require credentials.

Patient acknowledgement is sent only when SMTP is configured and the patient
provided an email address. Messages describe a request, not a confirmed
appointment. Validate delivery with a staging/test mailbox before production.

## Upload storage

Image uploads accept JPEG, PNG, and WebP files up to 5 MB. Configure `UPLOAD_DIR`
as an absolute writable directory on a persistent volume. Back up the directory
alongside the database and restore both consistently. The default local path is
`server/uploads`; do not rely on an ephemeral container filesystem.

## Build and test

```powershell
npm run build
npm --prefix server run typecheck
npm --prefix server test
npm --prefix server run test:integration
npm --prefix server run test:admin
npm --prefix server run build
```

The API unit suite covers validation, authorization contracts, SMTP behavior
using a local test server, rate limits, and database-unavailable responses.
Integration suites create isolated SQLite files, apply the checked-in migration
using Prisma Migrate, then exercise public appointment/contact workflows, admin
status changes and CRUD, permissions, uploads, profile updates, and login
throttling. These tests run against the same SQLite provider as the API.

The repository does not include a checked-in Playwright test runner. Browser
smoke coverage was run with the available Playwright browser against all public
routes and `/admin/login` at 360, 390, 430, 768, 1024, 1440, and 1920 pixels.
The pass checked headings, titles, image paths, horizontal overflow, gallery
keyboard controls, mobile menu/Escape behavior, and client-side appointment and
contact validation. Authenticated browser login/logout and dashboard flows still need
verification on the deployed Hostinger Node.js service with its persistent
SQLite file; the browser smoke pass itself used a static frontend preview.

## Production deployment

1. Confirm the Hostinger plan supports the Next.js/Node.js API process and
   persistent writable files. Use a private, persistent path outside
   `public_html` for the database and uploads.
2. Set API secrets (`DATABASE_URL`, `APP_ORIGIN`, `DATA_HASH_SECRET`,
   `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD`, and `UPLOAD_DIR`) in the
   API host's secret/configuration manager. Set `NODE_ENV=production` and
   configure SMTP only if needed.
3. Build the API in `server/` with `npm ci` and `npm run build`; start it with
   `npm start`. Next.js uses the hosting provider's `PORT` environment variable
   (default port 3000); configure the proxy upstream accordingly.
4. Create the directory in `DATABASE_URL`, set restrictive file permissions,
   then run `npm run db:deploy` and `npm run db:seed` from the API release
   environment before receiving traffic.
5. Build the frontend from the repository root with `npm ci` and
   `npm run build`. Publish the generated `dist/` directory on a static web
   host.
6. Configure a same-origin reverse proxy so `/api/*` reaches the API service,
   forwards the required headers/cookies, preserves request bodies, and
   overwrites client-IP headers. Set the API's `APP_ORIGIN` to the exact HTTPS
   frontend origin.
7. Connect the domain's DNS records to the frontend host and enable HTTPS.
   Terminate TLS at the hosting edge and configure HSTS there. Configure the
   API as a private service or expose it only through the same-origin proxy.
   Never serve the SQLite database from a public document directory.
8. Verify `/api/health`, public pages/assets, an appointment/contact request,
   admin sign-in and authorization, upload persistence, email (if configured),
   and backups on the deployed environment.

Use the hosting provider's own deployment instructions for its build/output
settings, DNS records, TLS, and secret management; no provider-specific
infrastructure is committed in this repository.

## Backup and recovery

- Schedule encrypted backups of the SQLite database and `UPLOAD_DIR`. Stop the
  API before copying the database file so the backup is consistent. Store
  backups outside the web root and periodically verify a restore in staging.

- Protect backups with access controls and a retention policy; periodically
  verify recovery in an isolated environment before relying on them.
- Restore the matching upload backup and database backup together. Re-run
  migrations only according to the release/recovery plan; do not overwrite
  production data with the bootstrap seed.

## Limitations to resolve before production

- Verify persistent SQLite writes, authenticated browser flows, and file
  permissions on the actual Hostinger plan before production.
- Complete authenticated browser end-to-end testing against a staging API.
- Configure and validate production SMTP if notifications are required.
- Provision persistent database/upload storage and test backup restoration.
- Confirm production reverse-proxy origin/IP-header configuration and HTTPS.
- SQLite is intended for a single API instance with persistent local storage.
  Do not run multiple API instances against a shared SQLite file; plan a
  different database provider if the service outgrows this deployment model.
