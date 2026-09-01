# AGENTS.md

Guidance for coding agents working in this repository.

## Project conventions

- Read `CONTEXT.md` before changing domain behavior and use its Habit Shaper vocabulary consistently.
- Treat `docs/implementation-spec.md` as the architectural and behavioral contract.
- Keep the application as one root Next.js package using Server Components for reads, Server Actions for mutations, and feature services as the only Prisma access point.
- Preserve User ownership, authenticated server-side boundaries, User Time Zone semantics, and strict date-only behavior.
- Use Tailwind CSS v4 utilities and the semantic tokens documented in `docs/ui-design-system.md`. Do not recreate a parallel global styling system.
- Do not add libraries, abstractions, or tooling without demonstrated need.

## Testing

- Test observable behavior at the seams defined in `docs/implementation-spec.md`; do not test implementation details.
- Use focused tests while implementing. Do not add browser, snapshot, or visual-regression tooling unless explicitly requested.
- The canonical full test path remains the documented Docker Compose command in `README.md`.

## Verification cadence

Keep iteration lightweight. During implementation and refactoring, use only targeted checks when useful, such as:

- TypeScript typechecking;
- Biome on the affected files or repository;
- the directly relevant test file.

Do **not** run the production build, complete test suite, Docker Compose verification, or full code review after each refactor or small edit.

Run expensive end-to-end verification only during finalization, after implementation and refactoring are complete:

1. Run Biome and TypeScript checks.
2. Run the complete test suite once.
3. Run the production build once.
4. Run required Docker Compose or production smoke verification once.
5. Perform the final code review.
6. Fix review findings, then rerun only the checks affected by those fixes; repeat full verification only when a finding materially changes production or cross-cutting behavior.

## Git

- Do not overwrite unrelated working-tree changes.
- Keep commits focused and meaningful.
- Before committing, confirm the working tree contains only intended changes.
