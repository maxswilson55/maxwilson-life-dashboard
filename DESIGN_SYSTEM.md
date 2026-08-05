# Life Dashboard — Design System Guide

A dark, restrained, premium SaaS aesthetic — inspired by Linear and Attio. Built for a dense, data-rich personal dashboard, but the tokens and rules below are product-agnostic and safe to reuse in any dark-mode web app.

## Philosophy

- **Premium, precise, calm.** Not playful, not cartoonish, not neon, not a "gaming" interface.
- **Hierarchy from surface layering, not shadows.** Distinguish elements with small steps in background lightness, not heavy drop-shadows or glassmorphism.
- **Purple is the signature accent — used selectively.** Active states, primary actions, focus rings, selected filters. Never use it to color every card or every icon; if everything is purple, nothing reads as "important."
- **Semantic color means something.** Red/amber/blue/green are reserved for genuine status (priority, category) — never decorative.
- **Restraint over decoration.** One gradient (the primary action button) is enough. No gradients under charts, no glow effects, no drop-shadows on every card.

## Color tokens

```css
:root {
  /* Surfaces — layered, not pure black */
  --bg: #08090c;
  --surface: #0f1116;
  --surface-2: #13151b;
  --surface-hover: #181b22;

  /* Text */
  --text: #f4f2f7;        /* off-white, never pure #fff */
  --muted: #9895a1;       /* secondary labels */
  --muted-2: #65636d;     /* placeholders, faint metadata */

  /* Borders — translucent white, not gray hexes, so they work over any surface */
  --border: rgba(255, 255, 255, 0.07);
  --border-strong: rgba(255, 255, 255, 0.12);
  --border-active: rgba(151, 91, 255, 0.45); /* focus / active input border */

  /* Purple accent */
  --accent: #8b5cf6;
  --accent-bright: #a970ff;
  --accent-soft: rgba(139, 92, 246, 0.14);   /* active-state backgrounds */
  --gradient: linear-gradient(135deg, #8b5cf6, #a970ff); /* primary buttons ONLY */

  /* Semantic status (used for priority, not decoration) */
  --high: #f06f7d;      --high-bg: rgba(240, 111, 125, 0.13);
  --medium: #f3b95f;    --medium-bg: rgba(243, 185, 95, 0.13);
  --low: #66a6ff;       --low-bg: rgba(102, 166, 255, 0.13);

  /* Category / secondary semantic pairs — extend this pattern per domain */
  --work-bg: rgba(102, 166, 255, 0.13);   --work-text: #7fb4ff;
  --personal-bg: rgba(82, 211, 155, 0.13); --personal-text: #52d39b;

  --shadow: 0 1px 2px rgba(0,0,0,0.3), 0 1px 8px rgba(0,0,0,0.2); /* sparing use only */
}
```

**Rule of thumb for new semantic colors:** pick a saturated foreground hex, then derive its `-bg` variant as the same hue at ~13–16% opacity via `rgba()`. Never hand-pick an unrelated pastel for the background — it should read as "the same color, dimmed," so foreground text stays legible on it.

## Typography

- System font stack, no webfont dependency: `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif`
- Scale actually used in this app:
  - Page title: `1.3rem` / weight 700 / `letter-spacing: -0.01em`
  - Section heading (card title): `0.9rem` / weight 600
  - Column/group label (all-caps eyebrow): `0.72–0.8rem` / weight 600–700 / `text-transform: uppercase` / `letter-spacing: 0.04–0.05em` / color `var(--muted)`
  - Body / item title: `0.9–0.95rem`
  - Metadata (dates, counts, secondary text): `0.75–0.85rem` / color `var(--muted)`
  - Badges/pills: `0.66–0.78rem` / weight 600–700 / uppercase for status badges
- **Numbers get `font-variant-numeric: tabular-nums`** anywhere they might update or sit in a list (stats, times, dates) so digits don't jiggle.
- Primary text is `var(--text)` (off-white `#f4f2f7`), never `#ffffff` — pure white feels harsh against the near-black surfaces.

## Spacing

No formal 4px-grid enforcement, but the values in practice cluster around:

- `0.3–0.5rem` — tight gaps between inline elements (badge to text, icon to label)
- `0.6–0.7rem` — internal card padding, gap between stacked rows
- `1rem` — card padding, gap between grid columns
- `1.25–1.5rem` — margin between major stacked sections

## Border radius

- Cards / panels: `10px`
- Buttons / inputs / chips: `6px`
- Small badges/pills: `5px` (deliberately *not* fully round — pill-shaped badges read as more casual; this system uses gently-rounded rectangles instead, reserving true pills only for the scope-tab segmented control and the round checkbox)
- Checkbox: fully round (`border-radius: 50%`), 18×18px, 1.5px border

## Core component patterns

**Card / panel** (the base container for any grouped content):
```css
background: var(--surface);
border: 1px solid var(--border);
border-radius: 10px;
padding: 1rem;
/* no box-shadow by default */
```

**List item / row card** (task, event, suggestion — anything repeated in a list):
```css
display: flex;
align-items: flex-start; /* or center, for single-line rows */
gap: 0.6rem;
background: var(--surface);
border: 1px solid var(--border);
border-left: 2px solid var(--border); /* becomes colored for status, see below */
border-radius: 8px;
padding: 0.6rem 0.7rem;
transition: background-color 0.12s ease, border-color 0.12s ease;
```
On hover: `background: var(--surface-hover)` — no lift/shadow, just a surface-level change.

**Status indicator on a list item:** color only the 2px left border (via a `data-status="x"` attribute selector, not a shared class — see the CSS specificity trap below), plus a small badge with matching `-bg`/foreground pair. Never tint the entire row's background to the status color — that reads as "alert," not "categorized."

**Primary button:**
```css
background: var(--gradient);
color: white;
border: none;
border-radius: 6px;
padding: 0.5rem 1.2rem;
font-weight: 600;
```
This is the *only* place the gradient appears. Everywhere else, flat `var(--accent)` or `var(--accent-soft)`.

**Secondary / ghost button:**
```css
border: 1px solid var(--border-strong);
background: transparent;
color: var(--text);
border-radius: 6px;
```
On hover: `border-color: var(--border-active); color: var(--accent-bright);`

**Segmented control / tab group (e.g. filter tabs):**
```css
/* container */
display: flex;
background: var(--surface);
border: 1px solid var(--border);
border-radius: 8px;
padding: 3px;
gap: 2px;

/* inactive tab */
color: var(--muted);
border-radius: 6px;

/* active tab — the ONE recommended use of accent-soft as a fill */
background: var(--accent-soft);
color: var(--accent-bright);
font-weight: 600;
```

**Chip (selectable filter-like control, e.g. date presets):**
```css
border: 1px solid var(--border);
background: var(--surface-2);
color: var(--muted);
border-radius: 6px;
padding: 0.35rem 0.7rem;

/* selected */
background: var(--accent-soft);
border-color: var(--border-active);
color: var(--accent-bright);
```

**Text input / select:**
```css
background: var(--surface-2);
border: 1px solid var(--border);
border-radius: 6px;
color: var(--text);
padding: 0.5rem 0.65rem;

/* focus */
border-color: var(--border-active);
```

**Toast / undo notification:**
```css
position: fixed;
bottom: 1.25rem;
left: 50%;
transform: translateX(-50%);
background: var(--surface-2);
border: 1px solid var(--border-strong);
border-radius: 8px;
box-shadow: 0 4px 20px rgba(0,0,0,0.4); /* the one deliberate shadow in the system */
```

## States & accessibility

- **Focus:** every interactive element gets `outline: 2px solid var(--accent-bright); outline-offset: 2px;` via `:focus-visible` — never remove focus outlines without replacing them.
- **Reduced motion:** wrap all transitions in `@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }`.
- **Never encode meaning by color alone.** Every status badge pairs its color with a text label (e.g. "HIGH", not just a red dot).
- **Hover states are subtle:** a background-color shift to `var(--surface-hover)`, not scale/lift/shadow effects.

## A specific bug to avoid

If a status/priority class name (e.g. `.priority-high`) is used both on a small badge *and* as a marker on its parent card, a plain class selector like `.priority-high { background: ... }` will leak that background onto the parent too if it's declared later in the stylesheet than the parent's base style (equal specificity, source order wins). Fix: use a `data-*` attribute (e.g. `data-priority="high"`) for the parent-level marker instead of reusing the badge's class name, or use a compound selector (`.card.priority-high`) to force higher specificity regardless of source order.

## What to avoid

- Pure black backgrounds (`#000`) or pure white text (`#fff`)
- Heavy box-shadows on every card, glassmorphism, backdrop blur on cards
- Multiple gradients — one, on the primary action, is the budget
- Fully-rounded "pill" buttons for everything — reserve true pills for segmented controls and status dots
- Color-only status communication
- Filling an entire card/row background with a status color (tint the border + badge instead)
- Decorative icons with no label
