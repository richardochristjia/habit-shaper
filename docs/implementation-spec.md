# Habit Shaper Implementation Specification

## Problem Statement

A User needs a lightweight, private web application for consistently building desired behaviours and avoiding unwanted behaviours. Existing manual tracking makes it difficult to record daily outcomes, understand current streaks, see missed Build Habit days in the current week, and organize named Goals around those Habits.

The application must provide the complete experience—authentication, habit and goal management, daily tracking, derived progress, durable storage, and reviewer-friendly startup—without requiring a local Node.js or MySQL toolchain. The implementation must remain achievable within a 1–2 day take-home time-box while preserving correct local-calendar behavior and strict isolation between Users.

## Solution

Build a simple, clean Habit Shaper web application in which a User registers or signs in with email and password, creates Build Habits and Break Habits, attaches Goals, and records Completions or Relapses on eligible Tracking Days.

The application derives Build Streaks, Clean Streaks, and the current Weekly Summary from immutable date-only tracking records in the User Time Zone. It stores all private records in MySQL and enforces ownership in authenticated server-side feature services. A single full-stack Next.js application provides the React interface and Node.js/TypeScript backend.

The complete production application, schema migration path, optional deterministic demo data, and automated test suite run through Docker Compose from the repository root without a host application toolchain.

## User Stories

1. As a new User, I want to register with my email and password, so that I can create a private Habit Shaper record.
2. As a returning User, I want to sign in with my email and password, so that I can continue tracking my Habits.
3. As a User, I want registration to work without email verification, so that I can begin using the take-home application immediately.
4. As a signed-in User, I want to sign out, so that another person using the browser cannot access my private record.
5. As a User, I want my authenticated session stored securely, so that client-controlled identity data cannot impersonate another User.
6. As a User, I want the application to use my browser time zone when I register or sign in, so that “today” matches my local calendar date.
7. As a User who signs in from a different location, I want my User Time Zone refreshed from that browser, so that future Tracking Days follow my current local calendar.
8. As a User, I want existing Tracking Days to remain unchanged after a User Time Zone change, so that previous records do not move to another date.
9. As a User, I want every protected screen and operation to require my authenticated session, so that signed-out visitors cannot access my data.
10. As a User, I want my Habits, Goals, Completions, and Relapses isolated from every other User, so that my record remains private.
11. As a User, I want attempts to access another User’s resource treated as not found, so that the application does not disclose whether that resource exists.
12. As a User, I want to create a Build Habit with a name, so that I can track a behaviour I want to perform.
13. As a User, I want to create a Break Habit with a name, so that I can track a behaviour I want to avoid.
14. As a User, I want a new Habit to begin on my current local date, so that its Tracking Days start when I create it.
15. As a User, I want a Habit’s Build or Break type to remain fixed, so that its history always has one coherent meaning.
16. As a User, I want a Habit’s start date to remain fixed, so that historical eligibility and derived streaks remain stable.
17. As a User, I want to rename a Habit, so that I can improve its wording without losing its history.
18. As a User, I want duplicate Habit names to be accepted, so that naming does not impose an artificial uniqueness rule.
19. As a User, I want to delete a Habit, so that I can remove an unwanted Habit and all of its linked Goals and tracking history.
20. As a User, I want to see all of my Habits after signing in, so that I can manage and track them from one application.
21. As a User with a Build Habit, I want to record a Completion for an eligible Tracking Day, so that the performed behaviour contributes to my Build Streak and Weekly Summary.
22. As a User with a Build Habit, I want to remove a Completion, so that I can correct an accidental or incorrect record.
23. As a User with a Break Habit, I want to record a Relapse for an eligible Tracking Day, so that my Clean Streak reflects that the unwanted behaviour occurred.
24. As a User with a Break Habit, I want to remove a Relapse, so that I can correct an accidental or incorrect record.
25. As a User, I want repeated recording or removal requests to produce the requested state without duplicate records or errors, so that retries are safe.
26. As a User, I want at most one Completion or Relapse per Habit and Tracking Day, so that each daily outcome is unambiguous.
27. As a User, I want Build Habits to accept only Completions, so that a Build Habit cannot acquire Break Habit history.
28. As a User, I want Break Habits to accept only Relapses, so that a Break Habit cannot acquire Build Habit history.
29. As a User, I want to correct past Tracking Days on or after a Habit’s creation day, so that historical mistakes can be fixed.
30. As a User, I want future dates rejected, so that progress cannot be recorded before it happens.
31. As a User, I want dates before a Habit’s creation rejected, so that a Habit cannot have ineligible history.
32. As a User, I want date-only records interpreted independently of the server time zone, so that deployment location cannot change my Tracking Days.
33. As a User with a Build Habit, I want to see my current Build Streak, so that I know how consistently I have performed the behaviour.
34. As a User with an unfinished current day, I want today to remain pending rather than immediately break yesterday’s Build Streak, so that I have the whole day to complete the Habit.
35. As a User who corrects an earlier Completion, I want the Build Streak recalculated from the resulting history, so that it remains accurate.
36. As a User with a Break Habit, I want every eligible day without a Relapse to count as a Clean Day automatically, so that I do not need to submit a daily clean check-in.
37. As a User with a Break Habit, I want to see the number of consecutive Clean Days since my latest Relapse or Habit creation, so that I can follow my Clean Streak.
38. As a User who records a Relapse today, I want my Clean Streak to show zero, so that the reset is immediate and explicit.
39. As a User who corrects an earlier Relapse, I want the Clean Streak recalculated from the resulting history, so that it remains accurate.
40. As a User with a Build Habit, I want a current Monday–Sunday Weekly Summary, so that I can understand this week’s performance.
41. As a User with a Build Habit, I want the Weekly Summary to distinguish completed, missed, and pending eligible days, so that unfinished and ineligible dates are not mislabeled as misses.
42. As a User with a Build Habit, I want to see a completion rate when at least one day has been assessed, so that I can interpret this week’s consistency.
43. As a User with no assessed Build Habit days in the week, I want zero counts and no misleading percentage, so that the summary represents the absence of evidence correctly.
44. As a User whose Habit began midweek, I want the Weekly Summary to exclude earlier days, so that dates before creation are not counted as misses.
45. As a User, I want to add a named Goal to one of my Habits, so that I can describe an intention related to that Habit.
46. As a User, I want a Habit to allow zero or many Goals, so that goal organization remains optional and flexible.
47. As a User, I want to rename a Goal, so that I can refine my intention without affecting tracking history.
48. As a User, I want a Goal’s attached Habit to remain fixed after creation, so that Goal management stays lightweight and predictable.
49. As a User, I want to delete a Goal without deleting its Habit or tracking history, so that removing an intention does not erase progress.
50. As a User, I want duplicate Goal names to be accepted, so that naming does not impose an artificial uniqueness rule.
51. As a returning User, I want my Habits, Goals, Completions, and Relapses to remain after signing out and restarting the application, so that the tracker is durable.
52. As a reviewer, I want to configure required values from a documented example environment file, so that no real secrets are committed.
53. As a reviewer, I want missing required configuration to fail fast with clear errors, so that setup problems are easy to diagnose.
54. As a reviewer, I want to start the whole application with `docker compose up` from the repository root, so that no host Node.js, npm, Prisma, or MySQL installation is needed.
55. As a reviewer, I want schema migrations to run automatically before the application starts, so that a fresh database is ready without manual bootstrap commands.
56. As a reviewer, I want application startup to wait for a ready database and successful migrations, so that startup order is reliable.
57. As a reviewer, I want a public non-sensitive health endpoint that checks database connectivity, so that I can verify the full application is ready.
58. As a reviewer, I want MySQL data retained across normal Compose shutdowns, so that application state survives restarts.
59. As a reviewer, I want a documented destructive reset command, so that I can deliberately return to an empty database.
60. As a reviewer, I want normal startup to begin with no demo records, so that I can evaluate the real registration path.
61. As a reviewer, I want an optional Docker-only seed command, so that I can quickly inspect representative Build and Break Habit states.
62. As a reviewer, I want rerunning the demo seed to converge without duplicates or changes to other Users, so that evaluation remains repeatable and safe.
63. As a reviewer, I want exact setup, startup, health, seed, logging, stop, reset, test, and troubleshooting instructions, so that I can evaluate the submission efficiently.
64. As a developer, I want one Docker-only automated test command from the repository root, so that the full risk-based suite runs without a host toolchain.
65. As a developer, I want tests to exercise public behavior at pure calculation and authenticated service seams, so that failures remain meaningful without coupling tests to implementation details.

## Implementation Decisions

### Product behavior and validation

- Use the domain vocabulary in `CONTEXT.md` consistently. In particular, distinguish Habits from Goals, Completions from Relapses, Build Streaks from Clean Streaks, and Tracking Days from timestamped events.
- A Habit belongs to one User, has a required trimmed name of 1–120 characters, has an immutable Build or Break type, and begins on its immutable creation-day `startDate` in the User Time Zone. A Habit can be renamed or deleted but cannot change type or start date.
- Duplicate Habit names are valid. Deleting a Habit cascades to its Goals, Completions, and Relapses.
- A Goal has a required trimmed name of 1–120 characters and belongs to exactly one Habit. A Habit can have zero or many Goals. Duplicate Goal names are valid.
- A Goal can be renamed or deleted, but its attached Habit cannot be changed after creation. These operations do not alter tracking history. Goal targets, deadlines, progress values, statuses, and Goal reassignment are not part of the model.
- A Build Habit has at most one Completion per Tracking Day. A Break Habit has at most one Relapse per Tracking Day. Quantities and multiple sessions within a day are not supported.
- Tracking mutations receive the desired `recorded` state rather than a non-idempotent toggle instruction. Setting `recorded` to true uses an upsert; setting it to false uses an existence-tolerant delete.
- Tracking records are valid only where `startDate <= trackingDay <= today` in the User Time Zone. Past records can be corrected. Future and pre-creation dates are rejected.
- A Build Habit cannot receive Relapses, and a Break Habit cannot receive Completions. Enforce this in both feature services and database integrity constraints.
- Keep the interface simple, clean, lightweight, semantic, and focused on the complete end-to-end flows. Detailed visual design and motion are not implementation goals.

### Application architecture

- Implement one full-stack Next.js App Router application running on Node.js. Use React for the interface, TypeScript throughout the application, and MySQL as the only separate application dependency.
- Use Next.js 16.3.4, the latest stable release at decision time, pinned by the committed lockfile. Do not use canary releases.
- Keep one root npm package with a committed `package-lock.json`. Do not introduce workspaces, a monorepo orchestrator, or separately deployed frontend and backend packages.
- Use Server Components for reads. Server Components call small server-only feature services rather than accessing Prisma directly.
- Use Server Actions for application mutations. Server Actions authenticate the User, validate input, call the same server-only feature services, return structured field-level or form-level errors, and trigger Next.js revalidation after successful changes.
- Only feature services access Prisma. Do not add repository classes or dependency injection around Prisma.
- Do not expose an application REST, GraphQL, tRPC, or OpenAPI API. Route Handlers are limited to Better Auth and the health endpoint.
- Use native React and Next.js forms with `useActionState`, `useFormStatus`, and `useOptimistic` where optimistic behavior improves daily recording. Do not add TanStack Form or React Hook Form.
- Do not add TanStack Query because Server Components, Server Actions, and revalidation provide the required data flow.
- Use Zod at every Server Action boundary. Return stable structured validation results that forms can render without relying on thrown client-facing errors.
- Use Prisma with matched stable Prisma CLI and Client releases. Use Biome for formatting and linting.
- Do not use Motion or Husky. Avoid extra form, state, API, and architectural machinery unless an implementation risk proves it necessary.

### Authentication, sessions, and authorization

- Use Better Auth with its Prisma adapter, database-backed sessions, HTTP-only same-site cookies, and built-in Node.js scrypt password hashing.
- Enable email/password registration and sign-in. Email verification and password reset are not required.
- Registration exposes only email and password as visible identity fields. Populate Better Auth’s required internal name from the normalized email; do not introduce display name as a product concept.
- Capture the browser’s IANA time-zone identifier invisibly during registration and every sign-in. Validate it before persisting it as the User Time Zone.
- Authenticate every protected page and every Server Action. Derive the acting User exclusively from the validated server session, never from client input.
- Scope every resource read and mutation by both resource identity and authenticated User identity. Habit operations scope directly by Habit identity and User identity; Goal and tracking operations scope through their Habit’s User identity.
- Treat cross-User resources as not found.
- Middleware may provide an early redirect for user experience, but it is not an authorization boundary.

### Relational model and database integrity

- Keep Better Auth’s User, Session, Account, and Verification models in the same Prisma schema as the product models.
- Extend User with a required, validated IANA `timeZone` string. Deleting a User cascades to that User’s Habits and related product records.
- Habit fields are a Prisma-generated CUID string identity, User foreign key, trimmed name stored as `VARCHAR(120)`, Build/Break enum type, date-only immutable start date, creation timestamp, and update timestamp.
- Add a unique composite key to Habit identity and type. Index Habits by User identity and creation timestamp.
- Goal fields are a CUID string identity, Habit foreign key, trimmed name stored as `VARCHAR(120)`, creation timestamp, and update timestamp. Ownership remains transitive through Habit; do not duplicate User identity on Goal. Index Goals by Habit identity.
- Completion uses Habit identity, a fixed Build discriminator, a MySQL `DATE` Tracking Day, and a creation timestamp. Its natural primary key is Habit identity plus Tracking Day.
- Relapse has the equivalent shape with a fixed Break discriminator and the same natural primary-key strategy.
- Completion and Relapse use composite foreign keys from Habit identity and their fixed type discriminator to Habit identity and type. Add migration-level check constraints fixing each table’s discriminator. This prevents a daily record from being attached to the wrong Habit type even outside application code.
- Cascade Habit deletion to Goals, Completions, and Relapses. Let MySQL enforce foreign keys, one daily record, Build/Break compatibility, and cascades. Do not add database triggers.
- Index each tracking table by Habit identity and discriminator to support its composite foreign key. The Habit identity and Tracking Day primary key already supports uniqueness and Habit/date lookups; do not add speculative global-date indexes.

### Date-only boundary

- Exchange Tracking Days as strict `YYYY-MM-DD` strings and persist them as MySQL `DATE` values, never timestamps.
- Compute `today` and a new Habit’s start date on the server using the persisted User Time Zone. Never use the server’s local time zone as the User’s calendar boundary.
- Existing Tracking Days are stable date-only facts and do not shift when the User Time Zone changes later.
- Centralize strict date-only parsing, comparison, Monday–Sunday week boundaries, calendar-day increments, and day differences in one small date-only module. Use UTC calendar arithmetic internally to avoid host-local daylight-saving behavior. Do not add a date library for these operations.

### Derived tracking calculations

- Persist Completions and Relapses only. Do not persist Build Streak counters, Clean Streak counters, Weekly Summary totals, or Clean Day rows. Recalculate projections from source records so historical corrections require no counter repair.
- Build Streak calculation selects one Build Habit’s Completion Tracking Days through today in descending order. If today is complete, anchor on today; otherwise anchor on yesterday so an unfinished current day remains pending. Count backward through consecutive completed eligible dates and stop at the first missing date or the Habit creation boundary.
- Fetching a personal Habit’s full Completion history for Build Streak calculation is acceptable for this take-home. Optimize only if evidence demonstrates a need.
- Clean Streak calculation selects only the latest Relapse through today. Return the calendar-day difference from that Relapse to today. If no Relapse exists, return the inclusive number of eligible days from the Habit’s start date through today. A Relapse today yields zero.
- Weekly Summary applies only to Build Habits and covers the current Monday–Sunday week. Query Completion dates in the intersection of that week and the Habit’s eligible range, requiring at most seven rows.
- In a Weekly Summary, past eligible days are assessed; today is assessed only when completed; an unfinished today is pending; future days and days before Habit creation are excluded. Derive completed, missed, pending, and completion rate. When no days are assessed, completed and missed are zero and the rate is absent.

### Migration and schema bootstrap

- Commit the Prisma schema and generated initial migration containing Better Auth tables, product tables, indexes, foreign keys, and custom check constraints.
- Developers may create future migrations with Prisma’s development migration command, but repository bootstrap and deployment run only committed migrations with `prisma migrate deploy`.
- Never use `prisma db push` in startup, test, or delivery flows.

### Container and Compose delivery

- A fresh clone requires one documented `.env` setup. After that, the complete application starts from the repository root with `docker compose up` and no host Node.js, npm, Prisma, or MySQL installation.
- Commit `.env.example`, ignore `.env`, and require `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`, `BETTER_AUTH_SECRET`, and `BETTER_AUTH_URL`. The documented local Better Auth URL is `http://localhost:3000`.
- Make Compose fail fast with clear missing-variable errors. Do not silently provide insecure credentials. Document hexadecimal password and secret generation so database URL encoding is unambiguous.
- Construct the internal database URL in Compose using the private `db` service hostname. Provide the root password only to MySQL; migrations and the application connect as the restricted application database User.
- Use one multi-stage Dockerfile based on Node 22 Bookworm Slim and MySQL 8.4 rather than floating `latest` or Alpine images.
- Build a minimal non-root Next.js standalone application target and a tooling target that contains Prisma CLI, schema, committed migrations, and seed support for one-shot jobs.
- Build stages run `npm ci`, generate Prisma Client, and produce the Next.js production build. Supply secrets only at runtime, not as image build arguments or image contents.
- The default Compose path contains `db`, `migrate`, and `app` services. Gate startup in order: healthy MySQL, successful one-shot migration, then application startup. Do not conceal migration failure behind restart loops.
- Give MySQL a real readiness check. Expose public `GET /api/health`, perform a lightweight database query, return an unhealthy status when connectivity fails, and use this endpoint for the application container health check. The endpoint returns no sensitive information.
- Publish only the application on `localhost:3000`. Keep MySQL private with no host port.
- Persist MySQL data in a named volume. Normal shutdown retains data; document `docker compose down -v` as the deliberate destructive reset.

### Optional demo data

- Keep normal startup empty so registration remains the primary evaluation path.
- Provide `docker compose run --rm seed` as an explicitly invoked, host-toolchain-free optional seed command after environment setup.
- Seed a fixed local-only User with email `demo@habit-shaper.local`, a documented development-only password, UTC as the User Time Zone, and representative Goals, Build Habits, Break Habits, Completions, and Relapses relative to the current date.
- Make the seed convergent. It may reset and recreate records owned by the fixed demo User but must not modify any other User or accumulate duplicates across reruns.

### Documentation and submission quality

- Document exact commands for environment setup, startup, health verification, opening the application, optional seeding, viewing logs, stopping while retaining data, destructive reset, full automated tests, and test cleanup.
- Include concise troubleshooting for missing variables, unhealthy MySQL, and failed migrations.
- Clearly identify all example secrets and demo credentials as local evaluation values rather than production defaults.
- Exclude dependencies, build artifacts, real environment files, certificates, and keys from version control.
- Keep source code, documentation, configuration, migrations, and development artifacts needed to understand the result in the repository.
- Use meaningful commits that tell the implementation story because git history is an explicit evaluation criterion.

## Testing Decisions

### Test seams and quality standard

- Test observable behavior rather than implementation details. A good test supplies public inputs at the highest useful seam and verifies returned domain outcomes, authorization outcomes, persisted state, rendered user-visible behavior, or process exit status. Tests must not assert private helper calls, Prisma query shape, React component structure, framework internals, or snapshots of incidental markup.
- Use two deliberately small seams because each isolates a distinct high-risk boundary:
  1. The pure date-only and derived-calculation seam for fast calendar boundary coverage.
  2. The authenticated feature-service seam against real migrated MySQL for ownership, integrity, mutation, and persistence behavior.
- These are new seams in a greenfield repository. There is no existing test suite or code-level prior art to preserve. The resolved domain, architecture, schema, delivery, and testing decisions are the prior behavioral contract.

### Unit tests

- Use Vitest for pure date-only conversion and derived Build Streak, Clean Streak, and Weekly Summary behavior.
- Prefer table-driven boundary examples over broad date enumeration.
- Cover User Time Zone conversion around local midnight and daylight-saving transitions without relying on the test host’s time zone.
- Cover Build Streak when today is complete, today is pending, yesterday is missing, and the sequence reaches the Habit creation boundary.
- Cover Clean Streak with a Relapse today, an earlier Relapse, and no Relapse since Habit creation.
- Cover Weekly Summary at Monday and Sunday boundaries, in a partial current week, for a Habit created midweek, and where no day has been assessed.

### MySQL integration tests

- Use Vitest against a real migrated MySQL database. Do not mock Prisma.
- Test persisted Habit, Goal, Completion, and Relapse behavior, including rename, idempotent recording, and existence-tolerant removal where applicable.
- Prove denial of cross-User reads and mutations.
- Prove the database enforces one daily record, correct Build/Break record type, referential integrity, and deletion cascades.
- Prove application services enforce eligibility dates, Habit type, immutable type/start-date behavior, and ownership.
- Prove committed state remains readable through a fresh Prisma Client instance.
- Apply committed migrations once for the suite and reset the test-owned product and authentication tables between tests. Keep tests serial where they share database state.
- Treat persistence as durable MySQL state. Do not test database backups, crash recovery, or named-volume restoration.

### Browser tests

- Browser end-to-end automation is intentionally omitted because it is not required by the coding-test brief and adds substantial image-download and execution overhead.
- Keep authentication and complete User journeys available for focused manual verification through the production Compose application.
- Do not add Playwright, Cypress, or another browser automation framework within this submission.

### Test execution contract

- Provide one documented Docker-only test command from the repository root using an isolated Compose project and disposable database state:
  `docker compose --env-file .env.test -p habit-shaper-test -f compose.yml -f compose.test.yml up --build --abort-on-container-exit --exit-code-from test`
- Provide the matching Compose cleanup command with volume deletion.
- Gate the test runner on healthy MySQL and successful committed migrations.
- Run Vitest and propagate the test runner’s exit code to the host.
- Optional npm scripts may improve local iteration, but the canonical suite requires no host Node.js or database.
- Do not add React Testing Library, Supertest, MSW, Playwright, Cypress, or another test framework unless implementation reveals a material risk not covered by these seams.
- Do not add percentage coverage gates, snapshots, isolated React component tests, mocked database tests, browser matrices, visual regression, load tests, exhaustive framework/library tests, or a GitHub Actions workflow within this time-box.
- Use semantic interface implementation and focused manual review rather than adding a separate automated accessibility layer for this submission.

## Out of Scope

- Public cloud hosting, a live deployment, production infrastructure, or any deployment boundary beyond Docker Compose.
- Email verification, password reset, profile management, display names, social login, and other account-management features beyond email/password registration, sign-in, session use, and sign-out.
- Reminders, notifications, social features, sharing, leaderboards, analytics dashboards, historical weekly reporting, or reporting beyond the current Weekly Summary.
- Goal targets, quantities, deadlines, progress counters, statuses, independent Goal completion, or Goal reassignment.
- Habit schedules other than daily eligibility, skipped/exempt days, quantities, multiple daily sessions, or changing a Habit’s type or start date.
- Explicit clean check-ins or persisted Clean Day rows for Break Habits.
- Detailed visual design, animation design, advanced theming, visual regression, or UI polish beyond a simple clean and semantic experience.
- A public application API, OpenAPI contract, separate backend service, repository abstraction, dependency injection, monorepo, or speculative scaling optimizations.
- Background User Time Zone synchronization or a dedicated time-zone settings interface.
- Automatic demo seeding during normal startup.
- Database backups, crash recovery, volume-restoration testing, load testing, broad browser compatibility testing, and production security hardening beyond the stated take-home controls.
- GitHub Actions or another continuous-integration workflow for this time-box.

## Further Notes

- The source brief is `docs/coding-test_habit-shaper.pdf`.
- The canonical domain glossary is `CONTEXT.md`; implementation naming and user-facing language should follow it.
- This specification synthesizes the resolved wayfinding decisions in [Define the minimum habit and goal semantics](https://github.com/richardochristjia/habit-shaper/issues/2), [Choose the simplest viable architecture and concrete stack](https://github.com/richardochristjia/habit-shaper/issues/3), [Design the MySQL model and derived tracking calculations](https://github.com/richardochristjia/habit-shaper/issues/4), [Define the one-command Compose delivery path](https://github.com/richardochristjia/habit-shaper/issues/5), and [Choose a risk-based testing strategy](https://github.com/richardochristjia/habit-shaper/issues/6).
- The repository currently contains planning and domain artifacts but no production application code, so implementation begins from a greenfield baseline.
- Optimize decisions and implementation for completeness, clarity, low complexity, and the 1–2 day take-home constraint. If implementation exposes an unanticipated conflict, preserve user-visible semantics, ownership isolation, date correctness, and the one-command Compose contract before adding tooling or abstraction.
