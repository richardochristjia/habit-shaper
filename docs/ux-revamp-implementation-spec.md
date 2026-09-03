# Habit Shaper Today workspace UX revamp implementation specification

## Status

Implemented production baseline. This specification is the canonical protected-workspace contract; browser-only visual confirmation remains an optional human review as documented below.

## Problem Statement

Before the revamp, a signed-in User encountered a Habit collection that behaved more like an administration screen than a calm daily companion. Daily tracking, historical corrections, Habit management, and Goal management competed for attention inside permanently visible forms. The experience made it slower than necessary to scan Build Habits and Break Habits, understand today’s state, record a Completion or Relapse, and leave.

The resolved UX direction has now been exercised through two throwaway prototypes. The first established the information architecture and state transitions. The second demonstrated that real shadcn/ui primitives provide materially better focus management, keyboard behavior, overlays, menus, feedback, and transitions than bespoke prototype controls. Subsequent evaluation refined card stability, type colors, Tracking Day history, summary presentation, dialogs, and action hierarchy.

Before this revamp, the production application exposed the old form-heavy interface, supported Goal reassignment, and did not embody the validated Today workspace. The replacement preserves User ownership, User Time Zone semantics, strict date-only Tracking Days, authenticated server boundaries, and existing domain calculations while changing the interaction and presentation model.

## Solution

Replace the protected application screen with one desktop-focused, responsively complete Today workspace. Present stable Build Today and Break Today columns containing compact Habit cards. Keep each card on a default white surface at a stable height, place today’s explicit status beneath the Habit name, and reserve the card’s right side for the one relevant daily action. Use green as the Build Habit type color, red as the Break Habit type color, yellow for pending status, and neutral card surfaces that do not change when today’s record changes.

Use optimistic daily mutations with immediate card feedback, authoritative rollback on failure, success/error Sonner feedback, and a persistent compact Undo action whenever today has a Completion or Relapse. Open secondary Habit capabilities in a responsive shadcn Sheet with Overview, Goals, and Settings tabs. Present every eligible Tracking Day from the Habit’s creation day through today in an ascending, vertically wrapping grid with no separate older-history control. Selecting a day reveals its full date, current state, and an explicit correction action without mutating the record immediately.

Use shadcn’s Radix-backed primitives for sheets, dialogs, alert dialogs, tabs, menus, tooltips, buttons, and focus behavior. Keep reads in Server Components, mutations in Server Actions, and Prisma access inside authenticated feature services. Show up to two attached Goal names on a Habit card as compact daily context, with direct access to the drawer’s Goals tab for the complete list. Remove Goal reassignment from production behavior and create a Habit with its optional initial Goals only when the final wizard step is submitted.

## User Stories

1. As a signed-in User, I want Today to be the primary protected destination, so that I can act without navigating through duplicate Habit collections.
2. As a signed-in User, I want a compact Today heading and full local date, so that I can immediately understand the Tracking Day I am viewing.
3. As a signed-in User, I want Today to use my User Time Zone, so that today matches my local calendar rather than the server calendar.
4. As a signed-in User, I want my email and sign-out action to remain quietly available, so that account utilities do not compete with daily tracking.
5. As a signed-in User, I want a primary Add a Habit action in the Today header, so that creating a Habit remains easy to discover.
6. As a signed-in User, I want Build Habits and Break Habits in separate columns, so that their different daily meanings remain easy to scan.
7. As a signed-in User, I want Build Today to appear before Break Today on narrow screens, so that the responsive layout retains a predictable order.
8. As a signed-in User, I want both columns to remain free of horizontal overflow, so that the workspace fits the available viewport.
9. As a signed-in User, I want Habits ordered oldest-created-first within their type, so that their positions remain familiar.
10. As a signed-in User, I want recording or undoing today’s outcome to leave card order unchanged, so that state changes do not disrupt scanning.
11. As a signed-in User, I want every Habit card to retain the same height across today’s states, so that the columns remain visually stable.
12. As a signed-in User, I want Habit cards to retain their default white background after daily actions, so that state changes do not make the workspace visually noisy.
13. As a signed-in User, I want today’s status directly beneath the Habit name, so that the name and its current outcome read as one unit.
14. As a signed-in User, I want only the relevant daily action on the right side of a Habit card, so that routine interaction remains focused.
15. As a signed-in User, I want Build Habits represented with green type cues and a visible Build label where context requires it, so that I can distinguish their direction without relying on position alone.
16. As a signed-in User, I want Break Habits represented with red type cues and a visible Break label where context requires it, so that I can distinguish their direction without relying on position alone.
17. As a signed-in User, I want type colors paired with icons and text, so that color is never the only source of meaning.
18. As a signed-in User, I want an unfinished Build Habit to show a yellow Pending today badge, so that unfinished does not look completed or missed.
19. As a signed-in User, I want an unfinished Build Habit to offer a prominent green Done today action, so that recording a Completion is immediate.
20. As a signed-in User, I want a completed Build Habit to show Done for today with a Completion icon, so that the settled state is explicit.
21. As a signed-in User, I want a completed Build Habit to offer a compact low-emphasis Undo action, so that correction remains available without competing with primary actions.
22. As a signed-in User, I want a Break Habit without a Relapse today to show Clean today automatically, so that I am not asked to submit a clean check-in.
23. As a signed-in User, I want a clean Break Habit to offer a distinct red I relapsed action with an interrupted-circle icon, so that recording a Relapse cannot be confused with Undo.
24. As a signed-in User, I want a Break Habit with a Relapse today to show a distinct Relapsed today indicator, so that the recorded state is unmistakable.
25. As a signed-in User, I want Undo after a Relapse to use a neutral return icon and compact neutral styling, so that it differs from the Relapse action.
26. As a signed-in User, I want Relapse language to remain factual and neutral, so that the product does not shame me.
27. As a signed-in User, I want today’s Completion or Relapse to appear immediately while saving, so that daily tracking feels responsive.
28. As a signed-in User, I want a saving indicator to prevent repeated submission, so that I do not create conflicting requests.
29. As a signed-in User, I want a successful mutation to use success-type Sonner feedback, so that completion is acknowledged consistently.
30. As a signed-in User, I want a failed optimistic mutation to restore the previous authoritative state, so that the interface never leaves an unsaved outcome visible.
31. As a signed-in User, I want a failed mutation to explain that the previous state was restored, so that I know how to recover.
32. As a returning User, I want Undo to remain visible after refresh or a later sign-in whenever today has a record, so that correction is not dependent on a temporary toast.
33. As a signed-in User, I want each Habit card to show its current Build Streak or Clean Streak, so that current continuity is visible at a glance.
34. As a signed-in User, I want the same amber flame icon for Build Streaks and Clean Streaks, so that streak is represented consistently rather than used as a type color.
35. As a signed-in User, I want the streak icon to remain informational and unanimated, so that it does not become a gamified reward.
36. As a signed-in User, I want each card to show a read-only Monday–Sunday status strip, so that I can scan the current week without opening details.
37. As a signed-in User, I want Completion, Clean Day, Relapse, Pending, Missed, future, and ineligible days to remain distinguishable by icon, shape, text, and color, so that weekly state is comprehensible.
38. As a signed-in User, I want ineligible days to use an empty or strongly muted marker, so that they do not compete with eligible outcomes.
39. As a signed-in User, I want selecting a Habit’s details control to open a wide right-side drawer over Today, so that I retain collection context.
40. As a signed-in User, I want the Habit drawer to become a full-screen layer on narrow screens, so that every capability remains usable without horizontal overflow.
41. As a keyboard User, I want the Habit drawer to manage focus, trap focus while open, close with Escape, and return focus to its trigger, so that navigation remains predictable.
42. As a signed-in User, I want closing the drawer to preserve the Today list’s order, state, and scroll context, so that I return where I started.
43. As a signed-in User, I want Overview, Goals, and Settings tabs inside the drawer, so that secondary capabilities remain focused.
44. As a signed-in User, I want the tabs to use a correctly sized warm background with an equally aligned active chip, so that the selected section is visually clear.
45. As a keyboard User, I want drawer tabs to use standard tab semantics and keyboard behavior, so that I can switch sections without a pointer.
46. As a signed-in User, I want Overview to show my current streak prominently, so that the main derived progress remains easy to find.
47. As a Build Habit User, I want Overview to explain the current Weekly Summary in a sentence, so that the numbers have context.
48. As a Build Habit User, I want Completed, Missed, Pending, and Rate summary cards to use one consistent warm background and border, so that values are visible without introducing unnecessary color coding.
49. As a Build Habit User, I want completion rate omitted when no Tracking Day has been assessed, so that the summary does not imply evidence that does not exist.
50. As a Break Habit User, I want the Build-only Weekly Summary omitted, so that Break Habits are not given Completion semantics.
51. As a signed-in User, I want every eligible Tracking Day from the Habit’s creation day through today available in Overview, so that I can correct recent and older history in one place.
52. As a signed-in User, I want Tracking Day cards ordered ascending from the Habit’s creation day through today, so that history reads chronologically.
53. As a signed-in User, I want Tracking Day cards to wrap vertically with at most five cards per row, so that the full history fits the drawer width without horizontal scrolling.
54. As a signed-in User, I want fewer columns on narrow screens, so that each Tracking Day card retains readable content and usable target size.
55. As a signed-in User, I want the drawer and all tab content constrained to the drawer width, so that no nested content expands beyond the sheet.
56. As a signed-in User, I want each Tracking Day card to show weekday, day, month, and a compact icon-only state marker, so that dates and outcomes remain scannable across month boundaries without a visually heavy badge.
57. As a signed-in User, I want Completion and Clean Day indicators highlighted in green, so that positive recorded or derived outcomes are scannable.
58. As a signed-in User, I want Relapse indicators highlighted in red, so that recorded Break Habit history remains distinct.
59. As a signed-in User, I want Pending indicators highlighted in yellow, so that unfinished today remains distinct from Missed.
60. As a signed-in User, I want Missed indicators to use a neutral treatment, so that ordinary missed Build Habit days are visible without destructive emphasis.
61. As a signed-in User, I want today selected by default when I open Overview, so that the current Tracking Day action is immediately available.
62. As a signed-in User, I want selecting a Tracking Day card to reveal its full date and current state without changing its record, so that selection is safe.
63. As a signed-in User, I want an explicit Add Completion or Add Relapse action for an unrecorded eligible day, so that historical mutations remain intentional.
64. As a signed-in User, I want an explicit destructive Remove Completion or Remove Relapse action for a recorded day, so that record deletion is clearly communicated.
65. As a signed-in User, I want future dates and dates before Habit creation absent from the editable Tracking Day grid, so that only eligible Tracking Days can be selected.
66. As a signed-in User, I want successful historical corrections to use success-type Sonner feedback, so that the saved result is acknowledged consistently.
67. As a signed-in User, I want up to two attached Goal names shown as understated context on a daily Habit card, with any remaining count disclosed, so that the intentions behind the Habit remain visible without masquerading as progress.
68. As a signed-in User, I want the Goals tab to list every Goal attached to the open Habit, so that Goal context remains lightweight and local.
69. As a signed-in User, I want an icon-only Add Goal control with an accessible name and tooltip, so that the tab header remains compact and understandable.
70. As a signed-in User, I want each Goal row to have one accessible ellipsis menu, so that Rename and Delete do not permanently clutter the list.
71. As a signed-in User, I want adding or renaming a Goal to use a focused shadcn Dialog with a structured header, explanation, labelled input, and aligned footer, so that editing feels intentional.
72. As a signed-in User, I want Goal success operations to use success-type Sonner feedback, so that their completion is consistent with other mutations.
73. As a signed-in User, I want Goal deletion to use a lightweight confirmation naming the Goal, so that accidental deletion remains preventable.
74. As a signed-in User, I want deleting a Goal to leave its Habit and tracking history unchanged, so that named intentions remain independent of recorded outcomes.
75. As a signed-in User, I want a Goal’s Habit attachment fixed after creation, so that Goal management remains predictable.
76. As a signed-in User, I do not want any Goal reassignment control, action input, or service operation, so that reassignment is removed from the product rather than merely hidden.
77. As a signed-in User, I want Settings to let me rename the Habit without changing its type, start date, Goals, or tracking history, so that wording can improve safely.
78. As a signed-in User, I want Habit deletion isolated in Settings, so that destructive collection management does not sit beside daily actions.
79. As a signed-in User, I want Habit deletion confirmation to name the Habit and explain that linked Goals and tracking history will also be deleted, so that the consequence is explicit.
80. As a keyboard User, I want Cancel to receive default focus in Habit deletion confirmation, so that the safe action is the default.
81. As a signed-in User, I want Add a Habit to open a focused three-step shadcn Dialog, so that creation teaches one decision at a time.
82. As a signed-in User, I want the creation Dialog centered and constrained on desktop but full-screen on narrow displays, so that the flow remains comfortable at every supported width.
83. As a signed-in User, I want step one to ask for the behaviour name with a visible label, so that the Habit can be scanned clearly after creation.
84. As a signed-in User, I want step two to present green Build and red Break choices with explanatory text, so that direction is understandable before I choose.
85. As a signed-in User, I want the creation flow to explain that Habit direction cannot change later, so that the immutable choice is informed.
86. As a signed-in User, I want step three to accept zero or several optional Goal names, so that I can capture attached intentions without being forced to do so.
87. As a signed-in User, I want the creation flow to explain that Goals can be added later, so that optional setup does not block Habit creation.
88. As a signed-in User, I want one Create Habit action on the final step regardless of Goal count, so that the submission point remains unambiguous.
89. As a signed-in User, I want draft values preserved when I navigate Back, so that revising an earlier choice does not discard later work.
90. As a signed-in User, I want no database writes before the final Create Habit action, so that abandoning the wizard cannot leave a partial Habit.
91. As a signed-in User, I want an untouched creation dialog to close immediately, so that opening it accidentally has no cost.
92. As a signed-in User, I want dismissal of a changed creation draft to open a Discard new Habit confirmation, so that accidental dismissal does not lose work silently.
93. As a keyboard User, I want creation dialogs and confirmations to manage focus and Escape behavior through standard shadcn primitives, so that the flow remains navigable.
94. As a signed-in User with no Habits, I want one welcoming empty state explaining Build and Break directions, so that I know how to begin.
95. As a signed-in User with no Habits, I want Add your first Habit to be the dominant action, so that the next step is obvious.
96. As a signed-in User with Habits in only one direction, I want both columns to remain visible and the empty column to explain what can be added, so that the information architecture stays stable.
97. As a signed-in User, I want all controls to meet a minimum 44-by-44-pixel target, so that pointer and touch interaction remain reliable.
98. As a keyboard User, I want visible focus indicators on every interactive control, so that I can understand my current position.
99. As a User who prefers reduced motion, I want transitions reduced without losing state information, so that the workspace remains comfortable and understandable.
100. As a signed-in User, I want overlays, menus, and tabs to use consistent short shadcn transitions, so that navigation feels responsive rather than abrupt.
101. As a signed-in User, I want icons paired with visible domain text in primary learning and action contexts, while compact secondary controls use accessible names and tooltips and Tracking Day markers expose their state through accessible labels and the selected-day panel, so that the interface remains both calm and learnable.
102. As a signed-in User, I want the experience to remain calm and free of points, badges, confetti, competitive systems, and punitive copy, so that daily tracking does not become gamified.
103. As a signed-in User, I want duplicate Habit and Goal names to remain valid, so that the redesigned interface does not introduce new uniqueness rules.
104. As a signed-in User, I want all reads and mutations scoped to my authenticated identity, so that the redesigned workspace preserves my private record.
105. As a signed-in User, I want cross-User resources treated as not found, so that the redesigned interface cannot disclose another User’s records.
106. As a signed-in User, I want strict date-only Tracking Days preserved through every action, so that deployment time zones cannot move my records.

## Implementation Decisions

- Implement the revamp inside the existing root Next.js application. The Vite/shadcn prototype is a throwaway primary source and must not be promoted directly into production.
- Keep Today as the only protected collection destination. Do not add a separate Habits page that duplicates the same collection.
- Continue using Server Components for authenticated reads, Server Actions for mutations, and server-only feature services as the only Prisma access point.
- Build a server-derived Today workspace read model containing ordered Habits, attached Goals, today’s recorded state, current streaks, the current Weekly Summary where applicable, and the date-only records needed to project every eligible Tracking Day.
- Derive today on the server from the persisted User Time Zone. Exchange Tracking Days as strict `YYYY-MM-DD` values and preserve the existing date-only module as the single calendar boundary.
- Preserve oldest-created-first Habit ordering. Never sort by today’s state, streak, name, or mutation recency.
- Introduce the shadcn/ui primitives demonstrated by the prototype into the production package. Use Radix-backed Sheet, Dialog, AlertDialog, Tabs, DropdownMenu, Tooltip, and Button behavior, plus Sonner for transient mutation feedback.
- Adopt only the shadcn primitives the resolved workspace needs. Do not introduce a general component abstraction layer or migrate authentication UI merely for consistency.
- Keep Tailwind CSS v4 and the documented semantic token approach. Add semantic Build, Break, Pending, and companion soft-surface tokens rather than embedding raw palette values in feature markup.
- Use green for Build Habit type cues, red for Break Habit type cues, yellow for Pending, emerald for Completion and Clean Day outcomes, red for Relapse outcomes, and neutral surfaces for Missed and ineligible states.
- Keep functional meaning independent of color. Pair every type and state color with visible text and a consistent line icon.
- Keep routine Habit cards on the default white surface and standard border in every daily state. Recording and Undo may change the status badge, action, icon, streak, and weekly strip, but must not change the card background or card position.
- Give the main Habit-card row a stable minimum height. Put the status badge beneath the Habit name and render exactly one daily action in the right-side action region.
- Use a green sprout for Build Habit type, a red shield for Break Habit type, a circled check for Completion, a checked shield for Clean Day, an interrupted circle for Relapse, a clock for Pending, a minus for Missed, a waypoint/flag for Goal, and one amber flame for both Build Streak and Clean Streak.
- Treat the amber flame solely as a compact streak glyph. Do not animate it, escalate it at milestones, or attach reward language to it.
- Render Done today as the prominent green Build Habit action. Render I relapsed as a distinct red sensitive action using the interrupted-circle icon. Render Undo as a compact neutral ghost action using a return icon while retaining at least a 44-pixel target.
- Keep the Today header’s Add a Habit action primary. Keep Add your first Habit primary in the zero-Habit state. A one-direction empty column may retain a lower-emphasis Add action.
- Implement daily tracking as desired-state mutations, not toggles. Optimistically render the requested Completion or Relapse state, disable repeat submission while pending, and reconcile with the Server Action result.
- On daily mutation success, retain the new card state and show success-type Sonner feedback. On failure, restore the authoritative previous state, announce the rollback, and render a recoverable error.
- Do not place Undo inside Sonner. Its availability is derived from today’s persisted Completion or Relapse and therefore survives refresh.
- Use one wide right-side shadcn Sheet for Habit details. Constrain every nested layer to the Sheet width and hide horizontal overflow at the Sheet, tab root, tab content, and section boundaries.
- Use a full-width Sheet on narrow screens and a constrained wide Sheet on larger screens. Let Radix manage focus trapping, Escape dismissal, overlay semantics, and focus return.
- Style Overview, Goals, and Settings as a three-column tab list with a warm shared background, equal-height triggers, and a solid active chip. Preserve native tab semantics and keyboard behavior.
- Render the Build Habit Weekly Summary sentence and its four values in Overview. Use one consistent warm background and border for Completed, Missed, Pending, and Rate cards; do not assign each card a separate color.
- Render all eligible Tracking Days from `startDate` through today in ascending date order. Do not retain a separate rolling seven-day strip, Edit older history button, Popover, Calendar, or bounded date chooser.
- Lay out Tracking Day cards in a responsive grid that wraps vertically, uses fewer columns on narrow screens, and never exceeds five columns. Do not horizontally scroll the Tracking Day grid or allow it to enlarge the Sheet.
- Show weekday, calendar day, and month inside each Tracking Day card, with a compact icon-only state marker in the top-right corner. Include the full date and state in the card’s accessible name, and retain the visible state label in the selected-day action panel.
- Select today by default when the drawer opens. Selecting any other card changes selection only and never mutates a record.
- Reuse one explicit selected-day action panel for recent and older dates. Use Add Completion or Add Relapse for absent records and destructive Remove Completion or Remove Relapse for existing records.
- Generate editable Tracking Days only for the inclusive eligible interval from Habit creation through today. Do not render future or pre-creation dates in the editable grid.
- Keep the Today card’s Monday–Sunday strip read-only and compact. It may show future and ineligible markers because the calendar week can extend outside the eligible interval.
- Show at most the first two attached Goal names on each Today card in stable creation order beneath today’s status, followed by `+N more` when needed. Present the reminder as one subtle `surface-soft` control with a fixed waypoint icon and chevron around a horizontally wrapping middle row. Keep the visible `Goals` label, Goal names as borderless neutral surface chips, and `+N more` as an action-colored token; do not apply Build or Break colors. Truncate each Goal chip to one line at the available width, omit the reminder when there are no Goals, and open the drawer directly on the Goals tab. The Goals tab remains the complete management surface.
- Use an icon-only Add Goal button with an accessible name and Tooltip. Use one DropdownMenu per Goal with Rename and Delete actions.
- Use a focused shadcn Dialog for Add Goal and Rename Goal. Give it a structured Goal management header, explanatory description, labelled input region, and visually aligned footer.
- Use AlertDialog for Goal and Habit deletion. Name the affected record, describe the consequences, and keep the safe cancellation action first in focus order.
- Remove Goal reassignment from the UI, Server Action schemas, feature-service interfaces, and mutation behavior. Renaming a Goal may change only its name; the attached Habit remains immutable.
- No database schema change is required to remove reassignment. Goal retains its Habit foreign key; immutability is enforced by the application mutation contract and authenticated service behavior.
- Replace the existing create-Habit form with an in-memory three-step draft: behaviour name, immutable Build/Break direction, and optional Goal names.
- Preserve draft values during backward navigation. Make no Server Action call until Create Habit on the final step.
- Add one authenticated feature-service operation that creates the Habit and its optional initial Goals in a single Prisma transaction. The Habit begins on today in the User Time Zone.
- If final creation fails, create neither the Habit nor any initial Goal and retain enough client draft state for the User to retry.
- Intercept creation-dialog dismissal. Close an untouched draft immediately; use an AlertDialog with Keep editing and destructive Discard actions after any draft value changes.
- Keep Habit rename and deletion in Settings. Habit type and start date remain immutable. Habit deletion continues cascading through Goals, Completions, and Relapses.
- Do not add a REST, GraphQL, tRPC, or client-owned persistence layer. Revalidate the Today workspace after successful Server Actions while preserving optimistic local continuity.
- Do not persist drawer tab, selected Tracking Day, wizard step, or draft values beyond the active interaction. These are transient interface states.
- Keep authentication presentation unchanged. The scope begins after the User enters the protected Today workspace.

## Testing Decisions

- A good automated test supplies public domain inputs at an existing seam and verifies an externally observable domain result, authorization result, or persisted state. Tests must not assert React component structure, Tailwind class strings, Radix internals, Prisma query shape, or private helper calls.
- Retain the two canonical automated seams already established by the application: pure date/projection tests and authenticated feature-service integration tests against migrated MySQL. Do not create a third automated seam solely for the revamp.
- Extend the pure date/projection tests to verify the inclusive eligible Tracking Day sequence from Habit creation through today, ascending order, midweek creation behavior, future exclusion, pre-creation exclusion, and status projection for Completion, Missed, Pending, Clean Day, and Relapse.
- Continue testing Build Streak, Clean Streak, and Weekly Summary behavior at the existing pure calculation seam. Add regression coverage only where the new workspace projection consumes an uncovered observable outcome.
- Extend authenticated feature-service integration tests to verify atomic Habit creation with zero, one, and several initial Goals; rollback when any initial value is invalid; ownership isolation; duplicate names; and persisted readability through a fresh Prisma Client.
- Extend Goal integration coverage to prove rename can change only the Goal name, reassignment input is no longer accepted by the public mutation contract, deletion leaves Habit tracking history intact, and cross-User access remains not found.
- Continue integration coverage for idempotent desired-state Completion and Relapse recording/removal, eligibility boundaries, type compatibility, cascades, and persistence. The redesign must call these existing behaviors rather than introduce alternate mutation paths.
- Do not add Playwright, Cypress, browser automation, snapshot tests, visual regression, or tests that inspect shadcn/Radix implementation details. This follows the repository’s existing browser-test decision and the explicit instruction not to automate a browser.
- Do not add React Testing Library solely to assert component markup. The production implementation should use semantic elements and shadcn primitives, then be reviewed at the rendered-behavior seam manually.
- Perform focused manual acceptance review of the populated, zero-Habit, and one-direction-empty Today states at approximately 375, 768, 1024, and 1440 pixels. Confirm no page or drawer horizontal overflow.
- Manually verify stable Habit-card height and order before and after Completion, Relapse, Undo, optimistic pending, success, and simulated failure rollback.
- Manually verify that success operations use success-type Sonner feedback, errors restore previous state, and Undo remains on the card rather than inside transient feedback.
- Manually verify Sheet, Dialog, AlertDialog, Tabs, DropdownMenu, and Tooltip keyboard behavior: logical tab order, visible focus, Escape dismissal, focus trapping, safe default focus, and focus return.
- Manually verify the Tracking Day grid contains every eligible date in ascending order, wraps at no more than five columns, remains inside the drawer width, uses readable state indicators, defaults selection to today, and mutates only through the explicit action panel.
- Manually verify Build and Break type cues are green and red respectively, Pending is yellow, the flame color is identical for both types, and no meaning depends on color alone.
- Manually verify the creation wizard preserves values through Back, creates nothing before final submission, supports zero or many Goals, confirms dirty dismissal, and returns to unchanged Today when cancelled.
- Manually verify Goal management contains Add, Rename, and Delete only; no reassignment selector, menu item, action field, or service behavior remains.
- During final issue verification, run Biome, TypeScript, the complete automated suite once, the production build once, and the documented Docker Compose verification once, then report every user-visible criterion as passed, failed, or delegated to human visual review.

## Out of Scope

- A separate Habits collection page or additional protected navigation destination.
- Authentication visual redesign, registration changes, profile management, or time-zone settings UI.
- Goal reassignment, Goal progress, Goal status, deadlines, targets, quantities, independent Goal completion, or Goal ordering.
- Habit schedules other than daily eligibility, skipped days, exemptions, quantities, or multiple daily records.
- Historical reporting, monthly analytics, charts, export, filtering, search, pagination, or weekly history beyond the current Weekly Summary.
- A separate older-history button, bounded date picker, calendar Popover, or seven-day-only drawer strip.
- Future Tracking Day editing or records before Habit creation.
- Persisted Clean Day rows or explicit daily clean check-ins.
- Points, reward badges, confetti, milestone celebrations, leaderboards, competitive systems, animated flames, or punitive Relapse messaging.
- Dark mode, broad theme customization, or redesign of unrelated public/authentication screens.
- A public API, client-side data cache library, repository abstraction, dependency-injection layer, or separate backend.
- Browser automation, screenshot testing, visual regression, or a new UI testing framework.
- Promoting the throwaway Vite prototype package or its in-memory state model directly into production.
- Database schema changes unrelated to an implementation-discovered integrity requirement. The resolved UX itself requires no new persisted product concept.
- Optimizing or virtualizing very long Tracking Day grids before evidence demonstrates a performance problem.

## Further Notes

- The validated shadcn prototype is a primary source for interaction feel and visual hierarchy, not production-quality code. Production implementation must be rewritten inside the existing Next.js architecture with real authentication, Server Actions, feature services, validation, and error handling.
- This specification records later prototype decisions that supersede conflicting earlier UX notes for this implementation: shadcn/ui is no longer deferred; Add a Habit is primary; every eligible Tracking Day appears in one ascending grid; the separate Edit older history flow is removed; Build and Break type colors are green and red; Habit card backgrounds remain unchanged; and the same amber flame represents both streak types.
- Red Break Habit cues must remain paired with neutral language, the Break label, and a shield/interrupted-circle vocabulary. The color must identify direction and Relapse state without labelling the User or Habit as bad.
- The all-dates Tracking Day grid is deliberately accepted for the current product scale. If evidence later shows that very old Habits make the drawer unwieldy, pagination, collapsing, or virtualization requires a separate UX decision rather than an implicit implementation deviation.
- Existing uncommitted domain and UX documentation changes must be preserved. Implementation work must not overwrite unrelated working-tree changes.
