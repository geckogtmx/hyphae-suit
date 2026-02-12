# AI CODEX - Hyphae Core

## The Constitution

This document defines the governance, architectural mandates, and operational protocols for **Hyphae Core**, the strategic core of the Hyphae POS ecosystem.

### 1. Core Mandates
- **Stability First**: The Core must remain stable. Any changes to `types/schema.ts` must be backwards compatible or include a migration strategy.
- **POS Data Contract**: `types/schema.ts` is the **source of truth** for the POS. Breaking changes require 1-month deprecation notice and dual-schema support.
- **Offline-First**: All core logic must function without an internet connection. Sync is an asynchronous accelerator, not a requirement for operation.
- **SHASO UI**: All UI components must adhere to the "Single Hand Solo Operator" design language—optimized for index-finger interaction on tablets.
- **Abyssal Palette**: Use the Ink (#0A0A0A), Jet (#1A1B1E), and Teal/Brand (#84CC16) color system.

### 2. Tech Stack
- **Frontend**: React (Vite), Lucide-React, TailwindCSS.
- **State**: Zustand 5 for reactive UI state.
- **Database**: Drizzle ORM (SQLite/LibSQL).
- **AI**: Gemini 2.x Flash for strategic analysis and SOP management.
- **Logic**: Zod for schema validation.

### 3. Data Philosophy: "Code B-Smash"
The data structure is hierarchical and recursive. The Core is the source of truth for:
- **Concepts & Categories**: Multi-brand support.
- **Products & Modifiers**: Recursive configuration.
- **Recipes & Inventory**: Back-of-house integration.
- **Agent Metadata**: Specialized fields for Logistics (PLS), Optimizer (KPO), Trainer (SOP), etc.

### 4. Developer Protocols
- Always update `@DEV_HANDOFF.md` at the end of a session.
- Maintain `task.md` in the brain directory for active session tracking.
- Run tests (`npm test`) before proposing changes.
- **Schema Changes**: Any modification to shared types in `types/schema.ts` must be validated against POS compatibility.

### 5. Ecosystem Integration
- **POS Repository**: [geckogtmx/hyphae-pos](https://github.com/geckogtmx/hyphae-pos)
- **Integration Docs**: See `docs/POS_INTEGRATION.md` for data contracts and API specifications.
- **Menu Distribution**: Core publishes `MenuRelease` snapshots; POS consumes them offline-first.
- **Transaction Flow**: POS submits `TransactionRecord[]` to Core for analytics and inventory deduction.
- **Fleet Monitoring**: POS sends `DeviceState` heartbeats; Core displays fleet health dashboard.

---
*Authorized by the Architect.*
