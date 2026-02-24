# 📝 Active Tasks (CORE Focus + V2 Execution)

> **Focus**: Finalizing CORE (Phase 1 stragglers) & Phase 4 AI Integrations
> **Last Updated**: 2026-02-24
> **Blueprint**: `DEVELOPMENT_PLAN_V2.md`

---

## 🎯 Phase 1 (CORE Application Stragglers)
*Goal: Complete all structural responsibilities originally assigned to the CORE Master Node before focusing fully on peripheral apps.*

- [x] **Supply Orders (Purchase Orders)**
  - Finish implementing the UI for Vendor & Supply Ordering (`supplyOrders`).
  - Integrate a Purchase Order generation workflow that connects low stock to preferred suppliers.
  - **IMPLEMENTED**: Created the `SuppliersView.tsx` with full CRUD for Vendors, alongside manual and auto-draft PO generation.
- [x] **The Mathematical Forecast Engine**
  - **IMPLEMENTED**: Created the `pregForecasts` and `prepForecastItems` data architecture. Overhauled the `ForecastView` to support calendar scheduling, multi-instance plans, interactive item mapping, and integration with the backend `runForecast` atomic explosion service. Saved instances are persisted safely in the DB.
- [x] **Fleet & Labor Aggregation**
  - "Implicitly calculating Time & Attendance based on login/logout timestamps across all peripheral nodes (POS, BOH)."
  - Wire up a proper UI view in the CORE Fleet/Dashboard section to display active/historical labor data synced from the nodes.
  - **IMPLEMENTED**: Created the `labor_shifts` and relational sync schema. Generated the `FleetView` monitoring hub to inspect topology states and active human workflows.

---

## 🎯 Phase 4.4: High-Value AI Tools (Current Active Phase)
*Goal: Integrate 5-Star AI operational helpers across the ecosystem.*

- [x] Deploy the AI Bookkeeper (CORE).
- [x] Predictive Prep Forecasting (CORE->BOH).
- [ ] **Invoice OCR Ingestion (BOH -> API)**
  - Implement an endpoint inside `apps/api` to ingest snapped photos/PDFs of supplier invoices and parse them into `inventoryTransactions` using Gemini AI.
  - Implement the BOH Tablet UI for capturing these invoices.
- [ ] **Kitchen Shorthand Generation (BOH/KDS)**
  - Validate and expand the existing `/api/kitchen-note` endpoint to format incoming complex POS tickets into concise 20-character shorthands for the prep kitchen.

---

## 🎯 Phase 4.5: Solidification & Testing
*Goal: Ensure robustness of the newly established Sync and Logistics systems.*

- [ ] **Testing & Coverage**:
  - Implement comprehensive Vitest coverage for `InventoryService` and backend order explosion logic.
- [ ] **UI Polish**:
  - Add subtle micro-animations for enhanced user experience in BOH components.

---

# ✅ Completed Tasks

<details>
<summary>Phase 3 & 4 (POS Sync, Hardware, & AI First Pass)</summary>

- [x] **Terminal Hardware**: Implemented ESC/POS printer driver (Web Bluetooth/USB) and Clip/Mercado Libre receipt generation inside POS.
- [x] **Intelligence View**: Overhauled `apps/core/App.tsx` AI Hub, integrating the AI Bookkeeper and Predictive Forecaster API endpoints.
- [x] **Fastify Stability**: Resolved fatal duplicate route exceptions inside `apps/api`.
- [x] **The Explosion Engine**: Implemented `POST /order/checkout` idempotency, deducting PREP ingredients from STAND on sync.
- [x] **BOH Disposition System**: Established `CONVERSION_OUT`/`IN` vs `WASTE` logic.
- [x] **POS Local Database Engine**: Integrated LibSQL WASM with OPFS persistence.
</details>
