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
- [ ] **E2E Verification**: Manually verify full loop: Loyalty Login -> Order -> Pay -> Kitchen.

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

## 📋 On Deck
- [ ] **Production Hardening**: Rate limiting, security headers.
- [ ] **BOH Updates**: Add "Prep View" for non-KDS stations.
