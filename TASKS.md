# 📝 Active Tasks (V2 Execution)

> **Focus**: Phase 2 - Localizing the BOH (Prep Kitchen Helper)
> **Status**: Phases 2.0–2.4 Complete ✅
> **Last Updated**: 2026-02-22
> **Blueprint**: `DEVELOPMENT_PLAN_V2.md`

---

## 🎯 Phase 2.0: Database Strict Constraints & Safeguards
*Goal: Enforce strict data integrity at the schema level to prevent orphaned items and broken pipelines.*

- [x] **Schema Restrictions (`packages/database/src/schema.ts`)**:
  - [x] Enforce `recipeId` as `.notNull()` on `products` table.
  - [x] Ensure `modifierOptions` enforce proper linkage if applicable.
- [x] **Zod Schema Validations (`@hyphae/schemas`)**:
  - [x] Add `.superRefine` on Inventory Items so `RAW` items natively require a supplier.
  - [x] Ensure `ProductSchema` strictly requires a `recipeId` during any UI input.

## 🎯 Phase 2.1: Supplier Reception (BOH)
*Goal: Empower staff at the back door to receive deliveries (`inventoryItems` RAW) seamlessly.*

- [x] **Goods Reception UI (`apps/boh`)**:
  - [x] Build the interface to receive deliveries based on `suppliers` data synced from CORE.
  - [x] Allow logging of `quantityReceived` against expected `quantityOrdered`.
- [x] **Inventory Update Logic**:
  - [x] Ensure received items increment `stockKitchen` and log an `inventoryTransactions` of type `RECEIVE`.

## 🎯 Phase 2.2: Batch Prep UI (BOH)
*Goal: Guide staff in turning RAW goods into PREP sub-products.*

- [x] **Batch Prep Interface**:
  - [x] Implement UI for selecting a BATCH recipe synced from CORE.
  - [x] Allow entering the `quantityProduced`.
- [x] **Yield & Depletion Logic**:
  - [x] Create function to deduct required RAW ingredients from `stockKitchen`.
  - [x] Increment the PREP item in `stockKitchen`.
  - [x] Log corresponding `inventoryTransactions` (`USAGE` and `PRODUCTION`).

## 🎯 Phase 2.3: The Cart Exchange & Waste Logging (BOH)
*Goal: Manage daily transfers and record spoilage.*

- [x] **Cart Exchange Workflow**:
  - [x] Implement "Load Cart" UI (moving `stockKitchen` to `stockStand`).
  - [x] Implement "Return Cart" UI (moving `stockStand` back to `stockKitchen`).
- [x] **Waste & Yield Logs**:
  - [x] Add ability to log spoilage/waste during the return phase.
  - [x] Capture actual yield vs. expected yield during BATCH prep.

## 🎯 Phase 2.4: BOH UI Refinement
*Goal: Address user feedback on real-estate and flow.*

- [x] **Inventory Dashboard Revamp**:
  - [x] Convert `apps/boh/src/components/inventory/dashboard.tsx` to a Master-Detail layour (List on left, Details card on right).
  - [x] Remove the "Add Item" button from this view (handled in Receive tab).

---

# ✅ Completed Tasks

<details>
<summary>Phase 1: Perfecting the Core Foundation</summary>

## 🎯 Phase 1.1: Supplier & Order Hub (CORE)
- [x] **Supplier Management UI**:
  - [x] Implement CRUD interface for the `suppliers` table (List, Add, Edit, Soft-Delete).
  - [x] Add basic contact info and delivery day tracking.
- [x] **Purchase Order (PO) Generator**:
  - [x] Implement UI for `supplyOrders` (Draft, Submitted, Fulfilled states).
  - [x] Implement `supplyOrderItems` linking suppliers to expected RAW goods.

## 🎯 Phase 1.2: The Recipe Architect & Forecast Engine (CORE)
- [x] **Recipe Builder Completion**:
  - [x] Ensure `ProductBuilder.tsx` correctly distinguishes between `BATCH` (Prep) and `ASSEMBLY` (Sales) recipes.
  - [x] Ensure `recipeIngredients` map correctly to `inventoryItems` costs for live margin calculation.
- [x] **The Forecast Engine (Logic)**:
  - [x] Create utility/service: Input target sales (e.g., 50 Burgers) -> explode into Assembly Recipe -> explode into Batch Recipes -> output required RAW inventory.
- [x] **The Forecast Engine (UI)**:
  - [x] Build a dashboard view in CORE to input the "Weekend Target" and display the resulting "Required Shopping List".

## 🎯 Phase 1.3: Stand Transfers (CORE)
- [x] **Transfer API Routes (`apps/api/src/server.ts`)**:
  - [x] Implement `POST /inventory/transfer` (requires source location, target location, item ID, quantity).
  - [x] Add transaction logging for transfers.
- [x] **Transfer UI (`apps/core/views/InventoryView.tsx`)**:
  - [x] Add a "Transfer Stock" modal/button in the internal inventory view.
  - [x] Allow moving `X` units from `stockKitchen` to `stockStand` (or vice versa).

</details>
