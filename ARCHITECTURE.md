# Hyphae Suit Architecture

## System Overview

Hyphae Suit is a unified Point of Sale (POS) ecosystem designed for modern hospitality businesses. It adopts a **monorepo architecture** managed by Turborepo, consolidating three primary applications and shared libraries into a single cohesive codebase.

### Core Applications

1.  **@hyphae/pos** (`apps/pos`)
    *   **Role:** The client-facing Tablet POS application used by staff for order entry and payments.
    *   **Stack:** React 19, Vite, Tailwind CSS, IndexedDB (Offline-first).
    *   **Key Features:** Offline support, complex modifier handling, hardware integration (printers/terminals).

2.  **@hyphae/core** (`apps/core`)
    *   **Role:** The central nervous system; provides the Backend API and Admin Dashboard.
    *   **Stack:** React 19 (Dashboard), Fastify (API), Drizzle ORM, SQLite/Postgres.
    *   **Key Features:** Menu management, real-time WebSocket gateway, data synchronization, analytics.

3.  **@hyphae/boh** (`apps/boh`)
    *   **Role:** The Kitchen Display System (KDS) for back-of-house operations.
    *   **Stack:** React 19, Vite, Tailwind CSS.
    *   **Key Features:** Real-time order tickets, prep management, station routing.

### Shared Infrastructure (`packages/`)

*   **@hyphae/schemas:** The single source of truth for data models. Uses **Zod** to define runtime-validated types for Orders, Menus, Inventory, and Users. Shared between Frontend and Backend to ensure type safety across the network boundary.
*   **@hyphae/ui:** A shared UI component library based on **Radix UI** and **Tailwind CSS**. Ensures visual consistency (SHASO Design System) across POS, BOH, and Admin apps.
*   **@hyphae/database:** **Drizzle ORM** schemas and database client factories. managing data persistence and migrations.
*   **@hyphae/config:** Shared configurations for **TypeScript**, **ESLint**, and **Prettier** to enforce code quality standards.
*   **@hyphae/utils:** Pure utility functions for currency formatting, date manipulation, and common algorithms.

## Data Flow

1.  **Menu Updates:** Created in `@hyphae/core` (Admin) -> Stored in DB -> Synced to `@hyphae/pos` via API/WebSockets.
2.  **Order Entry:** Created in `@hyphae/pos` (Offline-first) -> Queued locally (IndexedDB) -> Synced to `@hyphae/core` API.
3.  **Kitchen Routing:** `@hyphae/core` processes order -> Pushes real-time event to `@hyphae/boh`.
4.  **Status Sync:** BOH updates status ("Cooking" -> "Ready") -> `@hyphae/core` updates DB -> Pushes update to `@hyphae/pos`.

## Deployment Strategy

*   **Monorepo Build:** Turborepo caches build artifacts. `pnpm build` triggers parallel builds for all apps.
*   **CI/CD:** GitHub Actions pipeline validates linting, types, and tests (80% coverage) before deployment.
*   **Versioning:** Apps are versioned independently but deployed from the same commit to ensure compatibility.
