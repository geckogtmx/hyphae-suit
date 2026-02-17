# 📝 Active Tasks

> **Focus**: Phase 3.1 - UI Polish & Production Polish  
> **Status**: In Progress  
> **Last Updated**: 2026-02-17

---

## 🚀 Sprint: Payment & Loyalty Integration

### 1. Payment Gateway Abstraction
- [x] **Define Interface**: Create `PaymentProvider` interface in `apps/pos/src/services/payment`.
- [x] **Mock Providers**: Implement `StripeMockProvider` and `SquareMockProvider`.
- [x] **POS Integration**: Update `CheckoutContext` to utilize the abstraction.

### 2. Checkout & Inventory Sync
- [x] **Checkout API**: Create `POST /api/order/checkout` in `apps/api`.
- [x] **Inventory Deduction**: Implement server-side logic in `InventoryService`.
- [x] **Realtime Sync**: Emit `inventory:updated` events via Sockets.

### 3. Loyalty System
- [x] **Loyalty API**: Implement endpoints for profile lookup and history in `apps/api`.
- [x] **POS Alignment**: Update `useLoyalty` hook to call the backend instead of local mock.
- [x] **AI Polishing**: Enhance the "AI Analysis" dashboard with loyalty membership data.

### 4. UI Polish & Analytics
- [x] **Analysis Dashboard**: Refine UI in `apps/core` to better display AI-generated insights and loyalty metrics.

### 5. Payment Hardware Hardening (Phase 2.1)
- [x] **Fix API URL**: Ensure `OrderService.checkout` uses correct fallback for `VITE_API_URL`.
- [x] **Cash Drawer**: Implement `CashDrawerService` stub and integrate into Cash payment flow.
- [x] **Receipt Printing**: Implement `ReceiptService` stub and simulate print job on checkout.

---

## ✅ Completed (Recent)

### Sprint: Realtime Sync & Backend Analysis
- [x] **Socket Infrastructure**: Established for API, POS, and BOH.
- [x] **Real-time Order Flow**: Verified POS -> BOH -> POS updates.
- [x] **Backend Analytics**: AI insights wired to seeded SQLite data.

---

## 📋 On Deck / Next Up

### Phase 3: Production Hardening
- [x] **Error Handling**: comprehensive global error boundaries in POS, Core, and BOH.
- [x] **Performance**: React Query caching optimizations for static and dynamic data.
- [x] **Security**: API rate limiting, Helmet security headers, and WebSocket authentication middleware.

### Phase 3.1: Final Polish & UX
- [x] **POS Experience**: Refine transition animations for modifier selection using `framer-motion`.
- [x] **Core Analytics**: Add "Connection Status" breadcrumbs for POS/BOH health monitoring in Navigation Header.
- [x] **BOH Flow**: Implement "Order Bump" confirmation sound effects (programmatic via Web Audio).

