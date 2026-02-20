# 📝 Active Tasks

> **Focus**: Phase 3.2 - Stabilization & Payment UI
> **Status**: In Progress
> **Last Updated**: 2026-02-19

---

## 🚨 Critical: Final Polish
- [x] **UI Feedback**: Added `ToastContext` and integrated with `CheckoutContext` for payment success/failure.
- [x] **Reward Redemption**: Implemented `RedemptionModal` and API endpoint `POST /api/loyalty/redeem`.
- [x] **Loyalty Registration (Backend)**: Added `POST /api/loyalty/register` and Service Method.
- [x] **Loyalty Registration (UI)**: Implemented via "Lucky Issuance" flow & Manual Trigger (Code 0000).
- [x] **Token Swapping**: Added Manager override to swap physical cards.
- [x] **E2E Verification**: Verified Loyalty Login -> Order -> Pay -> Database Persistence (Profile: BEE101). Next: Verify Kitchen routing.
- [x] **Menu Archival (Recycle Bin)**: Implemented soft-delete, restoration, and permanent purge for products.

---

## ✅ Completed (Recent)
- [x] **Lucky Issuance**: Added 10% chance reward logic & UI logic.
- [x] **POS ErrorBoundary**: Fixed `Property 'props' does not exist` typing.
- [x] **POS DB Schema**: Verified correct imports from `@hyphae/database`.
- [x] **Database Package**: Verified `import.meta.env` usage is safe.
- [x] **Payment Wiring**: Verified `CheckoutContext` calls `OrderService.checkout` for backend persistence.
- [x] **Loyalty Refactor**: Converted `useLoyalty` to on-demand async lookup via `LoyaltyService` (removed mock data dependency).
- [x] **Loyalty UI**: Connected "Add Loyalty" modal to real API lookup.

---

- [x] **Production Hardening**: Rate limiting, security headers, log redaction, API key enforcement.
- [x] **BOH Expansion**: Implemented Prep Dashboard & Kitchen Codex (Recipe Library).

---

## 📋 On Deck
- [x] **BOH Receiving**: Built workflow for checking in supplier deliveries and stocking inventory.
- [x] **Recipe BOM Integration**: Implemented full Implosion/Explosion logic. Added Batch Production tracking (Raw -> Prep) and Recipe CRUD.
- [x] **Dual Inventory**: Separated Stock into Kitchen (BOH) vs Stand (POS). Added Transfer API & UI.
- [x] **Clarify Recipe Types**: Renamed 'ASSEMBLY' -> 'PRODUCT' in UI to distinguish sellable items from BATCH prep.
- [x] **Multi-Menu Modality**:
  - [x] **Audit**: Ensure only "Code BS" (Burgers) and "Tacocracy" (Tacos) exist.
  - [ ] **POS**: Enforce strict modality view.
  - [x] **Core/BOH**: Add "Concept" filter to views (Recipes, Inventory) to toggle between menus.
- [x] **Recipe Foundation**: Migrated recipes to database with support for complex burger assembly (Meats, Veggie, all Sauces). Synchronized CORE & BOH apps to live API data.
- [x] **Menu Builder Integration**: Completed full Product Builder with Recipe/Inventory linking. Implemented backend support for deep updates (Product -> Modifiers -> Options).
