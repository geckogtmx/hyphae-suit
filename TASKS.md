# 📝 Active Tasks

> **Focus**: Phase 1.5 - Security Remediation & Backend API Integration  
> **Status**: In Progress  
> **Last Updated**: 2026-02-15

---

## 🚀 Sprint: API Security & Core Integration

### 1. Runtime Configuration
- [x] **Configure Turbo Dev**: Ensure `pnpm dev` at root runs `apps/api` concurrently with `apps/core` and `apps/pos`.
  - *Context*: Verified `turbo.json` and package scripts.

### 2. Backend Security (`apps/api`)
- [x] **Implement API Key Auth**: proper middleware to validate `x-api-key` header.
  - *Secret*: Stored `HYPHAE_API_KEY` in `.env`.
- [x] **Tighten CORS**: Restrict `origin` to `localhost:5173` (Core) and `localhost:5174` (POS) only.
- [x] **Move Schemas**: Extract `AnalyzePayloadSchema` and `KitchenNotePayloadSchema` to `@hyphae/schemas`.
  - *Goal*: Share validation logic with clients.

### 3. Client Integration (`apps/core`)
- [x] **Auth Injection**: Update `ApiClient` to send `x-api-key` from environment variables.
- [x] **Error Handling**: Replace console errors with user-friendly toast notifications (or alert fallbacks).
- [x] **Type Safety**: Import shared schemas from `@hyphae/schemas` for request validation.

### 4. Verification
- [x] **End-to-End Test**: Verify "AUTO-ANALYZE" button works with enabled security. (Confirmed Real AI Response)
- [x] **Negative Test**: Verify requests without key are rejected (401). (Logic implemented)

---

## 📋 On Deck / Next Up

### Phase 2: POS Integration (Prep)
- [x] **Auth Service Stub**: Create `AuthService` interface in `apps/pos`. (Done in `src/services/AuthService.ts`)
- [x] **Kitchen Note**: Refine `kitchen-note` prompt for strict formatting. (Updated `server.ts` prompt)

### Phase 2: POS Execution (Next Sprint)
- [ ] **Wire Login UI**: Update POS `LoginView` to use `AuthService.loginWithPin`.
- [ ] **POS API Client**: Create `apps/pos/src/lib/apiClient.ts` (Mirror of Core).
- [ ] **Send Order**: Implement "Send to Kitchen" button that POSTs to `/api/kitchen-note` (for testing).

### Phase 2: Database
- [ ] **Seed Data**: Ensure `packages/database` has robust mock data for "Analysis" scenarios.
