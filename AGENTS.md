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
- Use focused tests while implementing. Do not add or run browser automation, headless-browser/CDP, snapshot, or visual-regression tooling. Browser runtime inspection belongs to the human reviewer unless the User explicitly requests it.
- The canonical full test path remains the documented Docker Compose command in `README.md`.

## Verification cadence

Keep iteration lightweight. During implementation and refactoring, use only targeted checks when useful, such as:

- TypeScript typechecking;
- Biome on the affected files or repository;
- the directly relevant test file.

Do **not** run the production build, complete test suite, Docker Compose verification, or full code review after each refactor or small edit.

Run expensive final verification only after implementation and refactoring are complete:

1. Re-read the originating issue or specification and turn every acceptance criterion into an explicit verification checklist.
2. Run Biome and TypeScript checks.
3. Run the complete test suite once.
4. Run the production build once.
5. Run required Docker Compose or production smoke verification once.
6. Verify every acceptance criterion at the documented test seams. For UI criteria, review semantic markup, action and state wiring, responsive utilities, focus and reduced-motion utilities, target sizing, and semantic token usage. Do not launch or automate a browser; browser-only visual confirmation is an optional human review unless the originating issue explicitly requires it.
7. Perform the final code review against both repository standards and the originating issue/specification.
8. Fix review or acceptance findings, then rerun only the checks affected by those fixes; repeat full verification only when a finding materially changes production or cross-cutting behavior.

Do not declare a ticket complete until this issue-level acceptance verification is finished. Report each criterion as passed, failed, or unverifiable, with the supporting command or observation. Treat failed and unverifiable required criteria as blockers unless the User explicitly accepts them. Browser-only runtime observations intentionally delegated to human review are not blockers unless the originating issue explicitly requires browser testing. If the issue conflicts with the repository—for example, it requires a test journey that does not exist—surface that mismatch before claiming completion.

## Git

- Do not overwrite unrelated working-tree changes.
- Keep commits focused and meaningful.
- Before committing, confirm the working tree contains only intended changes.

## Agent skills

### Issue tracker

Issues and specs are tracked in GitHub Issues. See `docs/agents/issue-tracker.md`.

### Domain docs

This is a single-context repository. See `docs/agents/domain.md`.
