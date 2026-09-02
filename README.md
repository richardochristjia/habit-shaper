# Habit Shaper

A deliberately small Next.js application for shaping desired behaviours and avoiding unwanted behaviours. It provides email/password authentication, private Build and Break Habit management, date-only Completions and Relapses, derived Build and Clean Streaks, User Time Zone-aware Tracking Days, durable MySQL storage, and database-backed health reporting.

## Requirements

Only Docker with Docker Compose is required. The production stack uses Node.js 22 and MySQL 8.4 inside containers; a host Node.js or MySQL installation is not needed.

## Configure

1. Copy the example environment file:

   ```sh
   cp .env.example .env
   ```

   On PowerShell, use `Copy-Item .env.example .env`.
2. Replace every `replace_with_...` value. Hexadecimal credentials avoid URL-encoding ambiguity in the internally constructed MySQL URL. Docker alone can generate each value (use 24 bytes for each MySQL password and 32 bytes for `BETTER_AUTH_SECRET`):

   ```sh
   docker run --rm node:22-bookworm-slim node -e "console.log(require('node:crypto').randomBytes(24).toString('hex'))"
   docker run --rm node:22-bookworm-slim node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
   ```

   If OpenSSL is already available, the equivalent commands are:

   ```sh
   openssl rand -hex 24
   openssl rand -hex 32
   ```

   PowerShell without OpenSSL can generate a secret with:

   ```powershell
   -join ((1..64) | ForEach-Object { '{0:x}' -f (Get-Random -Maximum 16) })
   ```

The values in example files are for local evaluation only and are not production defaults. Keep `BETTER_AUTH_URL=http://localhost:3000` for the normal local stack. `.env` is ignored by Git.

## Start and verify

Build, migrate, and start the complete production stack:

```sh
docker compose up --build
```

Compose waits for an authenticated `SELECT 1` against MySQL, runs only the committed migrations with `prisma migrate deploy` as the restricted application database User, and starts the application only after migration succeeds. MySQL has no published host port.

Open <http://localhost:3000>, or verify the database-backed health endpoint:

```sh
curl --fail http://localhost:3000/api/health
# {"status":"ok"}
```

A fresh database opens on sign-in. Register with email and password; the browser's IANA time zone is stored invisibly as the User Time Zone. Sign-in refreshes it. The protected Today workspace shows the full local date, stable Build Today and Break Today columns, current streaks, and a Monday–Sunday Tracking Day strip. A User can record today's Completion or Relapse immediately, with optimistic feedback and persistent Undo; Break Habits remain clean without a check-in. Add, rename, delete, Goal management, and eligible historical corrections remain available from the same workspace. The application derives identity only from the server-validated, database-backed session.

Normal startup never creates demo records. To populate optional representative data after configuring `.env`, run the Docker-only seed service:

```sh
docker compose run --rm seed
```

Sign in with:

- Email: `demo@habit-shaper.local`
- Password: `habit-shaper-demo`

These fixed credentials are **development-only local evaluation values**, not production defaults. The demo User uses UTC, and its Goals, Build Habits, Break Habits, Completions, and Relapses are generated relative to the current date. Rerunning the command resets and recreates only this demo User; it does not change any registered User's private record.

## Operate

View all logs or one service's logs:

```sh
docker compose logs -f
docker compose logs migrate
docker compose logs db
docker compose logs app
```

Stop while retaining the named MySQL volume:

```sh
docker compose down
```

Start again with `docker compose up`; registered Users and sessions remain. Deliberately erase all data and return to an empty database with:

```sh
docker compose down -v
```

## Tests

Create the disposable test environment once:

```sh
cp .env.test.example .env.test
```

Run the canonical suite with one root-level Docker Compose command. The isolated stack waits for healthy MySQL, applies the committed migrations once, then runs all Vitest unit tests before the serial, real-MySQL integration tests. Integration tests reset test-owned authentication and product records between cases, use Prisma without database mocks, and propagate any failure through the container exit code:

```sh
docker compose --env-file .env.test -p habit-shaper-test -f compose.yml -f compose.test.yml up --build --abort-on-container-exit --exit-code-from test
```

Clean up the isolated containers and disposable test database volume. The `habit-shaper-test` project name keeps this volume separate from normal application data:

```sh
docker compose --env-file .env.test -p habit-shaper-test -f compose.yml -f compose.test.yml down -v
```

For optional host-toolchain iteration, use `npm ci`, `npm run test:unit`, `npm run lint`, and `npm run build` with Node.js 22. Running `npm test` also requires a migrated MySQL test database and `DATABASE_URL`. The Docker command remains canonical. Browser end-to-end tooling is intentionally omitted to keep the submission lightweight.

## Troubleshooting

- **Compose reports a required variable is missing:** ensure the file is named `.env` (or pass `--env-file`) and every value in `.env.example` is set. Empty values fail during Compose interpolation.
- **MySQL remains unhealthy:** inspect `docker compose logs db`. A volume created with different credentials retains its original User; either restore those credentials or deliberately reset with `docker compose down -v`.
- **Migration exits unsuccessfully:** inspect `docker compose logs migrate`. Confirm the database is healthy and MySQL values are hexadecimal/plain URL-safe strings. Do not use `prisma db push` as a workaround.
- **Application is unhealthy:** inspect `docker compose logs app` and call `/api/health`. A `503` means the application cannot query MySQL; the response never exposes connection details.
- **Test runner fails or leaves stopped containers:** inspect `docker compose --env-file .env.test -p habit-shaper-test -f compose.yml -f compose.test.yml logs`, then run the documented test cleanup command before retrying. This does not affect the normal development volume.
- **Port 3000 is occupied:** stop the process using it before startup. MySQL intentionally cannot be reached on a host port.

## Architecture

This is one root npm package: Next.js App Router Server Components perform reads, native forms call Zod-validated Server Actions for mutations, and server-only feature services are the product's Prisma seam. Route Handlers exist only for Better Auth and health. Protected pages and actions validate the server session; no client-supplied User identity is accepted. The initial migration also establishes the complete Habit, Goal, Completion, and Relapse integrity model for later vertical slices.

Tailwind CSS v4 provides the visual foundation, with Lora and Raleway self-hosted through `next/font`. See the [UI design system](docs/ui-design-system.md) for semantic tokens, layout, component states, accessibility conventions, and the rationale for deferring shadcn/ui.
