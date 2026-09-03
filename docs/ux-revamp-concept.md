# Habit Shaper UX Revamp Concept

## Status

Final UX baseline for the production Today workspace. The throwaway prototypes remain reference artifacts on the isolated `prototype/today-workspace` branch; production is implemented independently in the root Next.js application.

## Resolved UX direction

- **Primary opening experience:** Today is an action-first destination. It gives unfinished Build Habits stronger action emphasis, presents completed Build Habits as settled without reordering either state, and treats Break Habits as passively clean with a secondary Relapse action. The intended daily loop is scan, record an outcome if needed, confirm the result, and leave. Habit creation and management are deliberately secondary.
- **Single Today workspace:** Today is the only protected collection destination because every Habit is eligible daily and a separate Habits view would duplicate the same collection without a distinct capability. `Add a Habit` remains visible in Today, and each card opens its Habit drawer for secondary management. Uncommon controls do not return to the daily card itself.
- **Primary usage context:** The protected experience is desktop-focused, optimizing scanning, density, keyboard and pointer use, and available width. Mobile remains functionally complete, accessible, and free of horizontal overflow, but it is a responsive adaptation rather than the primary composition target.
- **Habit details presentation:** Habit details open in a wide right-side drawer over Today, leaving enough of the desktop list visible to preserve context. On narrow screens it becomes a full-screen layer with an explicit back or close control. Dismissal returns the User to the same list position and state. Three focused tabs prevent it from becoming another administration screen: Overview owns streaks, recent corrections, and the Weekly Summary where applicable; Goals owns Goal management; Settings owns rename and deletion. Deleting a Habit is available only in Settings and opens a confirmation dialog naming the Habit and explaining that linked Goals and tracking history will also be deleted. `Cancel` receives default focus; confirmation does not require typing the potentially non-unique Habit name.
- **Today’s Build Completion:** An incomplete Build Habit has a prominent `Done today` action. After recording, it becomes the settled `Done for today` status with a persistent, lower-emphasis `Undo` action. The completed card itself is not a toggle, and correction does not depend on a short-lived toast.
- **Today’s Relapse:** A Break Habit defaults to the implicit `Clean today` status with a separate, secondary `I relapsed` action. Recording takes one explicit click without confirmation, then shows the neutral `Relapsed today` status and a persistent `Undo` action. The card itself is not clickable, and the treatment avoids alarm styling or shame-oriented copy.
- **Optimistic daily feedback:** Recording and Undo update the card immediately while saving. A failed save restores the authoritative previous state and presents an error. `Undo` is not a temporary toast: it remains visible whenever today has a Completion or Relapse, including after refresh or a later sign-in.
- **Progress disclosure:** Today cards show only the current Build Streak or Clean Streak and a read-only current Monday–Sunday status strip. Detailed Weekly Summary information is omitted there. The Habit drawer explains every day with text as well as shape and color, provides the Build Habit’s Monday–Sunday summary sentence and counts, and contains every eligible Tracking Day from Habit creation through today in one ascending, vertically wrapping grid of at most five columns. Selecting a day reveals its full date and current state before presenting an explicit `Add Completion`, `Remove Completion`, `Add Relapse`, or `Remove Relapse` action; selecting the day itself never toggles the record. There is no separate older-history picker.
- **Product personality:** Habit Shaper uses calm, focused encouragement: more humane than a productivity dashboard and more purposeful than a generic wellness app. Responsive feedback may feel satisfying, but rewards do not drive the experience. `Quiet encouragement, not gamification` remains firm: acknowledge progress warmly without points, reward badges, confetti, competitive systems, punitive Relapse treatment, or escalating rewards. One static amber flame is an informational streak glyph for both Habit types, never a reward or animation.
- **Visual foundation:** Preserve the warm cream canvas, white surfaces, amber actions, restrained emerald success cues, Lora headings, and Raleway interface text. Shift the protected experience from editorial landing-page composition to a calmer desktop workspace through smaller headings, less decorative whitespace, compact bordered Habit rows, and flatter routine surfaces. Reserve meaningful shadow for overlays such as the creation dialog and Habit drawer; authentication remains visually unchanged.
- **Resolved icon vocabulary:** Use one restrained line-icon family with visible text: a green sprout for Build Habit, red shield for Break Habit, circled check for Completion, checked shield for Clean Day, interrupted circle for Relapse, one static amber flame for both streak types, and waypoint for Goal. Pending uses a yellow clock; future and ineligible days use distinct muted outline treatments.
- **Restrained delight:** The workspace relies on immediate state, icon, color, and streak feedback rather than milestones or reward mechanics. The shared amber streak flame is never animated.
- **Today layout:** Desktop uses separate Build Today and Break Today columns so the two daily meanings remain distinct. Each column preserves a stable oldest-created-first order; recording or undoing today’s outcome never moves a card. Incomplete Build cards retain stronger action emphasis, while completed cards settle visually in place. On narrow screens the columns stack with Build Today first.
- **Today header:** The protected workspace replaces the oversized introductory hero with a compact `Today` heading, the full local date determined by the User Time Zone, the restrained line `Shape one day at a time`, and a primary `Add a Habit` action. Email and sign-out remain available in a quiet utility area so the daily collection receives most of the canvas. The zero-Habit empty state likewise promotes `Add your first Habit` as its dominant primary action.
- **Empty Today states:** With no Habits, the two columns give way to one welcoming explanation of Build and Break directions and a prominent `Add your first Habit` action; zero-value progress is omitted. If only one direction is empty, both columns remain and the empty column contains a compact explanation with a low-emphasis Add action.
- **Goal disclosure:** Goal names do not appear during daily tracking because Goals have no priority, status, or independent progress. The Habit drawer presents attached Goals with minimal visual weight. A Goal’s Habit attachment is fixed at creation; Goal reassignment is not part of the product. The Goals-tab header uses an icon-only Add control with an accessible name and tooltip; each Goal row has one accessible ellipsis menu containing `Rename` and `Delete`, and deletion uses a lightweight confirmation.
- **Habit creation flow:** `Add a Habit` opens a focused dialog containing a three-step experience to maximize focus and teaching space: name the behaviour, choose the immutable Build or Break direction, then optionally add Goals. Values survive backward navigation, and the Habit is created only from the final step. The optional Goals step always ends with one primary `Create Habit` action, whether zero or several Goal names are present; explanatory copy says Goals can be added later, and `Back` remains secondary. The dialog is centered and constrained on desktop, becomes full-screen on narrow displays, and closes back to the unchanged Today workspace. An untouched wizard closes immediately; after any draft value changes, dismissal requires a `Discard new Habit?` confirmation with `Keep editing` and destructive `Discard` actions.

## Problem

Before the revamp, the application presented most behavior as permanently visible forms. Each Habit card combined daily tracking, progress, Habit renaming, Goal creation and management, historical corrections, and deletion.

The functionality was available, but the interface felt like an administration screen rather than a lightweight daily companion. Common actions and uncommon management actions received similar visual weight.

## Design objective

Make the daily Habit interaction quick, intuitive, encouraging, and enjoyable while preserving Habit Shaper's private, date-correct domain behavior.

A User should be able to open the application, understand today's status, record a Completion or Relapse, and see the result within a few seconds.

## Core principle

> Common actions should take one tap. Uncommon actions should remain available but appear only when requested.

Forms are still appropriate for creating and editing records, but they should not dominate the normal daily experience.

## Resolved information architecture

### Today

The default destination and primary daily experience.

- Show today's Build Habits and Break Habits as compact, scannable cards or rows.
- Emphasize current status and the action relevant to today.
- Show the current Build Streak or Clean Streak without overwhelming the daily action.
- Provide immediate optimistic feedback and a safe way to undo mistakes.

Today is also the collection surface: `Add a Habit` is available in its header, while selecting a Habit opens secondary management without duplicating the collection on another page.

### Habit details drawer

A wide right-side drawer over Today contains secondary information and uncommon actions.

- Historical Tracking Day corrections
- Weekly Summary
- Goals
- Rename Habit
- Delete Habit

On narrow screens, this becomes a full-screen layer and returns the User to the same Today position when dismissed.

## Daily interaction concepts

### Build Habit

Present one prominent control for today's Completion.

- Incomplete action: `Done today`
- Completed status: `Done for today`
- A persistent, lower-emphasis `Undo` action removes today’s Completion; the card and status are not toggles.
- Preserve optimistic updates so the result feels immediate, then restore the previous state and show an error if saving fails.

### Break Habit

A Break Habit is automatically clean when no Relapse exists, so the interface must not imply that a User needs to submit a daily clean check-in.

- Default state: `Clean today`
- Secondary action: `I relapsed`
- After recording: show `Relapsed today` and a persistent, lower-emphasis `Undo` action.
- Use supportive, neutral language. Avoid shame-oriented failure messaging or overly punitive visuals.

### Historical corrections

Do not expose a date input or separate older-history picker.

- Keep the Today card’s current Monday–Sunday strip read-only.
- Show every eligible Tracking Day from Habit creation through today in one ascending grid inside the Habit drawer.
- Wrap the grid vertically, use fewer columns on narrow screens, and never exceed five columns or the Sheet width.
- Selecting a day reveals its labelled state and an explicit add or remove action; it does not mutate immediately.
- Continue enforcing the Habit creation boundary and rejection of future dates.

## Progressive disclosure

A normal Habit card should show only:

- Habit name
- Build or Break type
- Today's status and action
- Current streak
- Compact weekly progress
- A details or overflow control

Move the following behind details, a menu, drawer, or dedicated screen:

- Rename Habit
- Add, rename, or delete Goals
- Delete Habit

Destructive actions should not sit beside routine daily actions.

## Habit creation concept

Replace the large permanently visible form with a clear `Add a Habit` action that opens a short wizard.

### Step 1: Name the Habit

Ask `What behaviour do you want to shape?` and provide one focused text input.

### Step 2: Choose the direction

Present two large, understandable choices rather than only a select field:

- **Build** — something the User wants to perform
- **Break** — something the User wants to avoid

Explain that this choice cannot be changed after creation.

### Step 3: Add optional Goals

Explain Goals as named intentions attached to the new Habit, not separate tasks or progress trackers.

- Allow the User to enter multiple Goal names.
- Provide an `Add another` action.
- Explain that Goals are optional and can be added later.
- Finish with one clear `Create Habit` action whether the step contains zero or several Goals.

The wizard should preserve values when moving backward. Prefer collecting the draft without database writes and creating the Habit and initial Goals together on final submission, so abandoning the wizard does not leave a partially configured Habit. The exact atomic service boundary requires technical design before implementation.

## Progress presentation

Make progress understandable at a glance rather than presenting every number with equal weight.

Resolved hierarchy:

1. Today card: current Build Streak or Clean Streak
2. Today card: read-only current-week visual strip
3. Habit drawer: every eligible Tracking Day in ascending interactive history
4. Build Habit drawer: a short Weekly Summary sentence, such as `4 of 5 assessed days completed`, followed by detailed completed, missed, pending, and completion-rate values when a rate is available

Any visualization must preserve the distinction between completed, missed, pending, ineligible, Clean Day, and Relapse states.

## Restrained delight

Fun should come from responsive interaction and encouragement rather than competitive gamification.

Selected techniques:

- Satisfying check-state transition
- Immediate status, color, and icon response
- A gently updating streak value
- Short confirmation such as `Done for today`
- Motion around 150–250 ms with reduced-motion support

Milestone messages remain out of scope. Avoid confetti, points, leaderboards, competitive or reward badges, animated flames, and decorative motion. The shared static amber flame communicates streak continuity only.

## Icon vocabulary

Use a small, consistent SVG icon family to make domain terms and actions easier to scan. Icons should reinforce text rather than replace important terms, especially while Users learn the difference between Build Habits, Break Habits, Completions, Relapses, Goals, and streaks.

Resolved mappings:

| Concept | Visual | Guardrail |
| --- | --- | --- |
| Build Habit | Green sprout | Keep the `Build` label visible. |
| Break Habit | Red shield | Avoid imagery or language that labels the User or Habit as bad. |
| Completion | Check inside a circle | Pair with Completion or Done text. |
| Clean Day | Shield with a check | Keep distinct from a submitted Completion because Clean Days are implicit. |
| Relapse | Interrupted circle | Pair with neutral Relapse text rather than punitive warning imagery. |
| Build/Clean Streak | Shared amber flame | Keep it static, identical for both Habit types, and strictly informational. |
| Goal | Waypoint | Prefer intention-oriented imagery over progress meters. |
| Pending | Yellow clock | Pair with Pending text and shape, not color alone. |
| Missed | Neutral minus | Avoid making an ordinary missed day look like a destructive error. |
| History/details | Calendar | Use for the eligible Tracking Day Overview. |
| Add/edit/delete/more | Plus, pencil, trash, ellipsis | Familiar controls may be compact but still require accessible names. |

Icon rules:

- Use SVG icons, not emoji.
- Use one visual family with consistent stroke weight, sizing, and corner treatment.
- Keep labels beside domain and sensitive-action icons.
- Give every icon-only control an accessible name and, where useful, a visible tooltip.
- Combine status icons with text, shape, and color so meaning never depends on color alone.
- Keep decorative icons out of the accessibility tree.

The resolved mapping pairs every icon and color with visible text so meaning never depends on appearance alone.

## Accessibility and interaction guardrails

- Keep interactive targets at least 44×44 px.
- Preserve keyboard navigation and visible focus states.
- Do not rely on color alone for tracking status.
- Use clear text labels for unfamiliar icons.
- Announce optimistic status changes appropriately.
- Maintain sufficient contrast and reduced-motion behavior.
- Ensure one-tap convenience does not make destructive or sensitive actions easy to trigger accidentally.

## Technical assumptions

Most of the concept should reuse the existing domain and application boundaries:

- Server Components for reads
- Server Actions for mutations
- Existing feature services and Prisma behavior
- Idempotent desired-state tracking mutations
- User ownership and authenticated server-side boundaries
- User Time Zone and strict date-only Tracking Days

The revamp is expected to be primarily an information-architecture and interaction redesign. New persisted product concepts should not be added unless the design demonstrates a real need.

## Session outcome

The core daily journey, single-workspace information architecture, interaction safety, progressive disclosure, desktop-focused responsive model, creation flow, product personality, and visual foundation are resolved above. Goal attachment is immutable, shadcn/ui is adopted for the specified interaction primitives, and every eligible Tracking Day is available in the drawer without an older-history picker.

## Production handoff

The evaluated prototype informed this baseline but is not production architecture. Its source remains isolated on the `prototype/today-workspace` branch and is not imported by, bundled with, or required to run the root Next.js application.
