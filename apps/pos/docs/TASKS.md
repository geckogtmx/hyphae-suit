# Hyphae POS - Task List (Phase 0-3)

> **Status**: Active
> **Phase**: 3 - Backend Integration (Firebase/LibSQL)
> **Objective**: Implement Core Database, Services, and Security Foundation

## Phase 0: Stabilization (Build & Style System)

1. [x] **Remove CDN Dependencies**: Delete `<script src="...">` for Tailwind and React from `index.html`.
2. [x] **Install Styling Engine**: Run `npm install -D tailwindcss postcss autoprefixer`.
3. [x] **Initialize Configuration**: Generate `tailwind.config.js` and `postcss.config.js`.
4. [x] **Implement SHASO Palette**: Port the "Abyssal" color tokens (Ink/Jet/Teal) into `tailwind.config.js`.
5. [x] **Create CSS Entry Point**: Create `src/index.css` with standard `@tailwind` directives.
6. [x] **Bind Styles**: Import `index.css` into `src/index.tsx` (or `main.tsx`).
7. [x] **Cleanup HTML**: Remove Import Maps and legacy CSS hacks from `index.html`.
8. [x] **Verify Dependencies**: Ensure `package.json` includes `clsx` and `tailwind-merge` for dynamic classes.
9. [x] **Build Validation**: Execute `npm run build` to confirm no build errors occur.
10. [x] **Visual Regression Check**: Launch `npm run dev` and compare with SHASO Design doc.
11. [x] **Switch to pnpm**: Migrate toolchain to `pnpm` for robustness.
12. [x] **Fix Visual Regression**: Identify and patch `bg-white` artifacts to `bg-ink-xxx`.

## Phase 1: Testing & Quality Assurance

13. [x] **Install Test Runner**: Install `vitest`, `jsdom`, and `@testing-library/react`.
14. [x] **Configure Vitest**: Create `vitest.config.ts` (shared or separate from Vite).
15. [x] **Sanity Test**: Write a basic rendering test for `<App />`.
16. [x] **Linting Standards**: Install `eslint` and `prettier` with project-specific rules.
17. [x] **Pre-commit Hooks**: Setup `husky` and `lint-staged` for automated quality checks.
18. [x] **UI Unit Tests**: Create and test `Button` component (CVA) and `ErrorBoundary`.
19. [x] **Environment Config**: Create `.env.example` standardizing API keys and flags.

## Phase 2: Architecture & Backend Prep

### Core Infrastructure

20. [x] **Directory Re-structure**: Move `components` to `src/components`, `hooks` to `src/hooks`.
21. [x] **Database Setup**: Install `drizzle-orm` and `@libsql/client` (LibSQL selected over better-sqlite3).
22. [x] **Schema Definition**: Create initial Drizzle schema for `Orders` and `Menu`.
23. [x] **Migration Test**: Verified DB connectivity via `src/db/__tests__/db.test.ts`.

### Security Foundation (Phase 2 Gate)

24. [x] **Security Audit**: Run `pnpm audit` and vulnerability scan (Clean).
25. [x] **Security Policy**: Create `SECURITY.md` and update `AI_CODEX.md`.
26. [x] **Git Hygiene**: Update `.gitignore` to exclude sensitive DB and Env files.

### Service Layer (Next Up)

27. [x] **Repository Layer**: Create `src/repositories/*` for Drizzle abstraction.
28. [x] **Seed Script**: Populate `menu_items` from `mock_data.ts`.
29. [x] **Service Layer**: Implement `OrderService.ts` business logic.
30. [x] **React Query Integration**: Setup `QueryClient` and replace `mock_data.ts` in UI.
31. [x] **Firebase Sync Engine**: Implement offline-first sync logic via `offline-sync` skill.
