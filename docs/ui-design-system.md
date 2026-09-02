# Habit Shaper UI design system

This foundation keeps Habit Shaper calm, warm, intentional, and lightweight. It supports the current authentication and protected screens and gives later Habit slices a small visual vocabulary without committing to a component library.

## Visual principles

1. **Quiet encouragement, not gamification.** Use generous space, plain language, and restrained emerald accents. Avoid badges, confetti, competitive imagery, and decorative motion.
2. **Warm structure.** Warm cream frames white surfaces; amber identifies the product and primary actions; slate keeps reading contrast high.
3. **Content before decoration.** Depth comes from one subtle warm shadow and borders. Gradients are reserved for broad brand areas, not controls.
4. **Desktop-focused, responsively complete.** The protected experience prioritizes desktop scanning, keyboard and pointer use, and efficient use of available width. Mobile remains functionally complete as a readable single-column adaptation. Authentication stays stacked until both panels have enough room for its split layout.
5. **Explicit over abstract.** Compose Tailwind utilities in the feature markup. Extract a convention only after repeated product states prove that a shared component would reduce complexity.

## Tailwind foundation

Tailwind CSS v4 runs through `@tailwindcss/postcss` in `postcss.config.mjs`. `src/app/globals.css` contains the Tailwind import, semantic `@theme` values, font bindings, and the few defaults that truly apply to the whole document. Product styling belongs in Tailwind utilities; do not recreate a parallel global class system.

Semantic tokens intentionally describe roles rather than page-specific colors:

| Role | Tailwind token | Value | Use |
| --- | --- | --- | --- |
| Brand | `brand` | `#92400e` | Brand marks and identity |
| Action | `action` | `#a94f08` | Primary actions and links |
| Action hover | `action-hover` | `#863d05` | Hover/active emphasis |
| Accent | `accent` | `#047857` | Restrained progress and success cues |
| Build | `build` | `#047857` | Build Habit direction and Completion cues |
| Break | `break` | `#b91c1c` | Break Habit direction and Relapse cues |
| Pending | `pending` | `#a16207` | Unfinished current-day cues |
| Streak | `streak` | `#b45309` | Shared Build Streak and Clean Streak flame |
| Background | `background` | `#fffbeb` | Application canvas |
| Surface | `surface` | `#ffffff` | Cards, forms, and controls |
| Foreground | `foreground` | `#172033` | Primary text |
| Muted foreground | `muted-foreground` | `#596274` | Supporting copy |
| Border | `border` | `#d8c8b8` | Surface separation |
| Destructive | `destructive` | `#b91c1c` | Validation and destructive actions |
| Focus ring | `focus-ring` | `#b45309` | Keyboard focus |

Soft companion tokens (`brand-soft`, `accent-soft`, `build-soft`, `break-soft`, `pending-soft`, `surface-soft`, and `destructive-soft`) are backgrounds only; they never replace the corresponding foreground role. `build-hover` provides Build action emphasis, `brand-glow` is reserved for the broad authentication-panel gradient, and `input-border` gives form controls enough boundary contrast without making every surface border heavy.

Use named radii (`field`, `panel`, `card`, `mark`, `mark-small`), shadows (`card`, `action`, `brand`), and content widths (`auth`, `app`, `copy`, `note`) instead of introducing isolated values. These generate utilities such as `rounded-field`, `shadow-card`, and `max-w-app`.

## Typography

Lora is the display face for page and section headings. Raleway is the interface and body face. Both are self-hosted by Next.js through `next/font/google`, exposed as `font-display` and `font-sans`, and use `display: swap`; do not add stylesheet font imports.

- Body: 16px minimum, `leading-relaxed`, Raleway regular or medium.
- Labels and actions: Raleway semibold/bold; never rely on color alone for meaning.
- Headings: Lora semibold, compact line height, slightly tightened tracking.
- Long copy: constrain with `max-w-copy`; forms use `max-w-auth`.

## Spacing and responsive layout

Tailwind's base spacing unit is 4px. Prefer even steps that preserve the 4/8px rhythm (`gap-2`, `p-4`, `mt-6`, `p-8`) and use in-between steps only where optical balance requires them.

Authentication is stacked by default. At `lg`, it becomes a two-column brand/form split; each side retains a readable minimum width. Optional supporting details can disappear on narrow screens, but the page heading, privacy message, form labels, errors, and navigation remain. The protected experience uses desktop as its primary composition target while adapting into a complete single-column experience on narrower screens. It uses `max-w-app` with 16px mobile and 24px larger-screen gutters. Validate layouts at approximately 375px, 768px, 1024px, and 1440px without horizontal scrolling.

## Component and state conventions

- **Primary button:** `bg-action text-white`, `min-h-12`, `rounded-field`, visible hover/focus, and reduced opacity plus `cursor-not-allowed` while disabled.
- **Secondary button:** white surface, standard border, foreground text, and a warm hover surface.
- **Inputs:** visible labels, 48px minimum height, `input-border`, white surface, and an amber focus border/ring. `aria-invalid` also changes the border to `destructive`.
- **Errors:** place field errors next to their field and associate them with `aria-describedby`; use `role="alert"` for form-level failures. Pair destructive text with a border or soft surface where useful.
- **Cards and rows:** white `surface`, `border`, `rounded-card`, and `shadow-card` only for primary containers. Routine Habit rows are flatter: use a standard border, compact spacing, a smaller named radius, and no card shadow. Reserve stronger separation and shadow for overlays such as the creation dialog and Habit drawer. Nested empty states use `surface-soft`, a smaller radius, and no second large shadow.
- **Loading:** retain the button size, change its label to an ongoing phrase, and disable repeat submission. Time-zone detection has adjacent status copy.
- **Empty states:** explain what is absent and what comes next. Icons are decorative SVGs, not emoji.

## Accessibility and motion

Normal text/color pairs must meet WCAG AA (4.5:1). Keep semantic landmarks and heading order, visible labels, browser autocomplete hints, and programmatic error associations. Interactive controls use at least a 44×44px target; the current controls use 48px minimum height. Every interactive element needs an amber `focus-visible` outline or ring with sufficient offset—never remove focus without replacing it.

Use motion only to clarify interaction. Color, border, and shadow transitions should stay around 150–200ms and include `motion-reduce:transition-none`. Do not add entrance choreography or an animation library. Content and state changes must remain understandable with motion disabled.

## Preferred Tailwind usage

Keep role tokens and responsive intent visible in markup:

```tsx
<button className="min-h-12 rounded-field bg-action px-5 font-bold text-white transition-colors hover:bg-action-hover focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-focus-ring motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60">
  Save Habit
</button>
```

Avoid raw palette values and long-lived global selectors in product UI:

```tsx
// Avoid: page markup owns an unlabelled palette and bypasses shared states.
<button className="rounded-[10px] bg-[#a94f08] text-[#fff]">Save</button>
```

## shadcn/ui usage

The Today workspace introduces a deliberately small shadcn/ui foundation for repeated interactive behavior: Button, Dialog, and Sonner feedback. These local components use Radix behavior, Lucide line icons, the existing semantic tokens, and the same focus, target-size, and reduced-motion conventions as native controls. Authentication remains unchanged, and additional primitives should be added only when a resolved product interaction requires them.
