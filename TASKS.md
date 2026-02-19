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
- [ ] **BOH Receiving**: Build workflow for checking in supplier deliveries and stocking inventory.
- [ ] **Live Prep Sync**: Bind KDS orders to real-time prep lists for station awareness.
- [ ] **Shift Log/HACCP**: Implement mandatory temperature checkpoints & shift handover logs.
- [ ] **Loyalty Redemption UI**: Finish connecting Gold/Vip perk selection in POS cart.
