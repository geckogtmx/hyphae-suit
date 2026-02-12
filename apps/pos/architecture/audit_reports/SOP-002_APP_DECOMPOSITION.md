# SOP-002: App.tsx Decomposition

## Objective

Decompose the monolithic `App.tsx` (386 lines) into manageable, single-purpose components to comply with the 30-line rule.

## Current State

- `AppContent` contains main layout, header, footer, modals, and global state logic.
- Massive `return` block with nested conditionals.

## Planned atomic components

1. `Header.tsx`: Extract the desktop and mobile header logic.
2. `MainLayout.tsx`: Extract the `flex-1 flex overflow-hidden` layout structure.
3. `ModalManager.tsx`: Centralize the modal overlay logic.
4. `ToastManager.tsx`: Extract toast notification logic.

## Procedure

1. Create new files in `src/components/layout/`.
2. Move logic and styles from `App.tsx` to new components.
3. Pass necessary props or use context for state.
4. Replace extracted code in `App.tsx` with new components.
