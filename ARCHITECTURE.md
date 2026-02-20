# Hyphae Suit Architecture

## System Overview

Hyphae Suit is a unified Point of Sale (POS) ecosystem designed for modern hospitality businesses. It adopts a **monorepo architecture** managed by Turborepo, consolidating three primary applications and shared libraries into a single cohesive codebase.

### Core Applications

1.  **@hyphae/pos** (`apps/pos`)
    *   **Role:** The client-facing Tablet POS application used by staff for order entry and payments.
    *   **Stack:** React 19, Vite, Tailwind CSS, LibSQL/RxDB (Local Replica).
    *   **Key Features:** True Offline-First (local database engine), The Vault (Cash Management), complex modifier handling.

2.  **@hyphae/core** (`apps/core`)
    *   **Role:** The central nervous system; provides the Backend API, Admin Dashboard, and AI Forecast Engine.
    *   **Stack:** React 19 (Dashboard), Fastify (API), Drizzle ORM, SQLite/Postgres.
    *   **Key Features:** Supplier/Inventory hub, Recipe architect, Master Sync Engine.

3.  **@hyphae/boh** (`apps/boh`)
    *   **Role:** The Kitchen Display System (KDS) and Prep Kitchen Helper.
    *   **Stack:** React 19, Vite, Tailwind CSS.
    *   **Key Features:** Receiving goods, Batch prep guidance, waste tracking.

4.  **@hyphae/market** (`apps/market`)
    *   **Role:** Mobile Shopping Companion for the Runner.
    *   **Stack:** React 19, Vite (PWA).
    *   **Key Features:** Offline shopping lists sourced from CORE forecasting.

5.  **@hyphae/patron** (`apps/patron`)
    *   **Role:** Customer-facing storefront and loyalty hub.
    *   **Stack:** React 19, Vite (PWA).
    *   **Key Features:** Dynamic cart location, loyalty QR scanning, mobile ordering.

### Shared Infrastructure (`packages/`)

*   **@hyphae/schemas:** The single source of truth for data models. Uses **Zod** to define runtime-validated types for Orders, Menus, Inventory, and Users. Shared between Frontend and Backend to ensure type safety across the network boundary.
*   **@hyphae/ui:** A shared UI component library based on **Radix UI** and **Tailwind CSS**. Ensures visual consistency (SHASO Design System) across POS, BOH, and Admin apps.
*   **@hyphae/database:** **Drizzle ORM** schemas and database client factories. managing data persistence and migrations.
*   **@hyphae/config:** Shared configurations for **TypeScript**, **ESLint**, and **Prettier** to enforce code quality standards.
*   **@hyphae/utils:** Pure utility functions for currency formatting, date manipulation, and common algorithms.

## Data Flow (The Golden Pipeline)

1.  **Sourcing & Menu Config:** Created in `@hyphae/core` (Suppliers, Inventory, Recipes) -> Stored in central DB.
2.  **POS Sync:** Background Sync Engine pushes Menu/Pricing down to `@hyphae/pos` local database replica.
3.  **Order Entry:** Created in `@hyphae/pos` (Offline-first) -> Written purely to local DB -> Synced back to `@hyphae/core` API via background replication.
4.  **Kitchen Prep:** `@hyphae/boh` guides staff to turn RAW inventory into PREP items.
5.  **Explosion Engine:** `@hyphae/core` syncs sold orders from POS -> Explodes Assembly Recipes -> Deducts PREP ingredients globally.

## Deployment Strategy

*   **Monorepo Build:** Turborepo caches build artifacts. `pnpm build` triggers parallel builds for all apps.
*   **CI/CD:** GitHub Actions pipeline validates linting, types, and tests (80% coverage) before deployment.
*   **Versioning:** Apps are versioned independently but deployed from the same commit to ensure compatibility.
