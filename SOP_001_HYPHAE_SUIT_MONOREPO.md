# SOP-001: Hyphae Suit Monorepo Migration & Production Roadmap

> **Status:** APPROVED  
> **Created:** 2026-02-07  
> **Author:** AI Collaborative (Gemini)  
> **Scope:** Complete migration plan from dual-repo to Turborepo monorepo  
> **Timeline:** 10-12 weeks to production

---

## 📋 Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Migration Strategy](#3-migration-strategy)
4. [Phase 0: Monorepo Setup](#4-phase-0-monorepo-setup-week-1)
5. [Phase 1: CORE API Backend](#5-phase-1-core-api-backend-week-2-3)
6. [Phase 2: POS Integration](#6-phase-2-pos-integration-week-4-5)
7. [Phase 3: Payment Integration](#7-phase-3-payment-integration-week-6)
8. [Phase 4: Production Hardening](#8-phase-4-production-hardening-week-7-8)
9. [Phase 5: Multi-Tenant & Scaling](#9-phase-5-multi-tenant--scaling-week-9-10)
10. [Phase 6: BOH Integration](#10-phase-6-boh-integration-week-11-12)
11. [Technical Specifications](#11-technical-specifications)
12. [Risk Register](#12-risk-register)
13. [Appendices](#13-appendices)

---

## 1. Executive Summary

### 1.1 Objective

Migrate from two independent repositories (`hyphae-pos`, `hyphae-core`) to a unified Turborepo monorepo (`hyphae-suit`), then integrate, harden, and deploy as a production-ready multi-tenant POS ecosystem.

### 1.2 Why Turborepo?

| Factor           | Separate Repos               | Turborepo Monorepo               |
| ---------------- | ---------------------------- | -------------------------------- |
| **Schema Sync**  | Manual, error-prone          | Automatic via `packages/schemas` |
| **Build Speed**  | Independent, redundant       | Cached, parallel builds          |
| **Code Sharing** | npm link or copy-paste       | First-class package imports      |
| **Git History**  | Preserved (moved as subdirs) | Preserved                        |
| **CI/CD**        | Two pipelines                | Single unified pipeline          |
| **Team DX**      | Context switching            | Unified workspace                |

### 1.3 Final Architecture

```
hyphae-suit/
├── apps/
│   ├── pos/          # Tablet POS (React 19 + Vite)
│   ├── core/         # Backend API (Fastify + Drizzle)
│   ├── admin/        # Admin Dashboard (React 19 + Vite)
│   └── boh/          # Kitchen Display (React 19 + Vite)
├── packages/
│   ├── schemas/      # Shared TypeScript types (Zod)
│   ├── ui/           # Shared React components (SHASO)
│   ├── database/     # Drizzle schema & migrations
│   ├── config/       # ESLint, Prettier, TypeScript configs
│   └── utils/        # Shared utilities
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

### 1.4 Timeline Summary

| Phase                  | Duration   | Key Deliverable              |
| ---------------------- | ---------- | ---------------------------- |
| **0: Monorepo Setup**  | Week 1     | Turborepo + shared packages  |
| **1: CORE API**        | Week 2-3   | REST API + WebSocket backend |
| **2: POS Integration** | Week 4-5   | POS connected to CORE        |
| **3: Payments**        | Week 6     | Stripe Terminal integration  |
| **4: Production**      | Week 7-8   | Monitoring + CI/CD           |
| **5: Multi-Tenant**    | Week 9-10  | Multi-store support + Admin  |
| **6: BOH**             | Week 11-12 | Kitchen Display System       |

---

## 2. Current State Assessment

### 2.1 Hyphae POS (`e:\git\hyphae-pos`)

**Status:** MVP Complete (Phase 3)  
**Last Session:** 2026-01-20 (18 days ago)  
**Git Status:** 1 commit ahead of `origin/main` (needs push)

#### Strengths

| Metric            | Status     | Evidence                       |
| ----------------- | ---------- | ------------------------------ |
| **Architecture**  | ⭐⭐⭐⭐⭐ | Services → Repos → Data layers |
| **Testing**       | ⭐⭐⭐⭐⭐ | 19/19 tests passing (5.5s)     |
| **Code Quality**  | ⭐⭐⭐⭐⭐ | 6/6 hygiene score              |
| **Documentation** | ⭐⭐⭐⭐⭐ | 10+ docs, 11 agent skills      |
| **UI/UX**         | ⭐⭐⭐⭐⭐ | SHASO design system            |

#### Completed Tasks

- ✅ Phase 0: Stabilization (12 tasks)
- ✅ Phase 1: Testing & QA (7 tasks)
- ✅ Phase 2: Architecture (7 tasks)
- ✅ Phase 3: Backend Integration (5 tasks)

#### Known Gaps

- ❌ No backend API connection (mock data only)
- ❌ No real authentication (hardcoded PINs)
- ❌ No payment processing
- ❌ SyncEngine exists but not wired to OrderRepository
- ⚠️ 4 lint warnings (minor: unused vars, `any` types)

#### Unpushed Changes

```bash
# Commit bcc602f needs to be pushed
git push origin main
```

**Files Changed:** 53 files (+6,915/-3,946 lines)

### 2.2 Hyphae Core (`e:\git\hyphae-core`)

**Status:** Proto-Dashboard (Initialization)  
**Last Session:** 2026-01-16 (22 days ago)  
**Git Status:** Clean, up to date with origin

#### Current State

| Feature               | Status                               |
| --------------------- | ------------------------------------ |
| **Proto-Dashboard**   | ✅ Complete                          |
| **Schema Definition** | ✅ `types/schema.ts` (210 lines)     |
| **Governance Docs**   | ✅ `@AI_CODEX.md`, `@DEV_HANDOFF.md` |
| **Drizzle ORM**       | 🟡 Planned (not installed)           |
| **Zustand Stores**    | 🟡 Planned (not installed)           |
| **Menu Export**       | ❌ Not started                       |
| **API Layer**         | ❌ Not started                       |

#### Known Issues

- ❌ `MOCK_DATA` hardcoded in `App.tsx:67-134`
- ❌ `App.tsx` is monolithic (1007 lines, needs decomposition)
- ❌ Dependencies not installed (`pnpm install` not run)
- ❌ TypeScript errors until dependencies installed
- ❌ Zod validation not installed

### 2.3 Schema Alignment Analysis

Both repos define shared types that must stay synchronized:

| Type             | Core Location     | POS Location   | Status                           |
| ---------------- | ----------------- | -------------- | -------------------------------- |
| `Concept`        | `types/schema.ts` | `src/types.ts` | ✅ Aligned                       |
| `Category`       | `types/schema.ts` | `src/types.ts` | ✅ Aligned                       |
| `Product`        | `types/schema.ts` | `src/types.ts` | ⚠️ POS has `packaging` extension |
| `ModifierGroup`  | `types/schema.ts` | `src/types.ts` | ⚠️ POS has `dependency` field    |
| `ModifierOption` | `types/schema.ts` | `src/types.ts` | ✅ Aligned                       |
| `Recipe`         | `types/schema.ts` | `src/types.ts` | ⚠️ Different structure           |
| `InventoryItem`  | `types/schema.ts` | `src/types.ts` | ⚠️ Different units               |

**Schema Drift Notes:**

- POS-specific: `ModifierDependency`, `PackagingMetadata`, `OrderItem` extensions
- CORE-specific: `logisticsMetadata`, `prepBatchSize`, `costOfGoods`, `recipeText`
- **Rule:** POS ignores unknown fields; CORE never removes base fields

### 2.4 Environment Variables

**POS (.env):**

```env
VITE_GEMINI_API_KEY=your_key_here
VITE_CORE_API_URL=http://localhost:3001
```

**CORE (.env.local):**

```env
GEMINI_API_KEY=your_key_here
DATABASE_URL=file:./sqlite.db
```

### 2.5 Agent Skills Inventory

Both repos have `.agent/skills/` directories with 11 shared skills:

- `backend-testing`, `drizzle-schema`, `frontend-design`
- `handoff-writer`, `offline-sync`, `pos-domain-logic`
- `pos-session-manager`, `security`, `skill-creator`
- `webapp-testing`, `zustand-stores`

**Action:** Unify into `packages/config/.agent/skills/` during migration.

---

## 3. Migration Strategy

### 3.1 Decision: Incremental Migration (Not Greenfield)

**Selected Approach:** Move existing repos into Turborepo (preserve git history)

**Rejected Alternative:** Build from scratch (loses 18 weeks of work, high risk)

### 3.2 Migration Principles

1. **Preserve History:** Move repos, don't recreate
2. **Incremental Extraction:** Extract shared code over time
3. **Zero Downtime:** Both apps continue working during migration
4. **Test Continuously:** Run full test suite after each change
5. **Document Everything:** Update handoff docs as we go

### 3.3 Repository Locations

**Before:**

```
E:\git\hyphae-pos\    # Tablet POS
E:\git\hyphae-core\   # Backend + Dashboard
```

**After:**

```
E:\git\hyphae-suit\   # Unified monorepo
├── apps/pos/         # POS (moved from hyphae-pos)
└── apps/core/        # CORE (moved from hyphae-core)
```

---

## 4. Phase 0: Monorepo Setup (Week 1)

### 4.1 Day 1-2: Turborepo Initialization

#### Step 1: Create Monorepo Root

```bash
# Create new directory
mkdir E:\git\hyphae-suit
cd E:\git\hyphae-suit

# Initialize git
git init

# Create package.json
npm init -y
```

#### Step 2: Install Turborepo

```bash
pnpm add turbo -D
```

#### Step 3: Configure Turborepo

**File: `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "outputs": []
    }
  }
}
```

#### Step 4: Configure pnpm Workspaces

**File: `pnpm-workspace.yaml`**

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
```

#### Step 5: Create Root package.json

**File: `package.json`**

```json
{
  "name": "hyphae-suit",
  "private": true,
  "scripts": {
    "dev": "turbo run dev",
    "dev:pos": "turbo run dev --filter=pos",
    "dev:core": "turbo run dev --filter=core",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "format": "prettier --write ."
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "prettier": "^3.8.0"
  },
  "packageManager": "pnpm@9.0.0"
}
```

### 4.2 Day 2: Move Existing Repos

#### Step 6: Move POS

```bash
# Create apps directory
mkdir -p apps

# Move POS (preserves .git if you want history)
# Option A: Copy files (clean start)
xcopy /E /I E:\git\hyphae-pos apps\pos

# Option B: Move with git history (recommended)
# Do this in a separate terminal:
cd E:\git\hyphae-pos
git filter-repo --to-subdirectory-filter apps/pos
# Then copy the result
```

**Update POS package.json:**

```json
{
  "name": "pos",
  "private": true
}
```

#### Step 7: Move CORE

```bash
# Copy CORE
xcopy /E /I E:\git\hyphae-core apps\core
```

**Update CORE package.json:**

```json
{
  "name": "core",
  "private": true
}
```

#### Step 8: Install Dependencies

```bash
cd E:\git\hyphae-suit
pnpm install
```

#### Step 9: Verify Both Apps Run

```bash
# Terminal 1: POS
pnpm dev:pos
# Should run at http://localhost:3000

# Terminal 2: CORE
pnpm dev:core
# Should run at http://localhost:5173
```

### 4.3 Day 3-5: Create Shared Packages

#### Package 1: `packages/schemas`

**Directory Structure:**

```
packages/schemas/
├── src/
│   ├── menu.ts        # Concept, Category, Product, Modifiers
│   ├── order.ts       # Order, OrderItem, Payment
│   ├── loyalty.ts     # LoyaltyProfile, Transaction
│   ├── inventory.ts   # InventoryItem, Recipe, WasteLog
│   ├── fleet.ts       # DeviceState, MenuRelease
│   ├── finance.ts     # FinancialMetrics, VendorInvoice
│   └── index.ts       # Barrel export
├── package.json
└── tsconfig.json
```

**File: `packages/schemas/package.json`**

```json
{
  "name": "@hyphae/schemas",
  "version": "1.0.0",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0"
  }
}
```

**File: `packages/schemas/src/menu.ts`**

```typescript
import { z } from 'zod';

// Base types (shared between CORE and POS)
export const ConceptSchema = z.object({
  id: z.string(),
  name: z.string(),
  color: z.string(),
  flowType: z.enum(['sequential', 'party_seat', 'ticket_all']),
});
export type Concept = z.infer<typeof ConceptSchema>;

export const CategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  conceptId: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;

export const ModifierOptionSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  inventoryMetadata: z
    .object({
      recipeId: z.string().optional(),
    })
    .optional(),
});
export type ModifierOption = z.infer<typeof ModifierOptionSchema>;

// POS Extension: Modifier Dependency
export const ModifierDependencySchema = z.object({
  groupId: z.string(),
  requiredOptions: z.array(z.string()).optional(),
});
export type ModifierDependency = z.infer<typeof ModifierDependencySchema>;

export const ModifierGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  required: z.boolean(),
  multiSelect: z.boolean(),
  options: z.array(ModifierOptionSchema),
  // POS extension
  dependency: ModifierDependencySchema.optional(),
});
export type ModifierGroup = z.infer<typeof ModifierGroupSchema>;

// Product with extensions for both CORE and POS
export const ProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  categoryId: z.string(),
  requiresMods: z.boolean(),
  stock: z.number().optional(),
  modifierGroups: z.array(ModifierGroupSchema).optional(),
  metadata: z
    .object({
      kitchenLabel: z.string().optional(),
    })
    .optional(),
  active: z.boolean().optional(),
  stationId: z.string().optional(),
  timeMetadata: z
    .object({
      cookTimeSeconds: z.number(),
      activePrepTimeSeconds: z.number(),
    })
    .optional(),
  // CORE extensions (POS ignores)
  logisticsMetadata: z
    .object({
      volumetricScore: z.number(),
      requiresContainer: z.boolean(),
      packagingDims: z.tuple([z.number(), z.number(), z.number()]).optional(),
    })
    .optional(),
  prepBatchSize: z.number().optional(),
  costOfGoods: z.number().optional(),
  recipeText: z.string().optional(),
  // POS extensions (CORE ignores)
  packaging: z
    .object({
      sku: z.string(),
      volumePoints: z.number(),
      isMessy: z.boolean(),
    })
    .optional(),
});
export type Product = z.infer<typeof ProductSchema>;
```

**File: `packages/schemas/src/index.ts`**

```typescript
export * from './menu';
export * from './order';
export * from './loyalty';
export * from './inventory';
export * from './fleet';
export * from './finance';
```

#### Package 2: `packages/database`

**Directory Structure:**

```
packages/database/
├── src/
│   ├── schema.ts      # Drizzle schema
│   ├── client.ts      # Database client factory
│   └── index.ts
├── drizzle/
│   └── migrations/
├── drizzle.config.ts
├── package.json
└── tsconfig.json
```

#### Package 3: `packages/ui`

Extract shared components from POS:

- `Button.tsx` (CVA variants)
- `Modal.tsx`
- `ErrorBoundary.tsx`
- SHASO design tokens

#### Package 4: `packages/config`

Shared configurations:

- `eslint-config/` (base ESLint rules)
- `typescript-config/` (base tsconfig)
- `tailwind-config/` (SHASO palette)
- `.agent/skills/` (unified skills)

### 4.4 Phase 0 Checklist

- [ ] Create `hyphae-suit` root directory
- [ ] Initialize git and Turborepo
- [ ] Move `hyphae-pos` → `apps/pos`
- [ ] Move `hyphae-core` → `apps/core`
- [ ] Run `pnpm install` (should succeed)
- [ ] Verify `pnpm dev:pos` runs POS
- [ ] Verify `pnpm dev:core` runs CORE
- [ ] Create `packages/schemas` with Zod types
- [ ] Update POS imports: `@hyphae/schemas`
- [ ] Update CORE imports: `@hyphae/schemas`
- [ ] Run `pnpm test` (19/19 should pass)
- [ ] Run `pnpm build` (both apps)
- [ ] Create `packages/database` with Drizzle schema
- [ ] Create `packages/ui` with shared components
- [ ] Create `packages/config` with shared configs
- [ ] Unify `.agent/skills/` into config package
- [ ] Update documentation (GEMINI.md, DEV_HANDOFF.md)
- [ ] Commit: "chore: migrate to Turborepo monorepo"
- [ ] Push unpushed POS commit first

---

## 5. Phase 1: CORE API Backend (Week 2-3)

### 5.1 Week 2: API Foundation

#### Install Dependencies

```bash
cd apps/core
pnpm add fastify @fastify/cors @fastify/jwt drizzle-orm @libsql/client zod
pnpm add -D drizzle-kit @types/node
```

#### Create API Structure

```
apps/core/src/
├── api/
│   ├── routes/
│   │   ├── auth.ts       # POST /auth/login, /auth/refresh
│   │   ├── menu.ts       # GET /menu/release
│   │   ├── orders.ts     # POST /orders, GET /orders/:id
│   │   └── loyalty.ts    # GET /loyalty/:cardId, POST /loyalty/earn
│   ├── middleware/
│   │   ├── auth.ts       # JWT verification
│   │   ├── validate.ts   # Zod validation
│   │   └── error.ts      # Error handling
│   └── server.ts         # Fastify app initialization
├── services/
│   ├── MenuService.ts
│   ├── OrderService.ts
│   ├── LoyaltyService.ts
│   └── AuthService.ts
├── db/
│   ├── client.ts         # Uses @hyphae/database
│   └── seed.ts
└── index.ts              # Entry point
```

#### Key Endpoints

| Method | Endpoint           | Description                       |
| ------ | ------------------ | --------------------------------- |
| POST   | `/auth/login`      | Terminal login (terminalId + PIN) |
| POST   | `/auth/refresh`    | Refresh JWT token                 |
| GET    | `/menu/release`    | Get menu snapshot (versioned)     |
| POST   | `/orders`          | Submit order from POS             |
| GET    | `/orders/:id`      | Get order by ID                   |
| GET    | `/loyalty/:cardId` | Get loyalty profile               |
| POST   | `/loyalty/earn`    | Record points earned              |

#### Authentication Flow

```typescript
// apps/core/src/api/routes/auth.ts
import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../../services/AuthService';

const LoginSchema = z.object({
  terminalId: z.string(),
  pin: z.string().length(4),
});

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/login', async (request, reply) => {
    const { terminalId, pin } = LoginSchema.parse(request.body);

    const result = await AuthService.validateCredentials(terminalId, pin);
    if (!result.valid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = app.jwt.sign(
      {
        terminalId,
        storeId: result.storeId,
        staffId: result.staffId,
      },
      { expiresIn: '8h' }
    );

    const refreshToken = app.jwt.sign(
      {
        terminalId,
      },
      { expiresIn: '7d' }
    );

    return { token, refreshToken };
  });
}
```

### 5.2 Week 3: Real-time & WebSocket

#### Install Socket.io

```bash
cd apps/core
pnpm add socket.io
```

#### WebSocket Server

```typescript
// apps/core/src/api/websocket.ts
import { Server } from 'socket.io';
import { FastifyInstance } from 'fastify';

export function initWebSocket(app: FastifyInstance) {
  const io = new Server(app.server, {
    cors: { origin: '*' },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    try {
      const decoded = app.jwt.verify(token);
      socket.data.storeId = decoded.storeId;
      socket.data.terminalId = decoded.terminalId;
      next();
    } catch (error) {
      next(new Error('Unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const { storeId, terminalId } = socket.data;

    // Join store room
    socket.join(`store:${storeId}`);
    socket.join(`terminal:${terminalId}`);

    console.log(`Terminal ${terminalId} connected to store ${storeId}`);

    // Order submitted from POS
    socket.on('order:submit', async (order) => {
      // Broadcast to BOH (kitchen display)
      socket.to(`store:${storeId}`).emit('order:new', order);
    });

    // Order status changed from BOH
    socket.on('order:status', (update) => {
      // Broadcast to all POS terminals in store
      io.to(`store:${storeId}`).emit('order:status', update);
    });

    socket.on('disconnect', () => {
      console.log(`Terminal ${terminalId} disconnected`);
    });
  });

  return io;
}
```

### 5.3 Phase 1 Checklist

- [ ] Install Fastify and dependencies in CORE
- [ ] Create API route structure
- [ ] Implement `/auth/login` with JWT
- [ ] Implement `/menu/release` endpoint
- [ ] Implement `/orders` POST endpoint
- [ ] Implement `/loyalty/:cardId` endpoint
- [ ] Add Zod validation middleware
- [ ] Add error handling middleware
- [ ] Set up Socket.io WebSocket server
- [ ] Implement order:new and order:status events
- [ ] Create database seed script
- [ ] Write API tests (Vitest)
- [ ] Document API in OpenAPI/Swagger
- [ ] Update DEV_HANDOFF.md

---

## 6. Phase 2: POS Integration (Week 4-5)

### 6.1 Week 4: API Client & Auth

#### Create CoreApiClient

```typescript
// apps/pos/src/services/api/CoreApiClient.ts
import { MenuRelease, OrderPayload, LoyaltyProfile } from '@hyphae/schemas';
import { io, Socket } from 'socket.io-client';

class CoreApiClientClass {
  private baseUrl = import.meta.env.VITE_CORE_API_URL || 'http://localhost:3001';
  private token: string | null = null;
  private socket: Socket | null = null;

  async authenticate(terminalId: string, pin: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terminalId, pin }),
      });

      if (!response.ok) return false;

      const { token, refreshToken } = await response.json();
      this.token = token;
      localStorage.setItem('auth_token', token);
      localStorage.setItem('refresh_token', refreshToken);

      this.initWebSocket();
      return true;
    } catch (error) {
      console.error('Auth failed:', error);
      return false;
    }
  }

  async getMenuRelease(conceptIds: string[]): Promise<MenuRelease> {
    return this.request('/menu/release', {
      params: { conceptIds: conceptIds.join(',') },
    });
  }

  async submitOrder(order: OrderPayload): Promise<Order> {
    return this.request('/orders', {
      method: 'POST',
      body: order,
    });
  }

  async getLoyaltyProfile(cardId: string): Promise<LoyaltyProfile | null> {
    try {
      return await this.request(`/loyalty/${cardId}`);
    } catch {
      return null;
    }
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, params } = options;

    let url = `${this.baseUrl}/api/v1${endpoint}`;
    if (params) {
      url += '?' + new URLSearchParams(params).toString();
    }

    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${this.token}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }

  private initWebSocket() {
    this.socket = io(this.baseUrl, {
      auth: { token: this.token },
    });

    this.socket.on('order:status', (update) => {
      // Dispatch to React state
      window.dispatchEvent(new CustomEvent('order:status', { detail: update }));
    });

    this.socket.on('menu:updated', (version) => {
      // Invalidate React Query cache
      window.dispatchEvent(new CustomEvent('menu:updated', { detail: version }));
    });
  }
}

export const CoreApiClient = new CoreApiClientClass();
```

#### Wire to Existing Repositories

```typescript
// apps/pos/src/repositories/MenuRepository.ts
import { CoreApiClient } from '../services/api/CoreApiClient';
import { menuCache } from '../lib/indexedDB';

export class MenuRepository {
  async getProducts(conceptIds: string[]): Promise<Product[]> {
    try {
      // Try API first
      const release = await CoreApiClient.getMenuRelease(conceptIds);
      await menuCache.set('current_release', release);
      return release.products;
    } catch (error) {
      // Fallback to cached data if offline
      const cached = await menuCache.get('current_release');
      if (cached) return cached.products;

      // Last resort: mock data (remove after integration complete)
      console.warn('Using mock data - API unavailable');
      return MOCK_PRODUCTS;
    }
  }
}
```

### 6.2 Week 5: Order Sync & Offline Queue

#### Wire SyncEngine to OrderRepository

```typescript
// apps/pos/src/repositories/OrderRepository.ts
import { SyncEngine } from '../services/SyncEngine';
import { CoreApiClient } from '../services/api/CoreApiClient';

export class OrderRepository {
  private syncEngine = SyncEngine.getInstance();

  async createOrder(order: SavedOrder): Promise<SavedOrder> {
    // 1. Save to IndexedDB (offline-first)
    await this.syncEngine.saveOrder(order);

    // 2. Try immediate sync to CORE
    if (navigator.onLine) {
      try {
        const serverOrder = await CoreApiClient.submitOrder(order);
        await this.syncEngine.markSynced(order.id, serverOrder.id);
        return { ...order, serverId: serverOrder.id, synced: true };
      } catch (error) {
        console.log('Order queued for sync:', order.id);
      }
    }

    return order;
  }

  async getPendingOrders(): Promise<SavedOrder[]> {
    return this.syncEngine.getPendingOrders();
  }
}
```

#### Background Sync Worker

```typescript
// apps/pos/src/services/BackgroundSync.ts
import { SyncEngine } from './SyncEngine';
import { CoreApiClient } from './api/CoreApiClient';

class BackgroundSyncService {
  private intervalId: number | null = null;
  private syncEngine = SyncEngine.getInstance();

  start() {
    // Sync every 30 seconds when online
    this.intervalId = window.setInterval(async () => {
      if (navigator.onLine) {
        await this.syncPendingOrders();
      }
    }, 30000);

    // Also sync on network recovery
    window.addEventListener('online', () => this.syncPendingOrders());
  }

  stop() {
    if (this.intervalId) {
      window.clearInterval(this.intervalId);
    }
  }

  private async syncPendingOrders() {
    const pending = await this.syncEngine.getPendingOrders();

    for (const order of pending) {
      try {
        const serverOrder = await CoreApiClient.submitOrder(order);
        await this.syncEngine.markSynced(order.id, serverOrder.id);
        console.log('Synced order:', order.id, '→', serverOrder.id);
      } catch (error) {
        console.error('Sync failed for order:', order.id);
        // Will retry on next interval
      }
    }
  }
}

export const backgroundSync = new BackgroundSyncService();
```

### 6.3 Phase 2 Checklist

- [ ] Create `CoreApiClient` service
- [ ] Implement JWT auth flow
- [ ] Create login screen UI
- [ ] Wire `MenuRepository` to API
- [ ] Wire `OrderRepository` to API
- [ ] Wire `useLoyalty` hook to API
- [ ] Implement background sync service
- [ ] Add offline detection UI indicator
- [ ] Add sync status UI indicator
- [ ] Test online order flow
- [ ] Test offline → online transition
- [ ] Test network failure scenarios
- [ ] Remove mock data fallbacks (when confident)
- [ ] Update DEV_HANDOFF.md

---

## 7. Phase 3: Payment Integration (Week 6)

### 7.1 Stripe Terminal Setup

#### Install SDK

```bash
cd apps/pos
pnpm add @stripe/terminal-js
```

#### Payment Service

```typescript
// apps/pos/src/services/payment/StripePaymentService.ts
import { loadStripeTerminal, Terminal } from '@stripe/terminal-js';
import { CoreApiClient } from '../api/CoreApiClient';

class StripePaymentServiceClass implements IPaymentService {
  private terminal: Terminal | null = null;

  async initialize(): Promise<void> {
    const stripeTerminal = await loadStripeTerminal();

    this.terminal = stripeTerminal.create({
      onFetchConnectionToken: async () => {
        const { secret } = await CoreApiClient.getConnectionToken();
        return secret;
      },
      onUnexpectedReaderDisconnect: () => {
        console.error('Reader disconnected');
      },
    });

    await this.discoverReaders();
  }

  async discoverReaders(): Promise<Reader[]> {
    const { discoveredReaders } = await this.terminal!.discoverReaders({
      simulated: import.meta.env.DEV,
    });
    return discoveredReaders;
  }

  async connectReader(readerId: string): Promise<void> {
    const { reader } = await this.terminal!.connectReader(readerId);
    console.log('Connected to reader:', reader.id);
  }

  async processCard(amount: number, orderId: string): Promise<PaymentResult> {
    // 1. Create PaymentIntent on server
    const { clientSecret, paymentIntentId } = await CoreApiClient.createPaymentIntent({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'mxn',
      orderId,
    });

    // 2. Collect payment method
    const { paymentIntent, error } = await this.terminal!.collectPaymentMethod(clientSecret);

    if (error) {
      throw new Error(error.message);
    }

    // 3. Process payment
    const { paymentIntent: confirmedIntent } = await this.terminal!.processPayment(paymentIntent!);

    // 4. Confirm on server
    await CoreApiClient.confirmPayment(paymentIntentId);

    return {
      success: true,
      transactionId: confirmedIntent!.id,
      amount: confirmedIntent!.amount / 100,
    };
  }

  async cancelPayment(): Promise<void> {
    await this.terminal?.cancelCollectPaymentMethod();
  }
}

export const StripePaymentService = new StripePaymentServiceClass();
```

### 7.2 Update CheckoutModal

```typescript
// apps/pos/src/components/CheckoutModal.tsx (partial)
const handleCardPayment = async () => {
  setPaymentState('processing');

  try {
    const result = await StripePaymentService.processCard(state.remainingBalance, state.orderId);

    if (result.success) {
      addPaymentRecord({
        method: 'card',
        amount: result.amount,
        transactionId: result.transactionId,
      });

      if (state.remainingBalance <= 0) {
        await completeOrder();
      }
    }
  } catch (error) {
    showError('Payment failed. Please try again.');
    setPaymentState('idle');
  }
};
```

### 7.3 Phase 3 Checklist

- [ ] Install Stripe Terminal SDK
- [ ] Create `StripePaymentService`
- [ ] Add CORE API endpoints for PaymentIntent
- [ ] Update `CheckoutModal` for real payments
- [ ] Test with Stripe test mode
- [ ] Test with simulated reader
- [ ] Implement refund capability
- [ ] Handle payment errors gracefully
- [ ] Add receipt printing (optional)
- [ ] Update DEV_HANDOFF.md

---

## 8. Phase 4: Production Hardening (Week 7-8)

### 8.1 Week 7: Monitoring & Error Tracking

#### Install Sentry

```bash
# Root workspace
pnpm add -w @sentry/react @sentry/node
```

#### Configure POS

```typescript
// apps/pos/src/main.tsx
import * as Sentry from '@sentry/react';

if (import.meta.env.PROD) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    release: `pos@${import.meta.env.VITE_APP_VERSION}`,
    integrations: [
      new Sentry.BrowserTracing({
        tracePropagationTargets: ['localhost', import.meta.env.VITE_CORE_API_URL],
      }),
      new Sentry.Replay(),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

#### Configure CORE API

```typescript
// apps/core/src/index.ts
import * as Sentry from '@sentry/node';

if (process.env.NODE_ENV === 'production') {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: `core@${process.env.APP_VERSION}`,
    tracesSampleRate: 0.2,
  });
}
```

### 8.2 Week 8: CI/CD Pipeline

#### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 9
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Lint
        run: pnpm run lint

      - name: Type check
        run: pnpm run typecheck

      - name: Test
        run: pnpm run test

      - name: Build
        run: pnpm run build

  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build

      # Deploy POS to Vercel
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_POS_PROJECT_ID }}
          working-directory: apps/pos

      # Deploy CORE to Railway
      - uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: core-api-staging

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm run build

      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_POS_PROJECT_ID }}
          vercel-args: '--prod'
          working-directory: apps/pos

      - uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: core-api-production
```

### 8.3 Phase 4 Checklist

- [ ] Install and configure Sentry (POS + CORE)
- [ ] Set up Sentry alert rules
- [ ] Add Core Web Vitals monitoring
- [ ] Create `.github/workflows/ci.yml`
- [ ] Set up Vercel project for POS
- [ ] Set up Railway project for CORE
- [ ] Configure staging environment
- [ ] Configure production environment (manual gate)
- [ ] Add Lighthouse CI
- [ ] Create deployment runbook
- [ ] Test rollback procedure
- [ ] Update DEV_HANDOFF.md

---

## 9. Phase 5: Multi-Tenant & Scaling (Week 9-10)

### 9.1 Week 9: Multi-Store Database Schema

```typescript
// packages/database/src/schema.ts
import { pgTable, uuid, text, timestamp, jsonb, integer } from 'drizzle-orm/pg-core';

export const stores = pgTable('stores', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  timezone: text('timezone').notNull().default('America/Mexico_City'),
  address: text('address'),
  settings: jsonb('settings').$type<StoreSettings>(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const terminals = pgTable('terminals', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id')
    .references(() => stores.id)
    .notNull(),
  name: text('name').notNull(),
  pin: text('pin').notNull(), // Hashed
  status: text('status').$type<'online' | 'offline'>().default('offline'),
  lastHeartbeat: timestamp('last_heartbeat'),
  appVersion: text('app_version'),
});

export const staff = pgTable('staff', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id')
    .references(() => stores.id)
    .notNull(),
  name: text('name').notNull(),
  pin: text('pin').notNull(), // Hashed
  role: text('role').$type<'manager' | 'cashier' | 'kitchen'>().notNull(),
});

export const menuReleases = pgTable('menu_releases', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id')
    .references(() => stores.id)
    .notNull(),
  version: text('version').notNull(),
  publishedAt: timestamp('published_at').notNull(),
  data: jsonb('data').$type<MenuRelease>().notNull(),
});

export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  storeId: uuid('store_id')
    .references(() => stores.id)
    .notNull(),
  terminalId: uuid('terminal_id')
    .references(() => terminals.id)
    .notNull(),
  staffId: uuid('staff_id').references(() => staff.id),
  localId: text('local_id').notNull(), // POS-generated ID
  status: text('status').$type<OrderStatus>().notNull(),
  items: jsonb('items').$type<OrderItem[]>().notNull(),
  subtotal: integer('subtotal').notNull(), // Store as cents
  tax: integer('tax').notNull(),
  total: integer('total').notNull(),
  payments: jsonb('payments').$type<PaymentRecord[]>(),
  createdAt: timestamp('created_at').defaultNow(),
  completedAt: timestamp('completed_at'),
});
```

### 9.2 Week 10: Admin Dashboard

**New app structure:**

```
apps/admin/
├── src/
│   ├── pages/
│   │   ├── dashboard/
│   │   ├── stores/
│   │   │   ├── index.tsx     # Store list
│   │   │   ├── [id].tsx      # Store detail
│   │   │   └── create.tsx    # Create store
│   │   ├── menus/
│   │   │   ├── index.tsx     # Menu editor
│   │   │   └── publish.tsx   # Publish release
│   │   ├── fleet/
│   │   │   └── index.tsx     # Terminal monitoring
│   │   ├── analytics/
│   │   │   └── index.tsx     # Sales reports
│   │   └── users/
│   │       └── index.tsx     # Staff management
│   ├── components/
│   └── App.tsx
└── package.json
```

### 9.3 Phase 5 Checklist

- [ ] Update database schema for multi-tenant
- [ ] Add store-scoped API middleware
- [ ] Create admin dashboard app
- [ ] Implement store management CRUD
- [ ] Implement terminal registration
- [ ] Implement staff management
- [ ] Implement menu editor
- [ ] Implement menu publishing
- [ ] Implement fleet monitoring
- [ ] Add analytics charts
- [ ] Test multi-store scenarios
- [ ] Update DEV_HANDOFF.md

---

## 10. Phase 6: BOH Integration (Week 11-12)

### 10.1 Kitchen Display System

**New app structure:**

```
apps/boh/
├── src/
│   ├── components/
│   │   ├── OrderQueue.tsx      # Order list by station
│   │   ├── OrderCard.tsx       # Single order display
│   │   ├── PrepTimer.tsx       # Count-up timer
│   │   ├── StationSelector.tsx # Station filter
│   │   └── BumpButton.tsx      # Mark as ready
│   ├── hooks/
│   │   └── useOrderQueue.ts    # WebSocket subscription
│   └── App.tsx
└── package.json
```

### 10.2 Real-time Order Flow

```
┌─────────┐    ┌─────────┐    ┌─────────┐
│   POS   │───►│  CORE   │───►│   BOH   │
│         │    │   API   │    │   KDS   │
└─────────┘    └─────────┘    └─────────┘
     │              │              │
     │  POST /order │              │
     │──────────────►              │
     │              │ emit order:new
     │              │──────────────►
     │              │              │ [Chef prepares]
     │              │              │
     │              │◄──────────────│
     │              │ emit order:status
     │◄──────────────│ (status: ready)
     │              │              │
```

### 10.3 Phase 6 Checklist

- [ ] Create BOH app with Vite
- [ ] Implement WebSocket connection
- [ ] Implement order queue UI
- [ ] Implement order card with details
- [ ] Implement prep timers
- [ ] Implement station filtering
- [ ] Implement bump/ready button
- [ ] Add audio notifications
- [ ] Test real-time sync with POS
- [ ] Test multi-station scenarios
- [ ] Final integration testing
- [ ] Update DEV_HANDOFF.md

---

## 11. Technical Specifications

### 11.1 Final Tech Stack

| Layer               | Technology      | Version |
| ------------------- | --------------- | ------- |
| **Monorepo**        | Turborepo       | 2.x     |
| **Package Manager** | pnpm            | 9.x     |
| **Runtime**         | Node.js         | 20.x    |
| **Language**        | TypeScript      | 5.8.x   |
| **Frontend**        | React           | 19.x    |
| **Build Tool**      | Vite            | 6.x     |
| **Styling**         | TailwindCSS     | 3.4.x   |
| **Backend**         | Fastify         | 4.x     |
| **Database**        | PostgreSQL      | 16.x    |
| **ORM**             | Drizzle         | 0.45.x  |
| **Validation**      | Zod             | 3.22.x  |
| **Real-time**       | Socket.io       | 4.x     |
| **Auth**            | JWT             | -       |
| **Payments**        | Stripe Terminal | -       |
| **Monitoring**      | Sentry          | -       |

### 11.2 Infrastructure Costs (Monthly)

| Service              | Plan             | Cost         |
| -------------------- | ---------------- | ------------ |
| Vercel (POS + Admin) | Pro              | $20          |
| Railway (CORE API)   | Hobby            | $5           |
| Neon (PostgreSQL)    | Pro              | $19          |
| Upstash (Redis)      | Pay-as-you-go    | ~$5          |
| Sentry               | Team             | $26          |
| Stripe               | Transaction fees | 2.9% + $0.30 |
| **Total Fixed**      |                  | **~$75/mo**  |

### 11.3 Performance Targets

| Metric                             | Target  |
| ---------------------------------- | ------- |
| **LCP** (Largest Contentful Paint) | < 2.5s  |
| **FID** (First Input Delay)        | < 100ms |
| **CLS** (Cumulative Layout Shift)  | < 0.1   |
| **TTI** (Time to Interactive)      | < 3s    |
| **Bundle Size** (gzipped)          | < 500KB |
| **API Response Time (p95)**        | < 200ms |
| **WebSocket Latency**              | < 100ms |

### 11.4 Security Requirements

| Requirement          | Implementation                            |
| -------------------- | ----------------------------------------- |
| **Authentication**   | JWT with 8h expiry, refresh tokens (7d)   |
| **Password Storage** | bcrypt (12 rounds) for PINs               |
| **Input Validation** | Zod schemas on all endpoints              |
| **SQL Injection**    | Drizzle ORM (no raw SQL)                  |
| **XSS Prevention**   | React auto-escaping, CSP headers          |
| **CORS**             | Whitelist allowed origins                 |
| **Secrets**          | Environment variables only                |
| **Audit Logging**    | All mutations logged with timestamp, user |

---

## 12. Risk Register

| Risk                          | Probability | Impact | Mitigation                                   |
| ----------------------------- | ----------- | ------ | -------------------------------------------- |
| **Schema drift**              | Medium      | High   | Shared `@hyphae/schemas` package, CI checks  |
| **Offline sync conflicts**    | Medium      | Medium | Server-wins strategy, conflict UI            |
| **Payment failures**          | Low         | High   | Retry logic, fallback to cash, Sentry alerts |
| **WebSocket disconnects**     | Medium      | Low    | Auto-reconnect, local queue                  |
| **Database migration issues** | Low         | High   | Drizzle migrations, staging environment      |
| **Build pipeline failures**   | Low         | Medium | Turbo caching, parallelization               |
| **Third-party API outages**   | Low         | Medium | Graceful degradation, caching                |

---

## 13. Appendices

### 13.1 Pre-Migration Checklist

Before starting Phase 0:

- [ ] Push unpushed commit in hyphae-pos (`bcc602f`)
- [ ] Run `pnpm install` in hyphae-core
- [ ] Verify hyphae-pos tests pass (19/19)
- [ ] Verify hyphae-core builds without errors
- [ ] Back up both repositories
- [ ] Review and resolve 4 lint warnings in POS
- [ ] Update GEMINI.md with current date
- [ ] Update DEV_HANDOFF.md with migration plan

### 13.2 Key File Locations

**POS (after migration):**

- Schema: `packages/schemas/src/*`
- Database: `packages/database/src/schema.ts`
- UI Components: `packages/ui/src/*`
- API Client: `apps/pos/src/services/api/CoreApiClient.ts`
- Sync Engine: `apps/pos/src/services/SyncEngine.ts`
- Order Context: `apps/pos/src/context/OrderContext.tsx`

**CORE (after migration):**

- API Routes: `apps/core/src/api/routes/*`
- Services: `apps/core/src/services/*`
- WebSocket: `apps/core/src/api/websocket.ts`

### 13.3 Environment Variables Template

**Root `.env.example`:**

```env
# Shared
NODE_ENV=development

# POS
VITE_CORE_API_URL=http://localhost:3001
VITE_SENTRY_DSN=
VITE_APP_VERSION=0.0.0
VITE_STRIPE_PUBLISHABLE_KEY=

# CORE
DATABASE_URL=postgresql://user:pass@localhost:5432/hyphae
SENTRY_DSN=
JWT_SECRET=change-this-in-production
STRIPE_SECRET_KEY=
GEMINI_API_KEY=
```

### 13.4 Agent Handoff Protocol

When transitioning between AI agents:

1. Update `DEV_HANDOFF.md` in monorepo root
2. List completed tasks with file paths
3. List known issues with specific locations
4. List pending tasks in priority order
5. Provide context files to read first
6. Specify "Do NOT" actions

### 13.5 References

- [Hyphae POS Codebase](e:\git\hyphae-pos)
- [Hyphae Core Codebase](e:\git\hyphae-core)
- [CORE_INTEGRATION.md](e:\git\hyphae-pos\docs\CORE_INTEGRATION.md)
- [DEVELOPMENT_PLAN.md](e:\git\hyphae-pos\docs\DEVELOPMENT_PLAN.md)
- [DESIGN_SHASO.md](e:\git\hyphae-pos\docs\DESIGN_SHASO.md)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Stripe Terminal Documentation](https://stripe.com/docs/terminal)

---

## Document Control

| Version | Date       | Author | Changes          |
| ------- | ---------- | ------ | ---------------- |
| 1.0     | 2026-02-07 | Gemini | Initial creation |

---

_This SOP supersedes all previous integration documents. For questions, refer to the project governance in `AI_CODEX.md`._
