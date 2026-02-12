# Skill Review & Optimization Plan

**Context:** The current skill set appears to be largely imported from the "LOOM Engine" project (an Electron/LLM system). `hyphae-pos` is a separate **React Web Application** for Point-of-Sale.

Many existing skills are irrelevant or misleading for this specific repo.

## 🗑️ Skills to Remove (Loom/Electron Specific)

These components do not exist in the Hyphae POS stack and create noise.

| Skill | Reason |
|-------|--------|
| `electron-ipc-patterns` | Project is a Web App (Vite/React), not Electron. |
| `memory-layer-architect` | Refers to "Loom Memory Model (L1-L4)". Hyphae uses React Context/IndexedDB. |
| `spine-generator` | Specific to Loom's "Spines" optimization. Irrelevant. |
| `pattern-designer` | Refers to "Primacy Protection/Tempo". Irrelevant. |
| `governance-reviewer` | Refers to "L2/L3 Memory Layers" and "A0Enforcer". |
| `world-isolation-auditor` | Refers to "Worlds System". Hyphae uses "Concepts/Stores". |
| `reconciliation-service` | Refers to "MD<->DB Dual Truth". Hyphae works differently. |
| `llm-provider` | Hyphae is a manual POS, not an LLM interface (for now). |

## ♻️ Skills to Keep & Update

These are valuable but need 'Hyphae-ification'.

| Skill | Current State | update Required |
|-------|---------------|-----------------|
| `frontend-design` | Generic Web | **Update:** Add Hyphae Design System tokens (Zinc/Lime theme, touch targets). |
| `zustand-stores` | Generic Zustand | **Keep:** Perfectly aligns with "Phase 1" state migration plan. |
| `security` | Electron Focus | **Update:** Shift focus to Web Crypto (PIN hashing), HTTPS, and RBAC. |
| `backend-testing` | Vitest Focus | **Update:** Tailor examples to POS Logic (Cart calculations, taxes). |
| `webapp-testing` | Playwright | **Keep:** Good for E2E testing the POS flow. |
| `drizzle-schema` | SQLite Focus | **Update:** Adapt for **IndexedDB** or future Postgres backend. |
| `handoff-writer` | Generic | **Keep:** Essential for workflow. |
| `session-lifecycle` | Loom Specific | **Update:** Rename `pos-session-manager` (User sessions, shifts, drawers). |

## ✨ New Skills to Create

These fill specific gaps in the `STATUS_REPORT` and `DEVELOPMENT_PLAN`.

| New Skill | Purpose |
|-----------|---------|
| **`pos-domain-logic`** | The "Brain" of the POS. Rules for Modifier dependencies, Tax calculation (8.25%), Kitchen routing, and Packaging algorithms. |
| **`offline-sync`** | Implementation guide for Phase 1: `OfflineQueue`, `IndexedDB` schema, and Reconciliation with Backend. |
| **`react-performance`** | Guidelines for "60fps on Tablet". `React.memo` strategies, Virtualization (tanstack-virtual), and Context splitting. |
| **`design-system`** | Documentation of the Hyphae design tokens, typography, and reusable components (Buttons, Modals, Numpads). |

---

## 📅 Action Plan

1.  **Purge**: Delete the 8 irrelevant Loom skills.
2.  **Rename/Rewrite**: Update `security` and `session-lifecycle`.
3.  **Author**: Create `pos-domain-logic` to capture the complex modifier rules found in `db.json`.
4.  **Author**: Create `offline-sync` to guide the "Phase 1" architecture work.
