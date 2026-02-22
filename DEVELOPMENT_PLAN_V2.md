# 🚀 HYPHAE-SUIT V2 Development Plan: The Street Vendor Ecosystem

**Version:** 2.0  
**Status:** Architecture Blueprint & Roadmap  

---

## 🎯 1. Vision & Architecture Philosophy

**The Target Demographic:** Single-operator or small-team food vendors operating in two distinct physical environments:
1. **The Prep Kitchen (BOH/Core):** Where bulk supplies arrive, and sub-products (patties, sauces) are prepared. Reliable network connection.
2. **The Street Cart / Stand (POS):** Where final menu items are assembled and sold. Variable, spotty, or non-existent network connection.

**The Golden Pipeline (The Data Backbone):**
The entire ecosystem aligns perfectly with the Drizzle schema in `packages/database/src/schema.ts`:
1. **Source:** `suppliers` -> `supplyOrders` -> `supplyOrderItems` (Purchasing bulk goods)
2. **Stock:** `inventoryItems` (Type: RAW) & `inventoryTransactions` (Type: RECEIVE)
3. **Recipes:** `recipes` (Type: BATCH) & `recipeIngredients` -> Outputs to `inventoryItems` (Type: PREP / sub-products like Beef Patties)
4. **Menu Items:** `products` (Linked to `recipes` Type: ASSEMBLY or directly to `inventoryItems`)
5. **Sales:** `orders` & `orderItems` -> Subtracts from `stockStand` via explosion of the assembly recipe down to the PREP and RAW ingredients.

**The Architecture Shift (True Offline-First POS):**
Currently, `apps/pos/src/services/SyncEngine.ts` is network-first, pushing `POST` requests directly to `127.0.0.1:3001`, and only using `idb` generic queueing if the request fails (Dead Letter Queue approach).
**In V2, we shift to a Local-First Architecture.** 
- The POS device runs a local replica of the required database (Menu, Pricing, Local Inventory).
- The App reads/writes *only* to the local database.
- A background Sync Engine (leveraging LibSQL's embedded sync or a robust CRDT-based tool like PowerSync/RxDB) handles replication with the Core API in the background.

---

## 🏗️ 2. Ecosystem Responsibilities & Flow

### 🏢 The Core App (The Master Node -> Future Cloud)
- **Role:** The Hub. Initially running as a standalone app on a PC at the kitchen, eventually transitioning to a Cloud Service.
- **Responsibilities:** 
  - Vendor and Supply Ordering (`supplyOrders`).
  - **The Forecast Engine:** Converting simple sales targets (e.g., "Sell 150 burgers this weekend") into exact RAW shopping lists and BATCH prep schedules.
  - Defining the Menu, Categorization, and Pricing (`products`, `modifierOptions`).
  - Defining the Recipes (`recipes` for BATCH and ASSEMBLY).
  - Running Analytics and AI Strategic insights via the Fastify API proxy.
  - Pushing data schemas and syncing state across BOH and POS nodes.
  - **Labor Aggregation:** Implicitly calculating Time & Attendance based on login/logout timestamps across all peripheral nodes (POS, BOH).

### 🍳 The BOH App (Primary: Prep Kitchen Helper)
- **Role:** The Kitchen Engine. Runs on Tablets or larger Touchscreens (with network-connected display dashboards). Emphasizes offline/standalone capabilities similar to the POS, relying on periodic syncs to CORE.
- **Primary Responsibilities (Prep & Operations):**
  - **Reception of Goods (Suppliers):** Receiving bulk ingredients at the back door into Kitchen Inventory (`stockKitchen`), utilizing supplier data pulled from CORE.
  - Processing raw food receipts into sub-products (waste reduction, cost tracking, recipe standardization).
  - Guiding batch production (`recipes` Type: BATCH). E.g., guiding staff to turn 10 lbs of ground beef into 40 burger patties (`stockKitchen` +40).
  - **The Cart Exchange (Load & Return):** Managing the daily transfer of PREP items. Moving items out to the cart before a shift (`stockKitchen` -40 -> `stockStand` +40), and ingressing unsold items back at the end of the shift (`stockStand` -10 -> `stockKitchen` +10) or logging them as waste.
- **Secondary/Tertiary Responsibility (Live Workflow):**
  - KDS (Kitchen Display System): When specifically configured at the cart/stand, parsing POS orders locally into highly readable AI-generated shorthand tickets.

### 💳 The POS App (The Unbreakable Stand)
- **Role:** The Transaction Node.
- **Responsibilities:**
  - Operating 100% offline. Calculates taxes, cart pricing, and discounts instantly without an API call.
  - Consuming `stockStand` local inventory levels to auto-86 items when the cart runs out of sub-products (Patties, Buns) without needing to ask the Core database.
  - Logging fully constructed orders into local storage.
  - Background syncing completed orders to the Core server when 4G/Wifi is detected.

---

## 🗺️ 3. Execution Roadmap

### Phase 1: Perfecting the Core Foundation (Source > Stock > Recipes)
*Goal: Build the "Home Base" first. Establish the Master Node that provisions the rest of the ecosystem.*

- **Step 1: Supplier & Order Hub.** Finalize the UI in CORE for managing `suppliers` and generating `supplyOrders` (Purchase Orders). This data is pushed down to BOH.
- **Step 2: The Recipe Architect & Forecast Engine.** Complete the CORE UI for defining `recipes` (both BATCH for prep and ASSEMBLY for sales). Build the forecasting logic: inputting a target sales volume (e.g., 50 burgers/day for 3 days) automatically traverses the recipe hierarchy to generate the required RAW shopping list and the daily BATCH prep schedule.
- **Step 3: Transfer Definitions.** Define the explicit "Load Cart" and "Return from Cart" transaction types in the database schema to support the BOH workflows.
- **Step 4: Strict Database Safeguards.** Harden the Database Schema (`schema.ts`) and Zod Models (`@hyphae/schemas`) to mathematically prevent orphaned items. Establish rules like: RAW Inventory MUST have a `preferredSupplierId`, Products MUST have a related `recipeId` (Assembly), and Recipe components MUST link to valid Inventory IDs.

### Phase 2: Localizing the BOH (Prep Kitchen Helper)
*Goal: Empower the prep kitchen to operate offline, turning RAW goods into PREP sub-products, driven by CORE's definitions.*

- **Step 1: Supplier Reception.** Build the interface for staff at the back door to receive deliveries (`inventoryItems` RAW) seamlessly using `suppliers` data synced from CORE.
- **Step 2: Batch Prep UI.** Implement the Batch Preparation UI. Staff selects a BATCH recipe synced from CORE, hits complete, and records an `inventoryTransactions` that deducts RAW tomatoes/onions and adds PREP Salsa to `stockKitchen`.
- **Step 3: The Cart Exchange (Load & Return).** Build the two-way internal reception workflow. 
  - *Load Cart*: Moving prepped items out (`stockKitchen` to `stockStand`).
  - *Return Cart*: Ingressing unsold items back at the end of the day (`stockStand` to `stockKitchen`).
- **Step 4: Waste & Yield Logs.** Add workflows in BOH to log spoilage during the "Return Cart" phase, or log actual yield vs. expected yield during BATCH prep, feeding this data back to CORE for cost adjustments.
- **Step 5: Sync Protocol.** Establish the reliable background sync mechanism so the BOH tablet can operate in the prep kitchen untethered, syncing batch completions and receipts back to CORE.

### Phase 3: Localizing the POS (The Unbreakable Stand) (COMPLETED)
*Goal: Decouple POS from live API dependencies. Replace generic API fetching with a local database engine populated by CORE.*

- [x] **Step 1: Local Database Engine.** Integrated LibSQL WASM with OPFS persistence into `apps/pos`.
- [x] **Step 2: Seed & Pull.** Built the `/api/sync/pull` delta-sync protocol. POS successfully pulls structural data (Menu, Staff, Loyalty) into local SQLite.
- [x] **Step 3: Cart Logic & Local Storage.** Refactored `OrderRepository` and `MenuRepository` to write/read exclusively from local SQLite with full relational support.
- [x] **Step 4: The Vault (Shift Hub).** Added `syncedAt` tracking and background Push logic to `SyncEngine`.
- [x] **Step 5: Offline Authentication.** Implemented offline PIN fallback in `AuthService` using synced staff data.

### Phase 4: The Hive Sync, AI Utility & Hardware
*Goal: Connect the nodes, integrate the 5-Star AI operational helpers, and finalize hardware integrations.*

- **Step 1: The Master Sync.** Finalize the conflict-free replication (Last-Write-Wins) so POS orders and BOH prep/receiving automatically flow up to CORE, and CORE structural changes flow down when network is detected.
- **Step 2: Explosion Engine.** Build the backend CORE utility that triggers when an order is synced from the POS. It explodes a sold Product into its Assembly Recipe, deducting the PREP ingredients from the global record.
- **Step 3: High-Value AI Tools.** Deploy the AI Bookkeeper (CORE), Predictive Prep Forecasting (CORE->BOH), Invoice OCR Ingestion (BOH), and Kitchen Shorthand generation (BOH/KDS).
- **Step 4: Terminal Hardware Pipelines.** Define the agnostic inputs for external Mexican payment processors (Clip / Mercado Libre) inside the POS checkout flow. Integrate ESC/POS network printing for exact receipt production directly from the POS tablet.

### Phase 5: Mobile Ecosystem Expansion
*Goal: Extend the platform's reach beyond the kitchen & cart into the hands of the runner and the customer.*

- **Step 1: The Market Companion App (`apps/market`).** Build a lightweight, offline-capable mobile view for the BOH runner. It consumes the shopping lists generated by the CORE Forecast Engine, allowing the user to check off items while physically walking through a market or depot without cell service.
- **Step 2: The Patron App Foundation (`apps/patron`).** Build the V1 customer-facing mobile application. Initially focused on digital marketing (menu viewing, cart location/hours) and loyalty (displaying a unique QR code to be scanned at the POS).
- **Step 3: Mobile Pre-Ordering (Future).** Expand the Patron app to allow ahead-of-time ordering, injecting tickets directly into the CORE/BOH/POS ecosystem.

### Phase 6: Ecosystem UI Homologation
*Goal: Ensure a cohesive, recognizable visual identity across all 5 applications.*

- **Step 1: The POS Standard.** Extract the high-contrast, touch-optimized visual language currently living in `apps/pos` (colors, typography, spacing, `cva` button variants) into the shared `@hyphae/ui` package.
- **Step 2: Retrofit CORE & BOH.** Apply the shared components and design tokens to `apps/core` and `apps/boh` to ensure they match the premium "Look and Feel" of the POS.
- **Step 3: Mobile Alignment.** Ensure `apps/market` and `apps/patron` inherit the identical visual DNA, completing the unified suit.

---
*Date: February 20, 2026*

---

## 🎨 4. Retained Ecosystem Guidelines (From V1)

*The following standards apply globally across all apps (POS, BOH, CORE) and remain strictly enforced in V2.*

### UI/UX & Aesthetics
- **Design Tokens**: Standardized on a dark-mode first, high-contrast palette. `bg-zinc-950` base, with semantic accents (e.g., `lime-500` for primary actions, `red-600` for destructive).
- **Typography & Components**: Modern typography (Inter/Space Mono). Component variants built via `cva` (Class Variance Authority) for consistency (Primary, Secondary, Ghost, Danger).
- **Touch Target Ergonomics**: 
  - Primary Actions: Minimum 48x48px
  - List Items: Minimum 56px height
  - Inputs: Minimum 48px height

### Security Framework & Hardening
- **RBAC (Role-Based Access Control)**: Enforced via `StaffRole` (Cashier, Kitchen, Manager), gating actions like `ORDER_VOID`, `PAYMENT_DISCOUNT`, and `SETTINGS_EDIT`.
- **Sensitive Data Handling**: Client apps must never store raw card numbers. Staff PINs must be encrypted or hashed.
- **API Security (CORE)**: Fastify API endpoints must be protected by rate limits, `x-api-key` validation, and robust Zod input schemas.

### Performance & Offline Resilience
- **State Management**: Zustand (local UI state) + Offline-first database replica (SQLite/RxDB/LibSQL) instead of generic API fetches.
- **Rendering Optimization**: Virtualized lists (`@tanstack/react-virtual`) for the main POS menu and BOH kitchen rails to prevent DOM overload.
- **Service Workers**: Mandatory cache-first strategies for the App Shell to ensure fast booting in dead-zones.

### The Original Phase 4 Checklist (Production Readiness)
- [ ] All tests passing (>80% coverage on Domain Logic).
- [ ] Zod schemas attached to every Database Table and API payload.
- [ ] Bundle size optimized (<500KB gzipped).
- [ ] Error boundary contexts with Sentry/monitoring integrated.
