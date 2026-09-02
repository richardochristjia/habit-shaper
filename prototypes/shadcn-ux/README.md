# Habit Shaper shadcn interaction prototype

**Throwaway prototype. This is not production application code.**

This iteration asks whether shadcn's default Radix-backed interaction behavior makes the resolved Today workspace more pleasant to navigate without changing Habit Shaper's domain language or UX direction.

It uses shadcn `Sheet`, `Dialog`, `AlertDialog`, `Tabs`, `DropdownMenu`, `Tooltip`, `Button`, Sonner, and form primitives. All records remain in memory. The drawer presents every eligible Tracking Day in a responsive grid, oldest first.

## Run

From the repository root:

```bash
npm --prefix prototypes/shadcn-ux run dev
```

Open the URL printed by Vite (normally `http://localhost:5173`).

The floating **Throwaway prototype** menu switches between populated, empty, and Build-only Today states and can make the next daily save fail for rollback testing.
