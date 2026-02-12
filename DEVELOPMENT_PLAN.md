# 🚀 HYPHAE-POS Development Plan

**Version:** 1.0  
**Date:** January 16, 2026  
**Status:** Draft for Review

---

## 📋 Table of Contents

1. [Vision & Architecture](#vision--architecture)
2. [Phase 0: Stabilization](#phase-0-stabilization-weeks-1-2)
3. [Phase 1: Core Foundation](#phase-1-core-foundation-weeks-3-4)
4. [Phase 2: Backend Integration](#phase-2-backend-integration-weeks-5-8)
5. [Phase 3: BOH Integration](#phase-3-boh-integration-weeks-9-10)
6. [Phase 4: Production Hardening](#phase-4-production-hardening-weeks-11-12)
7. [Technology Recommendations](#technology-recommendations)
8. [UI/UX Guidelines](#uiux-guidelines)
9. [Performance Strategy](#performance-strategy)
10. [Security Framework](#security-framework)

---

## 🎯 Vision & Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           HYPHAE ECOSYSTEM                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   FRONTENDS (Clients)                                                   │
│                                                                         │
│   CURRENT:                                                              │
│  ┌─────────────┐    ┌─────────────┐                                    │
│  │   HYPHAE    │    │   HYPHAE    │                                    │
│  │     POS     │    │     BOH     │                                    │
│  │  (Tablet)   │    │  (Kitchen)  │                                    │
│  └──────┬──────┘    └──────┬──────┘                                    │
│         │                  │                                            │
│   FUTURE:                  │                                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐                 │
│  │  SHOPPING   │    │     BOH     │    │  CUSTOMER   │                 │
│  │ COMPANION   │    │  COMPANION  │    │   LOYALTY   │                 │
│  │  (Mobile)   │    │  (Mobile)   │    │  (Mobile)   │                 │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘                 │
│         │                  │                  │                         │
│         └──────────────────┼──────────────────┘                        │
│                            │                                            │
│                            ▼                                            │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                      HYPHAE API                               │     │
│  │              (REST + WebSocket Gateway)                       │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                            │                                            │
│                            ▼                                            │
│  ┌───────────────────────────────────────────────────────────────┐     │
│  │                      HYPHAE CORE                              │     │
│  │  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐  │     │
│  │  │ Admin Dashboard │  │   API Server    │  │   Services   │  │     │
│  │  │ (Menu, Fleet,   │  │ (Fastify/Node)  │  │ (Business    │  │     │
│  │  │  Analytics)     │  │                 │  │  Logic)      │  │     │
│  │  └─────────────────┘  └─────────────────┘  └──────────────┘  │     │
│  └───────────────────────────────────────────────────────────────┘     │
│                            │                                            │
│         ┌──────────────────┼──────────────────┐                        │
│         ▼                  ▼                  ▼                        │
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐                   │
│  │ PostgreSQL  │   │   Redis     │   │   S3/CDN    │                   │
│  │ (Primary DB)│   │ (Real-time) │   │  (Assets)   │                   │
│  └─────────────┘   └─────────────┘   └─────────────┘                   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### Client Apps Roadmap

| App                    | Platform             | Purpose                             | Status     |
| ---------------------- | -------------------- | ----------------------------------- | ---------- |
| **HYPHAE POS**         | Tablet (Web)         | Order entry, payments               | ✅ MVP     |
| **HYPHAE BOH**         | Tablet (Web)         | Kitchen display, prep tasks         | 🔜 Next    |
| **Admin Dashboard**    | Desktop (Web)        | Menu mgmt, analytics                | 🔜 Phase 5 |
| **Shopping Companion** | Mobile (iOS/Android) | Inventory purchasing, vendor orders | 📋 Planned |
| **BOH Companion**      | Mobile (iOS/Android) | Prep checklists, inventory counts   | 📋 Planned |
| **Customer Loyalty**   | Mobile (iOS/Android) | Points, rewards, mobile ordering    | 📋 Planned |

### POS App Responsibilities

| Responsibility            | Description                                       |
| ------------------------- | ------------------------------------------------- |
| **Order Entry**           | Menu display, modifier selection, cart management |
| **Payment Processing**    | Cash, card, split payments with Core API          |
| **Loyalty Management**    | Card lookup, points display (data from Core)      |
| **Kitchen Communication** | Order dispatch to BOH via Core API                |
| **Offline Capability**    | Queue orders when network unavailable             |
| **Local Caching**         | Menu, loyalty tiers, config caching               |

### HYPHAE CORE Responsibilities (Backend + Admin)

| Responsibility       | Description                                  |
| -------------------- | -------------------------------------------- |
| **Admin Dashboard**  | Menu management, fleet monitoring, analytics |
| **HYPHAE API**       | REST + WebSocket gateway for all clients     |
| **Data Master**      | Products, categories, modifiers, pricing     |
| **Order Processing** | Order persistence, inventory deduction       |
| **Payment Gateway**  | Stripe/Square integration                    |
| **Loyalty Engine**   | Points calculation, tier management          |
| **Analytics**        | Sales reporting, metrics                     |
| **Multi-Store Sync** | Configuration distribution                   |

### BOH App Responsibilities (External)

| Responsibility       | Description                  |
| -------------------- | ---------------------------- |
| **Prep Management**  | Batch cooking, prep lists    |
| **Order Queue**      | Kitchen display system (KDS) |
| **Inventory Alerts** | Low stock notifications      |
| **Timing Analytics** | Cook time tracking           |

---

## 🔧 Phase 0: Stabilization (Weeks 1-2)

> **Goal:** Fix critical issues, modernize build system, establish development workflow

### Week 1: Build System Modernization

#### Task 0.1: Migrate TailwindCSS from CDN

```bash
# Install Tailwind properly
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Files to modify:**

- [ ] `package.json` - Add Tailwind dependencies
- [ ] `tailwind.config.js` - Create with current inline config from index.html
- [ ] `src/index.css` - Create with Tailwind directives
- [ ] `index.html` - Remove CDN script, add CSS import
- [ ] `vite.config.ts` - Ensure PostCSS processing

#### Task 0.2: Remove CDN Import Maps

- [ ] Delete import map from `index.html`
- [ ] Verify bundled React is used
- [ ] Test HMR still works

#### Task 0.3: Project Restructure

```
hyphae-pos/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── utils/
│   ├── types/
│   ├── services/        # NEW: API clients
│   ├── constants/       # NEW: Config values
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── docs/
├── tests/              # NEW
└── ...config files
```

#### Task 0.4: Environment Configuration

- [ ] Create `.env.example` with all variables
- [ ] Add `.env` to `.gitignore`
- [ ] Document environment setup in README

### Week 2: Quality Infrastructure

#### Task 0.5: Testing Setup

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

- [ ] Configure Vitest in `vite.config.ts`
- [ ] Create `src/test/setup.ts`
- [ ] Write first test for `OrderContext`
- [ ] Add test script to `package.json`

#### Task 0.6: Error Handling

- [ ] Create `ErrorBoundary.tsx` component
- [ ] Wrap app sections with boundaries
- [ ] Add error logging service stub

#### Task 0.7: Linting & Formatting

```bash
npm install -D eslint @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-config-prettier
```

- [ ] Create `.eslintrc.cjs`
- [ ] Create `.prettierrc`
- [ ] Add lint scripts
- [ ] Run initial lint fix

#### Task 0.8: Git Workflow

- [ ] Create `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] Add branch protection rules
- [ ] Document commit conventions

### Phase 0 Deliverables

| Deliverable   | Success Criteria                               |
| ------------- | ---------------------------------------------- |
| Modern Build  | No CDN dependencies, `pnpm run build` succeeds |
| Test Suite    | At least 5 unit tests passing, 70% coverage    |
| Lint Clean    | Zero ESLint errors, pre-commit hooks active    |
| Documentation | Updated README with setup instructions         |
| QA Standards  | `docs/QA_TESTING.md` established and enforced  |

---

## 🏗️ Phase 1: Core Foundation (Weeks 3-4)

> **Goal:** Establish service layer, offline support, and API client architecture

### Week 3: Service Layer Architecture

#### Task 1.1: API Client Foundation

```typescript
// src/services/api/client.ts
interface ApiClientConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

class ApiClient {
  private queue: OfflineQueue;

  async request<T>(endpoint: string, options: RequestOptions): Promise<T>;
  isOnline(): boolean;
  getQueuedRequests(): QueuedRequest[];
}
```

#### Task 1.2: Offline Queue System

```typescript
// src/services/offline/OfflineQueue.ts
interface QueuedRequest {
  id: string;
  endpoint: string;
  method: 'POST' | 'PUT' | 'DELETE';
  payload: unknown;
  timestamp: number;
  retryCount: number;
}

class OfflineQueue {
  add(request: Omit<QueuedRequest, 'id' | 'timestamp'>): void;
  flush(): Promise<FlushResult>;
  getStatus(): QueueStatus;
}
```

#### Task 1.3: Service Interfaces

```typescript
// src/services/menu/MenuService.ts
interface IMenuService {
  getConcepts(): Promise<Concept[]>;
  getCategories(conceptId: string): Promise<Category[]>;
  getProducts(categoryId: string): Promise<Product[]>;
  syncMenu(): Promise<SyncResult>;
}

// src/services/order/OrderService.ts
interface IOrderService {
  createOrder(order: OrderPayload): Promise<Order>;
  updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
  getActiveOrders(): Promise<Order[]>;
}

// src/services/loyalty/LoyaltyService.ts
interface ILoyaltyService {
  lookupCard(cardNumber: string): Promise<LoyaltyProfile | null>;
  earnPoints(customerId: string, orderId: string, amount: number): Promise<void>;
  redeemPoints(customerId: string, points: number): Promise<void>;
}
```

### Week 4: State Management Refactor

#### Task 1.4: Split Order Context

```
OrderContext (current monolith) →
├── CartContext (items, modifiers)
├── CheckoutContext (payment state)
├── ActiveOrdersContext (kitchen queue)
└── LoyaltyContext (active profile)
```

#### Task 1.5: Implement React Query

```bash
npm install @tanstack/react-query
```

- [ ] Configure QueryClient with offline support
- [ ] Migrate `useMenuData` to React Query
- [ ] Add query devtools for development

#### Task 1.6: IndexedDB for Local Storage

```bash
npm install idb
```

- [ ] Create database schema
- [ ] Migrate from localStorage
- [ ] Implement sync status tracking

### Phase 1 Deliverables

| Deliverable   | Success Criteria                                |
| ------------- | ----------------------------------------------- |
| Service Layer | All services implement interfaces               |
| Offline Queue | Orders queue when offline, sync when online     |
| State Split   | Contexts separated, no functionality regression |
| Local DB      | IndexedDB storing orders and cached menu        |

---

## 🔌 Phase 2: Backend Integration (Weeks 5-8)

> **Goal:** Connect to Core API, implement real data flow, payment processing

### Week 5-6: Core API Integration

#### Task 2.1: Authentication Flow

```typescript
// src/services/auth/AuthService.ts
interface IAuthService {
  loginWithPin(terminalId: string, pin: string): Promise<AuthResult>;
  refreshToken(): Promise<void>;
  logout(): Promise<void>;
  getCurrentStaff(): StaffProfile | null;
}
```

- [ ] Implement JWT token storage (secure)
- [ ] Add auth interceptor to API client
- [ ] Create Protected Route wrapper

#### Task 2.2: Menu Sync Protocol

```typescript
// Sync flow:
// 1. Check last sync timestamp
// 2. Request delta from Core API
// 3. Apply changes to IndexedDB
// 4. Update UI via React Query cache

interface MenuSyncPayload {
  lastSyncTimestamp: number;
  conceptIds: string[]; // Only sync assigned concepts
}

interface MenuSyncResponse {
  timestamp: number;
  changes: {
    concepts: { added: Concept[]; modified: Concept[]; deleted: string[] };
    categories: { added: Category[]; modified: Category[]; deleted: string[] };
    products: { added: Product[]; modified: Product[]; deleted: string[] };
  };
}
```

#### Task 2.3: Order Submission

```typescript
interface OrderSubmitPayload {
  terminalId: string;
  staffId: string;
  items: OrderItemPayload[];
  subtotal: number;
  tax: number;
  total: number;
  payments: PaymentRecord[];
  loyaltyCardId?: string;
  orderType: OrderType;
  metadata: {
    createdAt: number;
    localOrderId: string; // For offline reconciliation
  };
}
```

### Week 7-8: Payment Integration

#### Task 2.4: Payment Gateway Abstraction

```typescript
// src/services/payment/PaymentService.ts
interface IPaymentService {
  processCard(amount: number, terminalId: string): Promise<CardPaymentResult>;
  refund(transactionId: string, amount: number): Promise<RefundResult>;
  getTerminalStatus(): Promise<TerminalStatus>;
}

// Implementation options:
// - Stripe Terminal SDK
// - Square Terminal API
// - Custom hardware integration
```

#### Task 2.5: Cash Drawer Integration

```typescript
interface ICashDrawerService {
  open(): Promise<void>;
  getStatus(): Promise<DrawerStatus>;
  recordCashMovement(type: 'IN' | 'OUT', amount: number, reason: string): Promise<void>;
}
```

#### Task 2.6: Receipt Printing

```typescript
interface IReceiptService {
  printReceipt(order: Order, options: PrintOptions): Promise<void>;
  printKitchenTicket(order: Order): Promise<void>;
  getAvailablePrinters(): Promise<Printer[]>;
}
```

### Phase 2 Deliverables

| Deliverable | Success Criteria                               |
| ----------- | ---------------------------------------------- |
| Auth Flow   | Staff can log in, sessions persist             |
| Menu Sync   | Menu updates from Core API, delta sync works   |
| Order Flow  | Orders submit to Core API, offline queue works |
| Payments    | Card payments process (sandbox mode)           |

### 🛡️ Phase 2 Security Gate

- [ ] **Audit**: `pnpm audit` passes with 0 critical/high issues.
- [ ] **Validation**: All new API endpoints have Zod schemas.
- [ ] **Auth**: Login requires robust authentication (no hardcoded pins).

---

## 🍳 Phase 3: BOH Integration (Weeks 9-10)

> **Goal:** Real-time kitchen communication, order status sync

### Week 9: Real-Time Channel

#### Task 3.1: WebSocket Connection

```typescript
// src/services/realtime/RealtimeService.ts
interface IRealtimeService {
  connect(): Promise<void>;
  disconnect(): void;
  subscribe(channel: string, handler: MessageHandler): Unsubscribe;
  publish(channel: string, message: unknown): void;
}

// Channels:
// - `store:{storeId}:orders` - Order status updates
// - `store:{storeId}:alerts` - Inventory alerts
// - `terminal:{terminalId}:config` - Config pushes
```

#### Task 3.2: Order Status Sync

```typescript
// When BOH marks order "Ready":
// 1. WebSocket message received
// 2. Update local order state
// 3. Trigger UI notification (sound + visual)
// 4. Update customer display (if connected)

interface OrderStatusUpdate {
  orderId: string;
  status: OrderStatus;
  updatedBy: string;
  timestamp: number;
  metadata?: {
    readyTime?: number;
    station?: string;
  };
}
```

### Week 10: Kitchen Display Features

#### Task 3.3: Enhanced Order Rail

- [ ] Add real-time status indicators
- [ ] Show BOH-assigned prep times
- [ ] Display station assignments
- [ ] Add bump notification sounds

#### Task 3.4: Conflict Resolution

```typescript
// Handle concurrent edits:
// 1. POS edits order (adds item)
// 2. BOH marks order "Cooking"
// 3. Conflict: order modified during production

interface OrderConflictResolution {
  strategy: 'POS_WINS' | 'BOH_WINS' | 'MERGE' | 'PROMPT';
  onConflict: (local: Order, remote: Order) => Order;
}
```

### Phase 3 Deliverables

| Deliverable       | Success Criteria                       |
| ----------------- | -------------------------------------- |
| WebSocket         | Stable connection with auto-reconnect  |
| Status Sync       | Order status updates in <500ms         |
| Notifications     | Audio + visual alerts for ready orders |
| Conflict Handling | No data loss on concurrent edits       |

### 🛡️ Phase 3 Security Gate

- [ ] **WebSocket**: Auth tokens verified on connection.
- [ ] **Rate Limiting**: WS connections limited per IP.
- [ ] **Sanitization**: Chat/Order notes sanitized against XSS.

---

## 🔒 Phase 4: Production Hardening (Weeks 11-12)

> **Goal:** Security audit, performance optimization, deployment readiness

### Week 11: Security Hardening

See [Security Framework](#security-framework) section for detailed requirements.

#### Task 4.1: Authentication Security

- [ ] Implement secure PIN hashing
- [ ] Add session timeout (configurable)
- [ ] Implement device binding (optional)

#### Task 4.2: Input Validation

- [ ] Add Zod schemas for all API payloads
- [ ] Sanitize text inputs
- [ ] Rate limit API requests

#### Task 4.3: Audit Logging

```typescript
interface AuditLog {
  timestamp: number;
  terminalId: string;
  staffId: string;
  action: AuditAction;
  resourceType: string;
  resourceId: string;
  oldValue?: unknown;
  newValue?: unknown;
  ipAddress: string;
}
```

### Week 12: Performance & Deployment

#### Task 4.4: Performance Optimization

- [ ] Implement virtualized lists for large menus
- [ ] Add service worker for offline
- [ ] Optimize bundle size (<500KB gzipped)
- [ ] Add Lighthouse CI checks

#### Task 4.5: Deployment Pipeline

```yaml
# .github/workflows/deploy.yml
jobs:
  test:
    - Lint check
    - Type check
    - Unit tests
    - E2E tests (Playwright)

  build:
    - Production build
    - Bundle analysis
    - Lighthouse audit

  deploy:
    - Deploy to staging
    - Smoke tests
    - Deploy to production (manual gate)
```

#### Task 4.6: Monitoring Setup

- [ ] Error tracking (Sentry)
- [ ] Performance monitoring (Core Web Vitals)
- [ ] Usage analytics (privacy-respecting)

### Phase 4 Deliverables

| Deliverable    | Success Criteria                      |
| -------------- | ------------------------------------- |
| Security Audit | No critical/high vulnerabilities      |
| Performance    | Lighthouse score >90                  |
| Deployment     | CI/CD pipeline functional             |
| Monitoring     | Error and performance tracking active |

---

## 💻 Technology Recommendations

### Recommended Stack Upgrades

| Category             | Current              | Recommended           | Rationale                                       |
| -------------------- | -------------------- | --------------------- | ----------------------------------------------- |
| **State Management** | Context + useReducer | Zustand + React Query | Better dev tools, simpler API, built-in offline |
| **Styling**          | Tailwind CDN         | Tailwind Build + CVA  | Tree-shaking, type-safe variants                |
| **Data Fetching**    | Custom hook          | TanStack Query        | Caching, background sync, devtools              |
| **Forms**            | Uncontrolled         | React Hook Form + Zod | Validation, performance                         |
| **Local Storage**    | localStorage         | IndexedDB (idb)       | More capacity, structured data                  |
| **Real-time**        | N/A                  | Socket.io or Ably     | Reliable WebSocket with fallbacks               |
| **Testing**          | None                 | Vitest + Playwright   | Fast unit tests, E2E coverage                   |

### Package Recommendations

```json
{
  "dependencies": {
    // Core
    "react": "^19.2.0",
    "react-dom": "^19.2.0",

    // State & Data
    "zustand": "^5.0.0",
    "@tanstack/react-query": "^5.0.0",
    "idb": "^8.0.0",

    // Forms & Validation
    "react-hook-form": "^7.50.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",

    // UI
    "lucide-react": "^0.555.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "@radix-ui/react-dialog": "^1.0.0",

    // Real-time
    "socket.io-client": "^4.7.0",

    // Utilities
    "date-fns": "^3.3.0",
    "decimal.js": "^10.4.0"
  },
  "devDependencies": {
    // Build
    "vite": "^6.2.0",
    "@vitejs/plugin-react": "^5.0.0",
    "tailwindcss": "^3.4.0",

    // Testing
    "vitest": "^2.0.0",
    "@testing-library/react": "^15.0.0",
    "@playwright/test": "^1.42.0",

    // Quality
    "typescript": "^5.8.0",
    "eslint": "^9.0.0",
    "prettier": "^3.2.0"
  }
}
```

---

## 🎨 UI/UX Guidelines

### Design System Tokens

```css
/* src/styles/tokens.css */

:root {
  /* Colors - Semantic */
  --color-background: var(--zinc-950);
  --color-surface: var(--zinc-900);
  --color-surface-elevated: var(--zinc-800);
  --color-border: var(--zinc-800);
  --color-text-primary: var(--zinc-100);
  --color-text-secondary: var(--zinc-400);
  --color-accent: var(--lime-500);
  --color-accent-hover: var(--lime-400);

  /* Status Colors */
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-error: #ef4444;
  --color-info: #3b82f6;

  /* Spacing Scale */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-6: 1.5rem;
  --space-8: 2rem;

  /* Typography */
  --font-sans: 'Inter', system-ui, sans-serif;
  --font-mono: 'Space Mono', monospace;

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-normal: 300ms ease;
  --transition-slow: 500ms ease;

  /* Z-Index Scale */
  --z-base: 0;
  --z-dropdown: 10;
  --z-modal-backdrop: 50;
  --z-modal: 60;
  --z-toast: 70;
  --z-screensaver: 100;
}
```

### Component Patterns

#### Button Variants (using CVA)

```typescript
// src/components/ui/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2',
  {
    variants: {
      variant: {
        primary: 'bg-lime-500 text-zinc-950 hover:bg-lime-400',
        secondary: 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700',
        ghost: 'hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100',
        danger: 'bg-red-600 text-white hover:bg-red-500',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-14 px-6 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

### Touch Target Guidelines

| Element               | Minimum Size | Recommended |
| --------------------- | ------------ | ----------- |
| **Primary Actions**   | 44×44px      | 48×48px     |
| **Secondary Actions** | 36×36px      | 40×40px     |
| **List Items**        | 48px height  | 56px height |
| **Input Fields**      | 44px height  | 48px height |

### Accessibility Requirements

- [ ] All interactive elements focusable via keyboard
- [ ] Focus indicators visible (2px lime outline)
- [ ] Color contrast ratio ≥4.5:1
- [ ] ARIA labels on icon-only buttons
- [ ] Screen reader announcements for dynamic content
- [ ] Reduced motion support (`prefers-reduced-motion`)

### Responsive Breakpoints

```css
/* Mobile-first breakpoints */
--breakpoint-sm: 640px; /* Large phones */
--breakpoint-md: 768px; /* Tablets portrait */
--breakpoint-lg: 1024px; /* Tablets landscape, small laptops */
--breakpoint-xl: 1280px; /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

---

## ⚡ Performance Strategy

### Bundle Optimization

| Target           | Metric         | Strategy                      |
| ---------------- | -------------- | ----------------------------- |
| **Initial Load** | <2s on 4G      | Code splitting, lazy routes   |
| **Bundle Size**  | <500KB gzipped | Tree-shaking, dynamic imports |
| **TTI**          | <3s            | Defer non-critical JS         |
| **INP**          | <200ms         | Optimize event handlers       |

### Code Splitting Strategy

```typescript
// src/App.tsx
const SettingsScreen = lazy(() => import('./components/SettingsScreen'));
const HistoryModal = lazy(() => import('./components/HistoryModal'));
const LoyaltyScreen = lazy(() => import('./components/LoyaltyScreen'));
const CheckoutModal = lazy(() => import('./components/CheckoutModal'));

// Usage with Suspense
<Suspense fallback={<ModalSkeleton />}>
  {showSettings && <SettingsScreen />}
</Suspense>
```

### Rendering Optimization

```typescript
// 1. Memoize expensive computations
const kitchenSummary = useMemo(
  () => calculateSpecificSummary(activeOrders),
  [activeOrders]
);

// 2. Use React.memo for pure components
const ProductCard = React.memo(({ product, onSelect }) => { ... });

// 3. Virtualize long lists
import { useVirtualizer } from '@tanstack/react-virtual';

function ProductGrid({ products }) {
  const virtualizer = useVirtualizer({
    count: products.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 120,
  });
  // ...
}
```

### Caching Strategy

| Data Type            | Cache Duration | Invalidation             |
| -------------------- | -------------- | ------------------------ |
| **Menu (products)**  | 1 hour         | On sync, on admin update |
| **Active Orders**    | Real-time      | WebSocket updates        |
| **Completed Orders** | 5 minutes      | On new completion        |
| **Loyalty Profiles** | 30 seconds     | On transaction           |
| **Config**           | Until logout   | On push notification     |

### Offline Capability

```typescript
// Service Worker Strategy
// 1. App Shell: Cache First
// 2. API Data: Network First, Cache Fallback
// 3. Images: Cache First, Lazy Update

// src/service-worker.ts
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { NetworkFirst, CacheFirst } from 'workbox-strategies';

// Cache app shell
precacheAndRoute(self.__WB_MANIFEST);

// API requests: network-first
registerRoute(
  ({ url }) => url.pathname.startsWith('/api'),
  new NetworkFirst({ cacheName: 'api-cache' })
);
```

---

## 🔐 Security Framework

### Authentication & Authorization

#### Staff Authentication

```typescript
// Security Requirements:
// 1. PIN must be 4-6 digits
// 2. PIN hashed with bcrypt (cost factor 12)
// 3. Max 3 failed attempts, then lockout
// 4. Session timeout after 30 mins inactivity
// 5. Device binding (optional for high-security)

interface AuthConfig {
  pinMinLength: 4;
  pinMaxLength: 6;
  maxFailedAttempts: 3;
  lockoutDurationMinutes: 15;
  sessionTimeoutMinutes: 30;
  requireDeviceBinding: boolean;
}
```

#### Role-Based Access Control

```typescript
enum Permission {
  // Orders
  ORDER_CREATE = 'order:create',
  ORDER_EDIT = 'order:edit',
  ORDER_VOID = 'order:void',
  ORDER_REFUND = 'order:refund',

  // Payments
  PAYMENT_CASH = 'payment:cash',
  PAYMENT_CARD = 'payment:card',
  PAYMENT_DISCOUNT = 'payment:discount',

  // Admin
  SETTINGS_VIEW = 'settings:view',
  SETTINGS_EDIT = 'settings:edit',
  REPORTS_VIEW = 'reports:view',
  STAFF_MANAGE = 'staff:manage',
}

const ROLE_PERMISSIONS: Record<StaffRole, Permission[]> = {
  Cashier: [
    Permission.ORDER_CREATE,
    Permission.ORDER_EDIT,
    Permission.PAYMENT_CASH,
    Permission.PAYMENT_CARD,
  ],
  Kitchen: [
    // Read-only order access via BOH app
  ],
  Manager: [
    // All permissions
    ...Object.values(Permission),
  ],
};
```

### Data Protection

#### Sensitive Data Handling

```typescript
// Data Classification:
// 🔴 HIGH: Payment card data (never stored locally)
// 🟠 MEDIUM: Staff PINs (hashed), customer phone numbers
// 🟡 LOW: Order history, menu data

// Encryption at rest for medium sensitivity:
import { encrypt, decrypt } from './services/crypto';

const encryptedPin = await encrypt(pin, getDeviceKey());
```

#### PCI Compliance Notes

```
Since we're NOT storing card data (using terminal SDK):
- Full PCI DSS not required
- SAQ A-EP may apply
- Use PCI-certified payment terminals
- Never log card numbers (even masked)
```

### Input Validation

```typescript
// src/schemas/order.schema.ts
import { z } from 'zod';

export const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  modifiers: z.array(
    z.object({
      groupId: z.string(),
      optionId: z.string(),
      variation: z.enum(['Normal', 'No', 'Side', 'Extra']),
    })
  ),
  notes: z.string().max(200).optional(),
});

export const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1),
  orderType: z.enum(['DineIn', 'Takeout', 'Delivery']),
  loyaltyCardId: z.string().optional(),
});
```

### API Security

```typescript
// Request signing for mutation endpoints
interface SignedRequest {
  payload: string; // JSON stringified
  timestamp: number;
  signature: string; // HMAC-SHA256(payload + timestamp, secret)
  terminalId: string;
}

// Rate limiting
const rateLimits = {
  'POST /orders': { window: '1m', max: 30 },
  'POST /auth/login': { window: '5m', max: 5 },
  'GET /menu': { window: '1m', max: 60 },
};
```

### Audit Trail

```typescript
// All sensitive actions logged:
// - Staff login/logout
// - Order void/refund
// - Payment processing
// - Settings changes
// - Discount application

interface AuditEntry {
  id: string;
  timestamp: number;
  terminalId: string;
  staffId: string;
  action: string;
  resourceType: 'order' | 'payment' | 'settings' | 'auth';
  resourceId: string;
  metadata: Record<string, unknown>;
  // Stored locally, synced to Core API
}
```

---

## 📊 Success Metrics

### Phase Completion Criteria

| Phase       | Duration | Key Metrics                                 |
| ----------- | -------- | ------------------------------------------- |
| **Phase 0** | 2 weeks  | Build passes, 5+ tests, lint clean          |
| **Phase 1** | 2 weeks  | Service layer complete, offline queue works |
| **Phase 2** | 4 weeks  | Orders sync to Core API, payments process   |
| **Phase 3** | 2 weeks  | WebSocket stable, status updates <500ms     |
| **Phase 4** | 2 weeks  | Lighthouse >90, no critical security issues |

### Production Readiness Checklist

- [ ] All tests passing (>80% coverage)
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed
- [ ] Documentation complete
- [ ] Deployment pipeline functional
- [ ] Monitoring configured
- [ ] Rollback procedure tested
- [ ] Staff training materials ready

---

## 📅 Timeline Summary

```
Week 1-2:   Phase 0 - Stabilization
Week 3-4:   Phase 1 - Core Foundation
Week 5-8:   Phase 2 - Backend Integration
Week 9-10:  Phase 3 - BOH Integration
Week 11-12: Phase 4 - Production Hardening
─────────────────────────────────────────
Total:      12 weeks to production-ready MVP
```

---

_Document Version: 1.0_  
_Last Updated: January 16, 2026_  
_Next Review: After Phase 0 completion_
