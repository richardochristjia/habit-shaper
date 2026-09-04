# API and route reference

The application has no public product REST API. Habit, Goal, Completion, and Relapse mutations use authenticated Server Actions. HTTP Route Handlers are limited to Better Auth and the health check.

Local base URL: `http://localhost:3000`

| Method | Route | Authentication expectation |
| --- | --- | --- |
| `POST` | `/api/auth/sign-up/email` | No existing session required |
| `POST` | `/api/auth/sign-in/email` | No existing session required |
| `GET` | `/api/auth/get-session` | Session cookie optional; returns `null` without a valid session |
| `POST` | `/api/auth/sign-out` | Clears the current session when its cookie is present |
| `GET` | `/api/health` | Public |

Better Auth manages `/api/auth/[...all]`. The table lists the authentication surface supported by Habit Shaper rather than every framework route that may exist in the pinned dependency.

## Better Auth conventions

- Requests and responses below use JSON. Sign-up and sign-in also accept form-encoded bodies through Better Auth.
- Successful sign-up and sign-in set a signed session cookie. It is HTTP-only, `SameSite=Lax`, and secure when `BETTER_AUTH_URL` uses HTTPS.
- Requests using the session must send that cookie. Same-origin browser requests are expected for routes protected by Better Auth's origin checks.
- Session tokens are sensitive even when shown in a response shape; placeholders below must not be logged or committed.
- Framework errors normally have the shape `{ "code": "ERROR_CODE", "message": "Description" }`. The relevant codes below describe Better Auth `1.7.2`, not a custom application-owned error contract.

## Register with email and password

`POST /api/auth/sign-up/email`

Raw HTTP request:

```json
{
  "name": "user@example.com",
  "email": "user@example.com",
  "password": "eight-or-more-characters",
  "timeZone": "Asia/Jakarta"
}
```

Success — `200 OK` and a session cookie:

```json
{
  "token": "<sensitive-session-token>",
  "user": {
    "id": "<user-id>",
    "name": "user@example.com",
    "email": "user@example.com",
    "emailVerified": false,
    "image": null,
    "timeZone": "Asia/Jakarta",
    "createdAt": "<ISO-8601 timestamp>",
    "updatedAt": "<ISO-8601 timestamp>"
  }
}
```

Relevant errors:

| Status | Code or condition |
| --- | --- |
| `400` | Invalid/missing fields, `INVALID_EMAIL`, `PASSWORD_TOO_SHORT`, `PASSWORD_TOO_LONG`, or `FAILED_TO_CREATE_SESSION` |
| `422` | `USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL` or `FAILED_TO_CREATE_USER` |

### Application usage

The registration form exposes only email and password. Its Server Action trims and lowercases the email, requires an 8–128 character password, validates the browser-provided IANA time zone, and supplies the normalized email as Better Auth's required internal `name`. Validation failures are returned to the form; registration failures use the user-facing message `Registration failed. That email may already be registered.`

## Sign in with email and password

`POST /api/auth/sign-in/email`

Raw HTTP request:

```json
{
  "email": "user@example.com",
  "password": "eight-or-more-characters"
}
```

Success — `200 OK` and a session cookie:

```json
{
  "redirect": false,
  "token": "<sensitive-session-token>",
  "user": {
    "id": "<user-id>",
    "name": "user@example.com",
    "email": "user@example.com",
    "emailVerified": false,
    "image": null,
    "timeZone": "Asia/Jakarta",
    "createdAt": "<ISO-8601 timestamp>",
    "updatedAt": "<ISO-8601 timestamp>"
  }
}
```

Relevant errors:

| Status | Code or condition |
| --- | --- |
| `400` | Invalid/missing fields or `INVALID_EMAIL` |
| `401` | `INVALID_EMAIL_OR_PASSWORD` or `FAILED_TO_CREATE_SESSION` |

### Application usage

The sign-in Server Action applies the same email, password, and IANA time-zone validation as registration. After Better Auth verifies the credentials, it refreshes the User Time Zone from the browser value. Invalid credentials use the user-facing message `Email or password is incorrect.`

## Get the current session

`GET /api/auth/get-session`

The request has no body. Send the Better Auth session cookie when available.

Success with a valid session — `200 OK`:

```json
{
  "session": {
    "id": "<session-id>",
    "userId": "<user-id>",
    "token": "<sensitive-session-token>",
    "expiresAt": "<ISO-8601 timestamp>",
    "createdAt": "<ISO-8601 timestamp>",
    "updatedAt": "<ISO-8601 timestamp>",
    "ipAddress": "<address-or-null>",
    "userAgent": "<user-agent-or-null>"
  },
  "user": {
    "id": "<user-id>",
    "name": "user@example.com",
    "email": "user@example.com",
    "emailVerified": false,
    "image": null,
    "timeZone": "Asia/Jakarta",
    "createdAt": "<ISO-8601 timestamp>",
    "updatedAt": "<ISO-8601 timestamp>"
  }
}
```

Without a valid session, the route returns `200 OK` with:

```json
null
```

A database/session lookup failure can return `500 Internal Server Error` with `FAILED_TO_GET_SESSION`.

## Sign out

`POST /api/auth/sign-out`

The request may use an empty JSON body and should include the current session cookie:

```json
{}
```

Success — `200 OK`; the database session is removed when present and the cookie is expired:

```json
{
  "success": true
}
```

Signing out without a current session is existence-tolerant and still succeeds.

## Health check

`GET /api/health`

This public route has no request body. It executes a non-sensitive `SELECT 1` database connectivity check.

Healthy — `200 OK`:

```json
{
  "status": "ok"
}
```

Database unavailable — `503 Service Unavailable`:

```json
{
  "status": "unhealthy"
}
```

The response intentionally contains no database details.

## Implementation sources

- [`src/app/api/auth/[...all]/route.ts`](../../src/app/api/auth/%5B...all%5D/route.ts)
- [`src/lib/auth.ts`](../../src/lib/auth.ts)
- [`src/features/auth/actions.ts`](../../src/features/auth/actions.ts)
- [`src/app/api/health/route.ts`](../../src/app/api/health/route.ts)
- [`src/features/health/service.ts`](../../src/features/health/service.ts)
