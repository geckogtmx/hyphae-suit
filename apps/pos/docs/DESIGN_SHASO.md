# SHASO Design System (Single Hand Solo Operator)

> **Philosophy**: "No mouse, no keyboard, mostly 1 finger."

This document defines the **SHASO** design standard for Hyphae POS. The goal is to facilitate high-speed, error-free operation by a solo operator using a single finger (typically the index finger) while multitasking in a chaotic environment (e.g., a busy kitchen or bar).

## 1. Core Principles

### A. The "Strike Zone" First
All primary interactions must occur within the most accessible areas for a hovering index finger.
- **Primary Actions (90% usage)**: Bottom 40% of the screen (closest to operator).
- **Secondary Actions (10% usage)**: Middle 30%.
- **Read-Only / Status**: Top 30%.

### B. Target Physics
- **Minimum Touch Target**: `60px` x `60px` (exceeds standard 44px).
- **Safety Margins**: `gap-3` or `gap-4` between interactive elements to prevent "fat finger" errors.
- **Active States**: Immediate visual feedback (scale down, brightness change) on touch start. No "hover" states.

### C. Cognitive Load Reduction
- **One Decision Per Screen**: Don't overwhelm.
- **Color Coding**: Use color to indicate state, not just decoration.
- **High Contrast**: Ultra-dark backgrounds with luminous foregrounds for readability in low-light environments.

---

## 2. Color Palette (Proposed)

We utilize a custom "Abyssal" palette designed to reduce eye strain and provide vibrant actionable elements.

### Ink Black (Base / Backgrounds)
Deep, rich blacks for the application shell.
```css
--ink-black-500: #002029; /* DEFAULT */
--ink-black-900: #a1ebff; /* Note: Inverse ramp in input? Check Tailwind config */
/* Mapped for Tailwind (Dark Mode Base) */
bg-ink-black-100: #000608;
bg-ink-black-200: #000d10;
bg-ink-black-500: #002029; /* Main Background */
```

### Jet Black (Components / Cards)
Slightly lighter, blue-tinted black to distinguish panels and cards from the void.
```css
--jet-black-500: #00303d; /* DEFAULT */
/* Card Backgrounds */
bg-jet-black-500: #00303d;
```

### The Teals (Action / Hierarchy)
Three distinct teal ramps for hierarchical actions.

**Teal 400 (Deep/Base)** - Secondary Elements / Borders
`#004052` (DEFAULT)

**Teal 500 (Mid/Interactive)** - Primary Buttons / Active States
`#005066` (DEFAULT)

**Teal 600 (Bright/Highlight)** - Selected States / Accents
`#00607a` (DEFAULT)

*(Note: Full Tailwind generation maps provided in `tailwind.config.js` section below)*

---

## 3. Typography

**Primary Font**: `Inter` (UI, Labels, Reading)
**Data Font**: `Space Mono` or `JetBrains Mono` (Prices, SKU codes, Quantities)

### Hierarchy
- **Jumbo (Totals)**: `text-4xl` or `text-5xl`, Extrabold.
- **Headline (Category)**: `text-2xl`, Uppercase, Tracking-Wide.
- **Body (Standard)**: `text-lg` (Never use text smaller than 16px).
- **Label (Subtle)**: `text-sm`, Uppercase, opacity-70.

---

## 4. UI Patterns & Components

### The "Slab" Button
A full-width or half-width button designed for imprecise tapping.
- **Height**: `h-16` or `h-20` (64px - 80px).
- **Typography**: Uppercase, Bold, Centered.
- **Feedback**: `active:scale-95 transition-transform`.

### The "Rail" Navigation
Instead of a top navbar (hard to reach), use a **Bottom** or **Side Rail**.
- **Side Rail**: Right side for right-handed default (configurable).
- **Bottom Rail**: Critical Context switching (Order -> Pay -> Table).

### The "Numpad" Grid
For price entry and quantity.
- **Layout**: 3x4 Grid.
- **Keys**: Edge-to-edge or minimal gaps.
- **Zero**: Double width if possible for speed.

### Swipe Actions
Replace "Edit" buttons with Swipe-to-Action on list items to save screen real estate and taps.
- **Swipe Left**: Delete/Void.
- **Swipe Right**: Modify (Add Note/Extras).

---

## 5. Tailwind Configuration (Draft)

Use this configuration to implement the SHASO palette.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#002029',
          100: '#000608',
          200: '#000d10',
          300: '#001318',
          400: '#001a21',
          500: '#002029',
          600: '#006987',
          700: '#00b3e4',
          800: '#43d6ff',
          900: '#a1ebff'
        },
        jet: {
          DEFAULT: '#00303d',
          100: '#000a0c',
          200: '#001318',
          300: '#001d25',
          400: '#002631',
          500: '#00303d',
          600: '#007697',
          700: '#00bdf1',
          800: '#4bd8ff',
          900: '#a5ecff'
        },
        // Mapped the three 'dark_teal' duplicates to variants
        teal_deep: {
          DEFAULT: '#004052',
          100: '#000d10',
          200: '#001a21',
          300: '#002631',
          400: '#003341',
          500: '#004052',
          600: '#0083a7',
          700: '#00c6fd',
          800: '#54daff',
          900: '#a9ecff'
        },
        teal_mid: {
          DEFAULT: '#005066',
          100: '#001014',
          200: '#002029',
          300: '#00303d',
          400: '#004052',
          500: '#005066',
          600: '#0090b8',
          700: '#0acaff',
          800: '#5cdcff',
          900: '#adedff'
        },
        teal_bright: {
          DEFAULT: '#00607a',
          100: '#001318',
          200: '#002631',
          300: '#003a49',
          400: '#004d62',
          500: '#00607a',
          600: '#009dc8',
          700: '#16cdff',
          800: '#64ddff',
          900: '#b1eeff'
        }
      }
    }
  }
}
```

## 6. Implementation Checklist

1. [ ] **Update Tailwind Config**: Inject new colors.
2. [ ] **Base Styles**: Set body background to `bg-ink-500` (or 100/200 depending on darkness preference - usually 100/200 is background, 500 is brand). *Correction: Looking at the hex, 100 is almost black (#000608). Use `ink-100` for App Background.*
3. [ ] **Component Audit**: 
   - Increase all button heights to min `h-14` or `h-16`.
   - Remove any hover-only tooltips (useless on touch).
   - Ensure all touch targets have `cursor-pointer` (for testing) and active states.
