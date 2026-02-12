# DEV_HANDOFF.md

> **Last Updated:** 2026-01-20T23:15:00-06:00
> **Last Model:** Gemini
> **Session Focus:** Phase 3 - Sync Engine & Loyalty Refactor

---

## ✅ Completed This Session

- **Firebase Sync Engine (Task 31)**: Implemented `src/services/SyncEngine.ts` utilizing `idb` for IndexedDB persistence and synchronization queue.
- **IndexedDB Wrapper**: Created `src/lib/indexedDB.ts` to manage local `hyphae_db_v1` (orders, products, sync_queue).
- **Loyalty Refactor**:
  - Created `src/hooks/useLoyalty.ts` using `@tanstack/react-query` to fetch profiles, cards, and transactions.
  - Updated `LoyaltyScreen.tsx` to use `useLoyalty` hook, removing direct `mock_data.ts` imports.
  - Added `SET_LOYALTY_PROFILE` action to `OrderContext` and deprecated synchronous `LOGIN_LOYALTY`.
- **OrderService Integration**: Refactored `OrderContext.tsx` to use `OrderService.applyLoyaltyPerks` instead of inline logic.
- **Tests**: Updated `App.test.tsx` to mock `useLoyalty`, ensuring all tests pass (19/19).

## ⚠️ Known Issues / Broken

- [ ] **Lint Warnings**: `SyncEngine.ts` has strict null checks on cursor methods that might flag in strict mode (verified logic is correct).
- [ ] **Data Fetching**: The `SyncEngine` and Hooks currently fetch from `http://localhost:3001` which assumes the `db:json` server is running (or will run).
- [ ] **Mock Data Fallbacks**: While imports are removed from components, the hooks still fallback to imported `mock_data.ts` if fetch fails. This is intentional for "Zero-Config" demo but should be phased out for Prod.

## 🔄 In Progress / Pending

- [ ] **Task 32**: Integration of `SyncEngine` into `OrderService` or `OrderRepository`. Currently `SyncEngine` exists but isn't automatically called on `saveOrder`.
- [ ] **Task 33**: API Routes / Backend for the `localhost:3001` endpoints (likely Next.js or Firebase Functions).

## 📋 Instructions for Next Model

1. **Wire up SyncEngine**: Modify `OrderRepository` (or `OrderContext`) to use `SyncEngine.getInstance().saveOrder(order)` instead of just local Drizzle or memory state. This connects the "Offline Sync" capability to the actual UI actions.
2. **Review DB Strategy**: We now have Drizzle (SQLite/LibSQL) AND IndexedDB (idb). Decide if Drizzle should point to a real DB only, and IDB handles local, OR if Drizzle should be used for everything (via WASM SQLite). The current `SyncEngine` using native IDB is the recommended "Lightweight" offline path for a web POS.
3. **Clean up**: Remove `LOGIN_LOYALTY` deprecated code from `OrderContext` if safe.

### Priority Order

1. Connect `SyncEngine` to order creation flow (Task 32).
2. Create/Stub the backend endpoints or switch URL to use Firebase directly.

### Context Needed

- `src/services/SyncEngine.ts`
- `src/context/OrderContext.tsx`
- `src/repositories/OrderRepository.ts`

### Do NOT

- Don't delete `src/data/mock_data.ts` yet.

---

## Session Log (Last 3 Sessions)

### 2026-01-20 23:15 - Gemini

- Implemented `SyncEngine` (IndexedDB + Queue).
- Refactored Loyalty system to use React Query hooks.
- Consolidated `OrderContext` logic into `OrderService`.
- 100% Test Pass Rate.

### 2026-01-20 23:10 - Gemini

- Created Repositories (Menu, Order).
- Implemented OrderService with POS domain logic.
- Seeded LibSQL DB with menu products.
- Integrated React Query into `useMenuData`.

### 2026-01-20 22:45 - Gemini

- Completed SOP-001 Header Injection audit.
- Fixed `ErrorBoundary` lint.
- Updated to Phase 3.
