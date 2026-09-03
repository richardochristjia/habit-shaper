# Agentic Development Workflow

This document gives reviewers a concise record of how AI agents were used to turn the Habit Shaper brief into an implementation-ready plan. It records meaningful decisions and human checkpoints rather than raw chat transcripts or token logs.

## Maintenance

This is a living document. After each implementation, review, or delivery milestone, update the **Current checkpoint** with:

- what the agent did;
- what the developer reviewed or decided;
- how the result was verified; and
- links to the resulting issue, commit, or test evidence.

## Workflow

### 1. Preserve the original brief

The supplied coding-test PDF was committed unchanged before planning began. This keeps the original requirements separate from later interpretation.

**Artifact:** [Coding-test brief](coding-test_habit-shaper.pdf)
**Commit:** [`docs: add coding test requirements`](https://github.com/richardochristjia/habit-shaper/commit/fc45c38)

### 2. Define the domain language

Domain-modeling sessions established consistent meanings for User, Habit, Goal, Completion, Relapse, Tracking Day, Build Streak, Clean Streak, and Weekly Summary. The User Time Zone was explicitly defined because all daily calculations depend on the User’s local calendar.

**Artifact:** [`CONTEXT.md`](../CONTEXT.md)
**Commits:** [`define habit tracking language`](https://github.com/richardochristjia/habit-shaper/commit/240bbc9), [`define user time zone`](https://github.com/richardochristjia/habit-shaper/commit/1a183d1)

### 3. Use Wayfinder to resolve ambiguity

Instead of implementing directly from the brief, the Wayfinder workflow created a planning map and worked through five human-in-the-loop decision sessions:

- [Habit and Goal semantics](https://github.com/richardochristjia/habit-shaper/issues/2)
- [Application architecture and stack](https://github.com/richardochristjia/habit-shaper/issues/3)
- [MySQL model and tracking calculations](https://github.com/richardochristjia/habit-shaper/issues/4)
- [One-command Docker Compose delivery](https://github.com/richardochristjia/habit-shaper/issues/5)
- [Risk-based testing strategy](https://github.com/richardochristjia/habit-shaper/issues/6)

The agent facilitated trade-off analysis and recorded the accepted outcomes. The developer reviewed the decisions before they were closed. Once no unresolved planning questions remained, the [Wayfinder map](https://github.com/richardochristjia/habit-shaper/issues/1) was closed.

Key outcomes included:

- one server-first Next.js application with Prisma, Better Auth, Zod, and Biome;
- strict User ownership and local-date behavior;
- Completions and Relapses as source records, with streaks and summaries derived;
- health-gated MySQL, migrations, and application containers; and
- focused unit and real-MySQL integration coverage without resource-heavy browser automation.

### 4. Synthesize one implementation specification

The To Spec workflow combined the original brief, domain glossary, and all Wayfinder resolutions into one implementation contract. It includes 66 User stories, implementation decisions, testing seams, and explicit scope boundaries.

The developer chose to keep the specification under `docs/` for reviewer visibility and approved publishing it as an implementation issue.

**Artifacts:** [Implementation specification](implementation-spec.md), [Implement the Habit Shaper application](https://github.com/richardochristjia/habit-shaper/issues/7)
**Commit:** [`docs: add Habit Shaper implementation spec`](https://github.com/richardochristjia/habit-shaper/commit/642d2ea)

### 5. Break the specification into vertical slices

The To Tickets workflow proposed end-to-end slices rather than separate database, backend, and frontend tasks. The developer reviewed the granularity and dependency graph before approving publication.

The implementation sequence is:

```text
Authenticated Compose walking skeleton
└── Private Habit management
    ├── Goal management
    ├── Build Habit Completions and Build Streaks
    │   └── Weekly Summary
    └── Break Habit Relapses and Clean Streaks

Core feature slices
├── Optional convergent demo data
└── Complete Docker-only automated test suite
```

**Published tickets:**

1. [Launch the authenticated Habit Shaper walking skeleton](https://github.com/richardochristjia/habit-shaper/issues/8)
2. [Create and manage private Habits](https://github.com/richardochristjia/habit-shaper/issues/9)
3. [Create and organize Goals](https://github.com/richardochristjia/habit-shaper/issues/10)
4. [Record Build Habit Completions and show Build Streaks](https://github.com/richardochristjia/habit-shaper/issues/11)
5. [Record Break Habit Relapses and show Clean Streaks](https://github.com/richardochristjia/habit-shaper/issues/12)
6. [Show the current Weekly Summary for Build Habits](https://github.com/richardochristjia/habit-shaper/issues/13)
7. [Provide optional convergent demo data](https://github.com/richardochristjia/habit-shaper/issues/14)
8. [Run the complete risk-based suite through Docker Compose](https://github.com/richardochristjia/habit-shaper/issues/15)

All tickets are labelled `ready-for-agent` and use GitHub-native blocking relationships. This makes the next available work visible while preventing agents from starting slices whose prerequisites are incomplete.

### 6. Polish the already-architected base

After the core architecture was in place, a separate UI/UX polish session refined the protected experience without re-architecting the application. The session followed this sequence:

1. Brainstorm UX design concepts.
2. Use `/prototype` to consume the concepts, build a throwaway prototype, and finalize the direction.
3. Write the implementation spec for the new UX revamp.
4. Break the revamp into vertical-slice tickets.
5. Implement the tickets.
6. Make the final manual tweak for polish.

The result was a layered process: architecture first, then UX exploration, then production implementation, then last-pass refinement.

## Human oversight and verification

The workflow does not treat generated output as automatically correct:

- product and technical decisions were resolved through human-in-the-loop sessions;
- the developer approved the implementation specification’s repository placement;
- the developer reviewed and approved ticket granularity before publication;
- issue states, labels, and native dependencies were queried after publication; and
- documentation changes were checked before being committed and pushed.

Future implementation tickets will follow the same pattern: claim a ready ticket, implement its complete slice, run the agreed tests, review the change, record the outcome here, and then advance the dependency frontier.

## Current checkpoint — Today workspace acceptance complete

The agent implemented the final Today workspace acceptance pass across [Goal drawer acceptance coverage](https://github.com/richardochristjia/habit-shaper/issues/23), [Habit settings from drawer](https://github.com/richardochristjia/habit-shaper/issues/24), and [Finalize Today workspace acceptance](https://github.com/richardochristjia/habit-shaper/issues/25). The latest refinement separated Habit details from the primary daily action: the daily card now keeps a stable action region, while secondary management lives in the drawer and footer controls.

This pass also aligned the production UI with the updated revamp docs, including `README.md`, `docs/ux-revamp-concept.md`, and `docs/ux-revamp-implementation-spec.md`. The protected Today workspace now reflects the resolved card/drawer hierarchy without reintroducing the old form-heavy interaction model.

Verification covered the issue-specific integration coverage for habits and goals, plus review against the revised Today workspace contract and interaction boundaries.

The next implementation frontier now moves beyond the Today workspace slice and into the remaining ready-for-agent issue queue.
