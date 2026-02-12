# GEMINI.md - Project Map & Source of Truth

**Status**: Phase 3 - Backend Integration (Infrastructure)
**Last Updated**: 2026-01-20

## 1. Project Overview

- **Project Name**: Hyphae POS
- **Architecture**: React 19 + Vite + Tailwind (SHASO) + Drizzle ORM + LibSQL
- **Current Phase**: Phase 2 (Audit & Refactor Phase Complete)

## 2. Operational Protocol

You operate under the **AI CODEX**.
Location: `e:\git\hyphae-pos\AI_CODEX.md`

> ⚠️ **IMPERATIVE**: You must read `AI_CODEX.md` at the start of every session. It contains your Rules of Engagement, Context, and Directives.

## 3. Code Hygiene Standard (Blueprint)

The following rules are to be enforced during the audit:

| Rule                   | Description                                                                  | Status  |
| :--------------------- | :--------------------------------------------------------------------------- | :------ |
| **Header Compliance**  | Every file must have `@author`, `@description`, `@version`, `@last-updated`. | Pending |
| **Zero-Secret Policy** | Move hardcoded keys to `.env`. No secrets in source.                         | Pending |
| **The 30-Line Rule**   | Flag/Decompose functions > 30 lines.                                         | Pending |
| **Documentation**      | Explain the _intent_ (the "Why") of complex logic.                           | Pending |
| **Type Safety**        | Strict Interface definitions for all methods.                                | Pending |
| **Data Validation**    | Use Zod for all I/O shapes.                                                  | Pending |

## 4. Inventory & Audit Log

| File                    | Hygiene Score | Status | Notes                                    |
| :---------------------- | :------------ | :----- | :--------------------------------------- |
| `src/index.tsx`         | 6/6           | Clean  | Header added, documented.                |
| `src/App.tsx`           | 6/6           | Clean  | Decomposed (209 lines), Header added.    |
| `src/db/schema.ts`      | 6/6           | Clean  | Header added, documented.                |
| `src/components/*.tsx`  | 6/6           | Clean  | All 20+ components have SOP-001 headers. |
| `src/hooks/*.ts`        | 6/6           | Clean  | Headers injected.                        |
| `src/context/*.tsx`     | 6/6           | Clean  | Headers injected.                        |
| `src/utils/*.ts`        | 6/6           | Clean  | Headers injected.                        |
| `src/types.ts`          | 6/6           | Clean  | Header injected.                         |
| `src/data/mock_data.ts` | 6/6           | Clean  | Header injected.                         |

## 5. Technical SOPs

- [x] SOP-001: Header Injection (Core Files)
- [x] SOP-002: Function Decomposition (`App.tsx`)
- [x] SOP-003: Secret Migration (Synced .env)

## 6. Maintenance Log

- 2026-01-20: Initialized `GEMINI.md` for `pretty-code` workflow.
- 2026-01-20: Integrated Audit Blueprint.
- 2026-01-20: Phase 2 Inventory & Verification Complete.
- 2026-01-20: SOPs generated and executed.
- 2026-01-20: `App.tsx` decomposed from 386 to 209 lines.
- 2026-01-20: `.env` and `.env.example` synchronized.
- 2026-01-20: SOP-001 Header Injection completed across entire codebase.
- 2026-01-20: Repository audited for 30-line rule (most components are modularized).
- 2026-01-20: Phase 3 Infrastructure: Created Repositories, Service Layer, and Seeded LibSQL DB.
- 2026-01-20: React Query integrated into `useMenuData` and `useLoyalty`.
- 2026-01-20: Implemented Offline-First `SyncEngine` (idb) and refactored `LoyaltyScreen` to use hooks.
