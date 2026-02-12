---
name: frontend-design
description: Create distinct, high-performance "Single Hand Solo Operator" (SHASO) interfaces. Use this skill for all UI tasks. Enforces the "Abyssal" palette (Ink/Jet/Teal), tablet-touch ergonomics, and touch-first interaction models. Replaces generic web design patterns with POS-specific efficiency.
---

# Frontend Design: The SHASO Standard

**Philosophy**: "No mouse, no keyboard, mostly 1 finger."
**Target**: Single Hand Solo Operator (Tablet/Index Finger) in a chaotic environment.

## 1. The "Abyssal" Palette (Strict Enforcement)

We do NOT use standard gray/zinc. We use rich, deep, blue-tinted blacks.

- **Ink Black (`#002029`)**: The Base.
  - `bg-ink-100` (`#000608`): Global App Background.
  - `bg-ink-500`: Brand/Header backgrounds.
- **Jet Black (`#00303d`)**: The Surface.
  - `bg-jet-500`: Cards, Panels, Modals.
- **Teals**: The Hierarchy.
  - **Teal Deep (`#004052`)**: Borders, Secondary elements.
  - **Teal Mid (`#005066`)**: Primary Buttons, Active States.
  - **Teal Bright (`#00607a`)**: Highlights, Selected states.

## 2. Touch Physics & "The Strike Zone"

- **Minimum Target**: **60px** height/width is the absolute minimum for standard interactions. 44px is allowed only for obscure settings.
- **Slab Buttons**: Prefer full-width or half-width "Slab" buttons (`h-16` to `h-20`) over pill buttons.
- **Placement**:
  - **Primary Actions**: Bottom 40% of screen.
  - **Read Only**: Top 30% of screen.
- **Feedback**: usage of `:active` is mandatory. Scale down (`scale-95`) or brightness change. `Hover` is irrelevant.

## 3. Typography Strategy

- **UI Text**: `Inter`. Clean, legible, high contrast.
- **Data/Price**: `Space Mono` or `JetBrains Mono`. Monospaced for tabular alignment.
- **Sizing**:
  - **Jumbo**: `text-4xl`+ for Totals.
  - **Body**: `text-lg` (18px) is the new base size. Avoid `text-sm` unless necessary.

## 4. Component Patterns

### The Numpad
- 3x4 Grid.
- Edge-to-edge keys or minimal gap (`gap-1`).
- Zero key often double-width.

### The List Item
- High height (`h-16+`).
- **Swipe Actions** over "Edit Buttons" where possible (Swipe L to Delete).
- Clear visual separation (borders or alternating backgrounds).

### The Modal
- **Bottom Sheets** are preferred over centered dialogs for easier reachability.
- If centered, ensure close buttons are massive and easily tappable.

## 5. Animation
- **Speed**: Instant (<100ms) or snappy (200ms).
- **Feel**: Mechanical and solid. Avoid bouncy, springy "web" animations.
- **Transition**: `active:scale-95` on buttons is the most important animation.
