# Hyphae POS - UI Reference Specification

**Based on Visual Reference (January 16, 2026)**

This document defines the visual standards derived from the reference screenshots. All future UI development must adhere to these specifications.

## 1. Global Layout & Theme

- **Theme**: Ultra-Dark Mode.
- **Backgrounds**:
  - App Background: `#000000` (Pure Black) or very dark Zinc (`#09090b`).
  - Containers/Modals: `#18181b` (Zinc-900).
  - Borders: Very subtle `#27272a` (Zinc-800).
- **Header**:
  - Height: ~48-56px.
  - Content: Logo (Left), Clock/Weather (Center-Right), Utility Icons (Right).
  - Logo: Green circle icon `H` + "HYPHAE.POS" text.

## 2. Screens

### A. Login / Idle Screen
**Layout**: Split view or centered container.
**Components**:
- Two large distinct actionable cards.
- **Guest Card**:
  - Background: Dark Gray (`#18181b`).
  - Icon Circle: Blue (`#3b82f6`).
  - Text: "GUEST" (Uppercase, Bold, White).
- **Loyalty Card**:
  - Background: Dark Gray (`#18181b`).
  - Icon Circle: Red (`#ef4444`).
  - Text: "CARD" (Uppercase, Bold, White).

### B. Order Screen (Main POS)
**Layout**: Two-Column Resizable.
- **Left Rail (Order Summary)**:
  - Width: ~30-35%.
  - Background: `#18181b` (lighter than app bg).
  - Header: "PENDING" count badge.
  - List Items:
    - Main Item: White text, Bold.
    - Modifiers: Indented, gray text (`#a1a1aa`), small font.
  - Actions:
    - "EDIT" Button: Outline / Gray.
    - "FIRE" Button: Orange (`#f97316`), full width.

- **Right Stage (Product Grid)**:
  - Grid: 2-3 columns depending on screen size.
  - **Product Card**:
    - Style: Simple rectangle, dark background.
    - Typography: Name (Top Left), Price (Bottom Right, Bold).
    - No images used in current reference.
  - **Bottom Action Bar**:
    - "CREATE ORDER" Button: Large, Full Width.
    - Color: Lime Green (`#84cc16`).
    - Text: Black (`#000000`), Bold, Uppercase.

### C. Checkout / Payment
**Style**: Modal Overlay (Dark backdrop).
**Keypad View**:
- Input Display: Large text (`44px+`), Green outline (`border-lime-500`).
- Numpad: 3-column grid. Large buttons (`h-16`). Dark gray background.
- Summary Panel (Right):
  - "ORDER BALANCE": White.
  - "TOTAL CHARGE": Large white text.
  - "CHANGE DUE": Red text if negative.
- Submit Button: "CONFIRM PAYMENT" (Dark gray until complete).

**Method Selection View**:
- Grid: 2x2.
- Buttons: Large, aspect ratio ~3:2.
- content: Icon + Label (CASH, CLIP, TRANSFER, SPLIT).
- Style: Dark gray background, hover effects visible.

## 3. Typography & Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `text-primary` | `#ffffff` | Headings, Prices, Keypad numbers |
| `text-secondary` | `#a1a1aa` | Modifiers, Labels |
| `accent-lime` | `#84cc16` | Primary Actions (Create Order), Active Borders |
| `accent-orange` | `#f97316` | Kitchen Actions (Fire) |
| `accent-blue` | `#3b82f6` | Guest Actions |
| `accent-red` | `#ef4444` | Loyalty Actions, Negative Values |
| `bg-surface` | `#18181b` | Cards, Rails, Modals |
| `bg-app` | `#09090b` | Global Background |

## 4. Assets

*(Please describe or screenshot specific icons if they deviate from Lucide standards)*
- **Logo**: Green Circle with Black 'H'.
- **Icons**: Standard Lucide-react style (thin stroke).
