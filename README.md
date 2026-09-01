# Habit Shaper

A deliberately small Next.js application for shaping desired behaviours and avoiding unwanted behaviours. This first walking skeleton provides email/password authentication, a protected application screen, User Time Zone capture, durable MySQL sessions, and database-backed health reporting.

## Requirements

Only Docker with Docker Compose is required. The production stack uses Node.js 22 and MySQL 8.4 inside containers; a host Node.js or MySQL installation is not needed.

## Configure

1. Copy the example environment file:

   ```sh
   cp .env.example .env
   ```

   On PowerShell, use `Copy-Item .env.example .env`.
2. Replace every `replace_with_...` value. Hexadecimal credentials avoid URL-encoding ambiguity in the internally constructed MySQL URL:

   ```sh
   openssl rand -hex 24  # each MySQL password
   openssl rand -hex 32  # BETTER_AUTH_SECRET
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

A fresh database opens on sign-in. Register with email and password; the browser's IANA time zone is stored invisibly as the User Time Zone. Sign-in refreshes it. The application derives identity only from the server-validated, database-backed session.

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

Run the focused Vitest suite in Docker after MySQL is healthy and the committed migration succeeds:

```sh
docker compose --env-file .env.test -p habit-shaper-test -f compose.yml -f compose.test.yml up --build --abort-on-container-exit --exit-code-from test
```

Clean up the isolated containers and test database volume:

```sh
docker compose --env-file .env.test -p habit-shaper-test -f compose.yml -f compose.test.yml down -v
```

For optional host-toolchain iteration, use `npm ci`, `npm test`, `npm run lint`, and `npm run build` with Node.js 22. The Docker command remains canonical. Browser end-to-end tooling is intentionally omitted to keep the submission lightweight.

## Troubleshooting

- **Compose reports a required variable is missing:** ensure the file is named `.env` (or pass `--env-file`) and every value in `.env.example` is set. Empty values fail during Compose interpolation.
- **MySQL remains unhealthy:** inspect `docker compose logs db`. A volume created with different credentials retains its original User; either restore those credentials or deliberately reset with `docker compose down -v`.
- **Migration exits unsuccessfully:** inspect `docker compose logs migrate`. Confirm the database is healthy and MySQL values are hexadecimal/plain URL-safe strings. Do not use `prisma db push` as a workaround.
- **Application is unhealthy:** inspect `docker compose logs app` and call `/api/health`. A `503` means the application cannot query MySQL; the response never exposes connection details.
- **Port 3000 is occupied:** stop the process using it before startup. MySQL intentionally cannot be reached on a host port.

## Architecture

This is one root npm package: Next.js App Router Server Components perform reads, native forms call Zod-validated Server Actions for mutations, and server-only feature services are the product's Prisma seam. Route Handlers exist only for Better Auth and health. Protected pages and actions validate the server session; no client-supplied User identity is accepted. The initial migration also establishes the complete Habit, Goal, Completion, and Relapse integrity model for later vertical slices.

Tailwind CSS v4 provides the visual foundation, with Lora and Raleway self-hosted through `next/font`. See the [UI design system](docs/ui-design-system.md) for semantic tokens, layout, component states, accessibility conventions, and the rationale for deferring shadcn/ui.
