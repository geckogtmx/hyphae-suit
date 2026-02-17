# GEMINI.md - Project Map & Source of Truth

**Project**: Hyphae Suit Monorepo
**Last Updated**: 2026-02-12

## 1. Project Overview

**Hyphae Suit** is a cohesive ecosystem of applications for restaurant management, built as a monorepo.

- **Architecture**: pnpm workspace monorepo
  - **Apps**:
    - `apps/pos`: Point of Sale (React 19, Vite, Tailwind, Drizzle, LibSQL).
    - `apps/core`: Back of House / Control Center (React, Vite, Tailwind).
    - `apps/boh`: Kitchen Prep & Display System (React, Vite, Tailwind, Zustand).
  - **Packages**:
    - `@hyphae/schemas`: Shared type definitions (Zod/TypeScript).
    - `@hyphae/ui`: (Planned) Shared UI component library.

## 2. Operational Protocol

You operate under the **AI CODEX**.
Location: `AI_CODEX.md` (Root)

> ⚠️ **IMPERATIVE**: You must read `AI_CODEX.md` at the start of every session. It contains your Rules of Engagement, Context, and Directives.

## 3. Code Hygiene Standard (Blueprint)

The following rules are enforced across the entire monorepo:

| Rule                   | Description                                                                  |
| :--------------------- | :--------------------------------------------------------------------------- |
| **Header Compliance**  | Every file must have `@author`, `@description`, `@version`, `@last-updated`. |
| **Zero-Secret Policy** | Move hardcoded keys to `.env`. No secrets in source.                         |
| **The 30-Line Rule**   | Flag/Decompose functions > 30 lines.                                         |
| **Documentation**      | Explain the _intent_ (the "Why") of complex logic.                           |
| **Type Safety**        | Strict Interface definitions. Shared types must live in `@hyphae/schemas`.   |
| **Data Validation**    | Use Zod for all I/O shapes.                                                  |

## 4. Project Status & Roadmap

### 🟢 apps/pos (Hyphae POS)
- **Status**: Phase 3 - Backend Integration Complete
- **Key Features**: Offline-first, Checkout API, Inventory Sync, Loyalty Backend.

### 🟡 apps/core (Hyphae Core)
- **Status**: Phase 1.5 - Enhanced Dashboard
- **Key Features**: Product Builder, AI Hub, Loyalty/Financial Analytics.
- **Recent Work**: Integrated `ProductBuilder`, aligned with shared schemas.

### 🟣 apps/boh (Kitchen Prep)
- **Status**: Phase 1 - Foundation
- **Key Features**: Kitchen Display System (KDS), Prep Lists, Recipe/Training View.

### 🔵 packages/schemas (Shared)
- **Status**: Active
- **Content**: Domain entities (`Product`, `Order`, `Inventory`).

## 5. Technical SOPs

- [x] SOP-001: Header Injection (Core Files)
- [x] SOP-002: Function Decomposition
- [x] SOP-003: Secret Migration
- [x] SOP-004: Monorepo Shared Types Migration

## 6. Maintenance Log

- **2026-02-17**: Completed POS Phase 3 (Backend Integration). Added Inventory Depletion, Loyalty System, and real-time checkout sync.
- **2026-02-12**: Consolidatd `GEMINI.md` to root.
- **2026-02-12**: Ported "Product Builder" to Core; Created `@hyphae/schemas`.
- **2026-01-20**: (POS) Phase 2 Inventory & Verification Complete.
- **2026-01-20**: (POS) Integrated Audit Blueprint & SOPs.
