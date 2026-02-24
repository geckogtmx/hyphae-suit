# GEMINI.md - Project Map & Source of Truth

**Project**: Hyphae Suit Monorepo
**Last Updated**: 2026-02-22

## 1. Project Overview

**Hyphae Suit** is a cohesive ecosystem of applications for restaurant management, built as a monorepo.

- **Architecture**: pnpm workspace monorepo
  - **Apps**:
    - `apps/core`: Control Center & Master Node (Hub/Forecasting).
    - `apps/boh`: Kitchen Prep & Receiving (Tablet).
    - `apps/pos`: Point of Sale (True Offline-First SQLite Replica).
    - `apps/market`: Market Companion (BOH Mobile Shopping).
    - `apps/patron`: Customer Facing (Loyalty/Ordering).
  - **Packages**:
    - `@hyphae/schemas`: Shared type definitions (Zod/TypeScript).
    - `@hyphae/ui`: Shared UI component library (POS-Homologated).

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

> **Current Directive**: The project has officially pivoted to the **V2 Architecture Blueprint** (defined in `DEVELOPMENT_PLAN_V2.md`). All efforts are sequence-locked to the golden pipeline rules.
> **Current Active Phase**: Phase 4 - The Hive Sync, AI Utility & Hardware.

### 🟢 Phase 1: Perfecting the Core Foundation (COMPLETED)
- **Goal**: Finalize `apps/core` to act as the single source of truth.

### 🟢 Phase 2: Localizing the BOH (COMPLETED)
- **Goal**: Empower the prep kitchen to operate offline using synced data from CORE.

### 🟢 Phase 3: Localizing the POS (COMPLETED)
- **Goal**: Replace generic `idb` with a true offline LibSQL WASM local replica sync engine.
- LibSQL WASM + OPFS integrated into `apps/pos`. `MenuRepository` & `OrderRepository` use local DB. `AuthService` has offline PIN fallback. `SyncEngine` implements full Pull/Push cycle.

### 🟡 Phase 4: The Hive Sync, AI Utility & Hardware (ACTIVE — Step 3 Complete, 4.4 In Progress)
- **Step 1 (DONE)**: The Explosion Engine. `POST /api/order/checkout` is now idempotent. Inventory depleted on sync. Loyalty awarded. BOH notified via WebSocket. `GET /api/orders` & `GET /api/orders/:id` added. Sync pipeline verified end-to-end (`since=0` → 12 products, 3 categories, 26 modifiers, 27 inv items, 3 users, 4 loyalty).
- **Step 2 (DONE)**: BOH Supplier Reception UI. Add `suppliers` + `modifierGroups` to `/api/sync/pull`.
- **Step 3 (DONE)**: Hardware — ESC/POS printer & Mexican payment gateway (Clip/Mercado Libre) abstractions established in POS.
- **Phase 4.4 (ACTIVE)**: High-Value AI Tools. AI Bookkeeper, Predictive Forecaster integrated into CORE. Pending: Invoice OCR Ingestion (BOH) and Kitchen Shorthand generation (BOH/KDS).

### 🌪️ Phase 5: Mobile Ecosystem Expansion (Future)
- **Goal**: Deploy Market App, Patron App, OCR Parsing, and Predictive Forecasting.

### 🎨 Phase 6: UI Homologation (Future)
- **Goal**: Extract the styling from `apps/pos` into `@hyphae/ui` and apply the exact look-and-feel globally to all other nodes.

## 5. Technical SOPs

- [x] SOP-001: Header Injection (Core Files)
- [x] SOP-002: Function Decomposition
- [x] SOP-003: Secret Migration
- [x] SOP-004: Monorepo Shared Types Migration

## 6. Maintenance Log

- **2026-02-24**: **Phase 4 Step 3 & 4.4 Active**. Implemented native ESC/POS printer utility layer via Web Bluetooth/USB inside `apps/pos`. Built Clip/Mercado Libre simulated payment stub integrations into checkout flow to block cash input dynamically. Rewrote `IntelligenceView` in `apps/core` to consume new backend `POST /api/ai/chat` (Bookkeeper analytics) and `POST /api/ai/forecast` (Pre-prep optimization) via Gemini. Identified and fixed a fatal duplicate routing error for `/api/concepts` inside Fastify that broke CORE item deletion and CRUD loops. Fixed `drizzle-orm` TS issues related to unit types in inventory schemas.

### 🌪️ Phase 5: Mobile Ecosystem Expansion (Future)
- **Goal**: Deploy Market App, Patron App, OCR Parsing, and Predictive Forecasting.

### 🎨 Phase 6: UI Homologation (Future)
- **Goal**: Extract the styling from `apps/pos` into `@hyphae/ui` and apply the exact look-and-feel globally to all other nodes.

## 5. Technical SOPs

- [x] SOP-001: Header Injection (Core Files)
- [x] SOP-002: Function Decomposition
- [x] SOP-003: Secret Migration
- [x] SOP-004: Monorepo Shared Types Migration

## 6. Maintenance Log

- **2026-02-22**: **Phase 3 Complete + Phase 4 Step 1: Explosion Engine**.
    - **Schema**: Added `updatedAt`/`deletedAt` to all syncable tables (`suppliers`, `inventoryItems`, `recipes`, `products`, `modifierOptions`, `users`, `loyaltyProfiles`). Added `syncedAt` to `orders`. Added `orderItemsRelations` back-relation.
    - **API — Sync Engine**: Added `GET /api/sync/pull?since={ts}` delta endpoint. Verified returns all 12 products, 26 modifiers, 27 inventory items, 3 users, 4 loyalty profiles on fresh pull.
    - **API — Explosion Engine**: Upgraded `POST /api/order/checkout` with full idempotency (`onConflictDoUpdate`/`onConflictDoNothing`). Runs `InventoryService.deductOrderInventory()` async on each synced order. Awards loyalty points + `updatedAt` stamp. Emits `order:synced` WebSocket to BOH.
    - **API — Order Reads**: Added `GET /api/orders` (paginated, relational) and `GET /api/orders/:id`.
    - **POS**: Integrated LibSQL WASM + OPFS. `MenuRepository` & `OrderRepository` read/write local SQLite. `SyncEngine` v2 implements Pull (upsert structural data) and Push (upload unsynced orders). `AuthService` adds offline PIN fallback via local `users` table.
    - **Seed**: Mass-stamps `updatedAt = Date.now()` on all syncable tables at end of seed. Guarded `recipeId` null check in products seeding.
- **2026-02-20**: **Phase 1 Completion (Core Foundation)**. Finalized the Recipe Architect and Forecast Engine. Organized explicitly tracked internal database exchanges (Load/Return Cart). Activated Phase 2 (Localizing the BOH).
- **2026-02-19**: **Archival & Recovery (Soft-Delete)**. Implemented full "Recycle Bin" lifecycle for menu items.
    - **Database**: Added `deletedAt` column to `products` table for non-destructive removals.
    - **API**: Added `GET /products/trash`, `POST /restore`, and `/permanent` delete endpoints. Fixed a critical route registration bug (missing brace) that inhibited deletion logic.
    - **Core**: Implemented "Recycle Bin" toggle with glow-state indicator. Hardened `ProductBuilder` with selection persistence and decimal price validation. Verified state sync between Active/Trash views.
- **2026-02-19**: **Data Unification & Supply Chain Integrity**. Verified and enforced the `Supplier > Stock > Recipe > Product > Sale` pipeline.
    - **API**: Resolved duplicate route definitions causing server instability.
    - **BOH**: Migrated `InventoryDashboard` from mock data to live API consumption (`/api/inventory`).
    - **POS**: Updated `MenuRepository` to correctly map `inventoryMetadata` (Recipe/Direct Stock links) from the database schema, ensuring accurate depletion during checkout.
    - **Core**: Validated `ProductBuilder` integration with live Inventory/Recipe data.

- **2026-02-19**: **Production Hardening & Stabilization**. Hardened the API with environment-driven CORS, log redaction for sensitive fields (PINs), and optimized rate limiting. Enforced strict API key authentication for non-public routes. Improved database reliability by wrapping inventory depletion logic in atomic transactions. Resolved high-volume lint errors in the POS application, including React state-in-effect warnings and deprecated triple-slash references. Verified full Loyalty->Order->Pay loop with database persistence for card `BEE101`.
- **2026-02-19**: Fixed Loyalty Registration "Error Persists" loop. Identified and resolved a critical database schema mismatch (missing `is_physical_card` column). Enforced the **Inverted Abyssal Theme** scale across all loyalty components, ensuring dark backgrounds and high contrast. Fixed the POS "Start Order" button by implementing a `cardNumber` fallback for the legacy `activeCard` structure. Standardized loyalty API queries to prevent camelCase/snake_case mismatches.
- **2026-02-17**: Completed POS Phase 3 (Backend Integration). Added Inventory Depletion, Loyalty System, and real-time checkout sync. Resolved BOH routing duplication and standardized human-friendly Order IDs (P1-101). Fixed React infinite loops and missing `useCallback` imports.
- **2026-02-12**: Consolidatd `GEMINI.md` to root.
- **2026-02-12**: Ported "Product Builder" to Core; Created `@hyphae/schemas`.
- **2026-01-20**: (POS) Phase 2 Inventory & Verification Complete.
- **2026-01-20**: (POS) Integrated Audit Blueprint & SOPs.
