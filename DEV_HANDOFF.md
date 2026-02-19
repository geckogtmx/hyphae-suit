# DEV_HANDOFF.md

> **Last Updated:** 2026-02-19
> **Last Model:** Gemini (Antigravity)
> **Session Focus:** Loyalty Registration Fix, DB Schema Sync, & Abyssal Theme Enforcement

---

## ✅ Completed This Session

- **Loyalty System Restoration**:
  - **Registration Fix**: Resolved the "Error Persists" loop by syncing the SQLite schema and adding the missing `is_physical_card` column.
  - **"Start Order" Button**: Fixed the unresponsive button in POS by adding a `cardNumber` fallback to `LoyaltyScreen.tsx` for responses missing the `activeCard` object.
  - **Query Refactor**: Updated `apps/api/src/server.ts` to use explicit `db.select()` instead of the Drizzle Query API to avoid identifier casing mismatches (camelCase vs snake_case).
- **UX & UI Design**:
  - **Inverted Abyssal Theme**: Discovered and enforced the project's inverted color scale (Low `zinc` = Dark BG, High `zinc` = Light Text).
  - **Touch-First Modals**: Integrated the unified `TouchKeypad` into both `LuckyWinnerModal.tsx` and `SwapCardModal.tsx`.
  - **Polish**: Removed non-functional animations (Crown bounce) to prioritize operational speed.

## ⚠️ Known Issues / Broken

- **Minor**: `LoyaltyService.ts` has a minor lint error about a missing declaration which was fixed in the last step but worth verifying.
- **E2E**: The full "Loyalty -> Order -> Pay -> Kitchen" loop has not been manually verified end-to-end.

## 🔄 In Progress / Pending

- [ ] **E2E Verification**: Manually verify the full flow in a running environment.
- [ ] **Production Hardening**: Review API security (currently using simple API Key/PIN).

## 📋 Instructions for Next Model

1. **E2E Verification**:
   - Register a new card (e.g., `BEE101`) via the `LuckyWinnerModal`.
   - Verify it can be looked up on the `LoyaltyScreen`.
   - Ensure "Start Order" successfully enters the menu and applies any member perks.
2. **Database Migrations**: Be aware that `drizzle-kit push` may not have been run recently; manual `ALTER TABLE` was used to sync the live DB during this session.
3. **UI Standards**: Use `zinc-100` for main dark backgrounds and `zinc-900` for primary white text.

### Key Files
- `apps/api/src/server.ts`: Contains the refactored loyalty routes.
- `apps/pos/src/components/LoyaltyScreen.tsx`: Login flow logic and fallback support.
- `apps/pos/src/components/TouchKeypad.tsx`: The canonical touch input component.

---

## Session Log (Last 3 Sessions)

### 2026-02-19 - Gemini (Antigravity)
- **Loyalty**: Fixed Registration loop, synced DB schema (`is_physical_card`), and resolved POS button unresponsiveness.
- **UI**: Enforced Inverted Abyssal Theme across all loyalty components.
- **Keypad**: Integrated `TouchKeypad` for alphanumeric touch-first operation in modals.

### 2026-02-18 - Gemini (Antigravity)
- **Loyalty**: Implemented full Loyalty loop (Async Lookup, Point Redemption Endpoint & UI).
- **UX**: Added Global Toast Notification System (`ToastContext`).

### 2026-02-17 (2) - Gemini (Antigravity)
- **Fix**: Resolved "Maximum update depth exceeded" in POS.
- **Refactor**: Standardized all local networking to `127.0.0.1`.
- **Harden**: Improved API error handling and input validation for the Checkout endpoint.

### 2026-02-17 (1) - Gemini (Antigravity)
- **Sync**: Configured `SocketManager` for POS/BOH realtime communication.
- **UI**: Implemented Production/Assembly views in BOH.
- **Polish**: Fixed POS dark mode header inconsistencies.
