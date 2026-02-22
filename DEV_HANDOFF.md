# DEV_HANDOFF.md

> **Last Updated:** 2026-02-22 12:28 CST
> **Last Model:** Gemini
> **Session Focus:** Phase 3 POS Localization (complete) + Phase 4 Step 1 Explosion Engine

---

## ✅ Completed This Session

- **Schema**: Added `updatedAt` / `deletedAt` to all 7 syncable tables — `suppliers`, `inventoryItems`, `recipes`, `products`, `modifierOptions`, `users`, `loyaltyProfiles` (`packages/database/src/schema.ts`)
- **Schema**: Added `syncedAt` to `orders` table for POS sync tracking
- **Schema**: Added `orderItemsRelations` back-relation (required for `db.query.orders.findMany({ with: { items } })`)
- **API — Sync Pull**: Implemented `GET /api/sync/pull?since={ts}` delta endpoint (`apps/api/src/server.ts:161`). Verified returns 12 products, 3 categories, 26 modifier options, 27 inventory items, 3 users, 4 loyalty profiles on `since=0`
- **API — Explosion Engine**: Upgraded `POST /api/order/checkout` to be fully **idempotent** — uses `onConflictDoUpdate` for orders, `onConflictDoNothing` for payments/loyalty transactions. Safe for POS retry loops (`apps/api/src/server.ts:518`)
- **API — Order Reads**: Added `GET /api/orders` (paginated + `with: {items, payments}`) and `GET /api/orders/:id` — the Core dashboard can now render order history relationally
- **POS — Local DB**: Switched `apps/pos/src/db/index.ts` from server-side LibSQL to `@libsql/client/web` (OPFS-persisted browser SQLite)
- **POS — Repositories**: `MenuRepository` and `OrderRepository` now import `db` from `../db` (local instance) instead of `@hyphae/database` (server instance)
- **POS — SyncEngine**: Full rewrite of `apps/pos/src/services/SyncEngine.ts` — implements `pullSnapshot()` (atomic upsert of structural data) and `pushOrders()` (upload unsynced orders via checkout endpoint)
- **POS — AuthService**: Offline PIN fallback — tries CORE API first (3s timeout), then queries local `users` table (`apps/pos/src/services/AuthService.ts`)
- **Seed**: Added mass `updatedAt = Date.now()` stamp on all syncable tables at end of `seed.ts` — fixes delta sync returning 0 rows on fresh DB
- **Seed**: Guarded `recipeId` null check in products loop — skips products with no recipe instead of crashing

---

## ⚠️ Known Issues / Broken

- [ ] **`suppliers` missing from `/api/sync/pull`** — BOH needs supplier names for goods reception. Currently only items in the categories/products/users payload are returned.
- [ ] **`modifierGroups` missing from `/api/sync/pull`** — POS needs groups (not just options) to reconstruct the modifier UI card titles. Currently `modifierOptions` are returned but orphaned without their parent group context.
- [ ] **POS Vite WASM Headers** — `@libsql/client/web` requires `Cross-Origin-Opener-Policy: same-origin` and `Cross-Origin-Embedder-Policy: require-corp` headers for OPFS to persist. Vite dev server may need `vite-plugin-cross-origin-isolation` or equivalent config in `apps/pos/vite.config.ts`.
- [ ] **`products.recipeId` NOT NULL** — The seed now skips products missing a `recipeId`. Verify all 12 expected products still seeded correctly (run `GET /api/products` and count).

---

## 🔄 In Progress / Pending

- [ ] **Phase 4 Step 2**: Add `suppliers` and `modifierGroups` to `GET /api/sync/pull` response payload
- [ ] **BOH Supplier Reception UI**: Build the receiving screen in `apps/boh` that consumes synced supplier + inventory data
- [ ] **Hardware Integration** (Phase 4 Step 3): ESC/POS printer driver (Web Bluetooth/USB) + Clip/Mercado Libre payment gateway interface stubs

---

## 📋 Instructions for Next Model

### Priority Order

1. **Fix sync pull payload** — open `apps/api/src/server.ts` at line ~161 (the `GET /api/sync/pull` handler). Add `suppliers` and `modifierGroups` to the `Promise.all([...])` block alongside existing tables. Ensure the response shape includes them and that the POS `SyncEngine.pullSnapshot()` handles inserting them locally.

2. **Add COOP/COEP headers to POS Vite config** — open `apps/pos/vite.config.ts` and add:
   ```ts
   server: {
     headers: {
       'Cross-Origin-Opener-Policy': 'same-origin',
       'Cross-Origin-Embedder-Policy': 'require-corp',
     }
   }
   ```
   This is required for OPFS (the LibSQL WASM storage backend) to work in the browser.

3. **BOH Supplier Reception UI** — `apps/boh` needs a screen where kitchen staff can select a supplier, confirm received quantities, and record a supply order. This triggers `InventoryService.receiveInventory()` on the API.

### Context Needed

- `DEVELOPMENT_PLAN_V2.md` — full roadmap, read Phase 4 section
- `apps/api/src/server.ts` line 161 — sync pull endpoint
- `apps/api/src/services/InventoryService.ts` — all inventory mutations
- `apps/pos/src/services/SyncEngine.ts` — current Pull/Push implementation
- `packages/database/src/schema.ts` — source of truth for all tables + relations

### Do NOT

- Do NOT delete or reset `sqlite.db` while the API dev server is running — it holds a file lock and deletion will fail silently or error
- Do NOT add `updatedAt` to junction/child tables (`recipeIngredients`, `concepts`, `modifierGroups`, `productModifiers`, `supplyOrderItems`, `inventoryTransactions`) — they don't have that column in schema and the TypeScript compiler will reject it
- Do NOT run `db:push --force` with a populated DB unless you've stopped all node processes — always `taskkill /F /IM node.exe /T` first

---

## Session Log (Last 3 Sessions)

### 2026-02-22 — Gemini
- Phase 4 Step 1: The Explosion Engine
- Upgraded `POST /api/order/checkout` with idempotency + WebSocket BOH notification
- Added `GET /api/sync/pull`, `GET /api/orders`, `GET /api/orders/:id`
- POS fully localized: LibSQL WASM, local repositories, SyncEngine v2, offline auth
- Hardened seed with `updatedAt` stamps on all syncable tables
- Verified sync pipeline end-to-end: `since=0` → 12 products, 26 mods, 27 inv, 3 users, 4 loyalty

### 2026-02-20 — Gemini
- Phase 1 Core Foundation finalized
- Recipe Architect + Forecast Engine complete
- Load/Return Cart transaction types defined
- Phase 2 BOH localization activated

### 2026-02-19 — Gemini
- Production hardening: CORS, rate limiting, API key auth, log redaction
- Soft-delete (Recycle Bin) for products
- Full Loyalty → Order → Pay loop verified with DB persistence
- Fixed `is_physical_card` schema mismatch
