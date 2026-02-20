# @AI_CODEX.md - The Constitution & Stack

**Project**: Hyphae Suit Monorepo  
**Version**: 2.0 (V2 Architecture)  
**Last Updated**: 2026-02-20  

> ⚠️ **IMPERATIVE**: This document is the supreme law of the codebase. All AI agents must read and internalize its contents at the start of every session.

---

## 1. Core Mandates

1.  **Read First**: Always read `@AI_CODEX.md`, `GEMINI.md`, and `DEV_HANDOFF.md` before taking any action.
2.  **No Hallucinations**: Do not invent file paths, APIs, or dependencies. Verify existence before use.
3.  **Atomic Commits**: Make small, logical changes. Verify each step before proceeding.
4.  **Zero-Secret Policy**: Never hardcode secrets. Use `.env` and `process.env`.
5.  **Type Safety**: TypeScript is strict. No `any`. Shared types live in `@hyphae/schemas`.
6.  **User First**: Prioritize user experience and stability over clever code.

## 2. Technology Stack

-   **Monorepo**: pnpm workspace
-   **Frontend**: React 19, Vite, TailwindCSS
-   **Backend**: Node.js (Fastify/Express), SQLite (LibSQL), Drizzle ORM
-   **State Management**: Zustand (Global), React Query (Server State)
-   **Realtime**: Socket.io
-   **Styling**: Vanilla CSS (Base) + Tailwind Utility Classes

## 3. Directory Structure

-   `apps/core`: Control Center & Master Node (Desktop/Cloud)
-   `apps/boh`: Kitchen Engine & Receiving (Tablet, Realtime)
-   `apps/pos`: Point of Sale (Tablet, Offline-First SQLite Replica)
-   `apps/market`: Market Companion (BOH Mobile, offline shopping list)
-   `apps/patron`: Customer Facing (Loyalty, Mobile Orders)
-   `apps/api`: Backend API & Sync Engine WebSocket Server
-   `packages/schemas`: Shared Zod definitions
-   `packages/database`: Drizzle ORM schema & client
-   `packages/ui`: Shared component library (Planned)

## 4. Operational Protocols

### Code Hygiene Blueprint
| Rule | Description |
| :--- | :--- |
| **Header Compliance** | Every file must have `@author`, `@description`, `@version`. |
| **The 30-Line Rule** | Decompose functions > 30 lines. Keep logic focused. |
| **Documentation** | Explain *intent* (Why), not just *action* (What). |
| **Data Validation** | Use Zod schemas for all API inputs/outputs. |

### Error Handling
-   **Global Boundary**: Every app must have a top-level Error Boundary.
-   **Toast Notifications**: User-facing errors must be displayed via Toast.
-   **Console Logs**: Use structured logging. No `console.log` in production.

### Testing Standard
-   **Unit Tests**: Vitest for utility functions and hooks.
-   **E2E Tests**: Playwright for critical flows (Login -> Order -> Checkout).
-   **Coverage**: Aim for 80% coverage on domain logic.

## 5. Agent Workflow

1.  **Initialize**: Read Governance Docs.
2.  **Plan**: Check `TASKS.md` and `DEV_HANDOFF.md`.
3.  **Execute**: Implement changes iteratively.
4.  **Verify**: Run tests or manual verification steps.
5.  **Document**: Update `DEV_HANDOFF.md` before ending session.

---

**End of Codex**
