# POS Integration Architecture

## Overview

This document defines the integration contract between **Hyphae Core** (this repository) and **Hyphae POS** ([geckogtmx/hyphae-pos](https://github.com/geckogtmx/hyphae-pos)).

**Core** is the **strategic brain** — it manages menu configurations, recipes, inventory, analytics, and fleet monitoring.  
**POS** is the **operational hands** — it handles order entry, payments, loyalty, and kitchen communication at the point of sale.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      HYPHAE ECOSYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │ HYPHAE-CORE │    │  CORE API   │    │  HYPHAE-POS │         │
│  │ (This Repo) │◄──►│  (Future)   │◄──►│  (Tablet)   │         │
│  │             │    │             │    │             │         │
│  │ • Menu Mgmt │    │ • REST API  │    │ • Order UI  │         │
│  │ • Analytics │    │ • WebSocket │    │ • Payments  │         │
│  │ • Fleet Mon │    │ • Auth      │    │ • Kitchen   │         │
│  │ • Recipes   │    │ • Sync      │    │ • Loyalty   │         │
│  └─────────────┘    └──────┬──────┘    └─────────────┘         │
│                            │                                    │
│                     ┌──────┴──────┐                            │
│                     │   Database  │                            │
│                     │ (SQLite/PG) │                            │
│                     └─────────────┘                            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Data Flow

### 1. Menu Distribution (Core → POS)

**Core Publishes** → **POS Consumes**

Core creates immutable `MenuRelease` snapshots that POS downloads and caches locally.

#### MenuRelease Schema (Core)
```typescript
export interface MenuRelease {
  version: string;           // e.g., "v1.2.3"
  publishedAt: ISODate;
  hash: string;              // SHA-256 for integrity
  concepts: Concept[];
  categories: Category[];
  products: Product[];
  recipes: Recipe[];         // BOH integration data
}
```

#### POS Consumption Pattern
- POS checks for new `MenuRelease` versions on startup
- Downloads and caches menu data in IndexedDB
- Operates 100% offline with cached menu
- Syncs menu updates during idle periods

**Critical Contract**: Core's `types/schema.ts` **MUST** remain backwards compatible with POS's `src/types.ts`.

---

### 2. Transaction Data (POS → Core)

**POS Submits** → **Core Analyzes**

POS sends completed orders to Core for analytics, inventory deduction, and reporting.

#### TransactionRecord Schema (Core)
```typescript
export interface TransactionRecord {
  id: UUID;
  posId: string;             // Device identifier
  timestamp: ISODate;
  items: TransactionItem[];
  total: number;
  paymentMethod: 'card' | 'cash' | 'qr';
  status: 'completed' | 'voided' | 'refunded';
}
```

#### POS SavedOrder Schema
```typescript
export interface SavedOrder {
  id: string;
  systemInfo?: SystemInfo;   // storeId, terminalId, staffId
  createdAt: number;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: OrderStatus;       // 'Pending' | 'Kitchen' | 'Ready' | 'Completed'
  paymentStatus: PaymentStatus;
  orderType: OrderType;      // 'DineIn' | 'Takeout' | 'Delivery'
}
```

**Sync Strategy**:
- POS queues transactions locally when offline
- Uploads to Core API when connection restored
- Core deduplicates by transaction ID

---

### 3. Fleet Monitoring (POS → Core)

**POS Heartbeats** → **Core Monitors**

POS devices send periodic health updates to Core for fleet management.

#### DeviceState Schema (Core)
```typescript
export interface DeviceState {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'syncing';
  lastHeartbeat: ISODate;
  batteryLevel: number;
  appVersion: string;
  currentMenuVersion: string;
  pendingUploads: number;    // Queued transactions
}
```

**Heartbeat Protocol**:
- POS sends heartbeat every 60 seconds
- Core marks device offline if no heartbeat for 5 minutes
- Core dashboard displays fleet health in real-time

---

### 4. Loyalty Integration (Bidirectional)

**Core Manages** ↔ **POS Displays**

Core is the source of truth for loyalty data; POS provides the UI.

#### Core Responsibilities
- Loyalty tier definitions (`LoyaltyTier`)
- Points calculation and tier upgrades
- Transaction history persistence
- Card issuance and management

#### POS Responsibilities
- Card lookup by code/phone
- Real-time points display
- Tier upgrade celebrations (UI)
- Perk application (e.g., free items)

**Data Contract**: POS caches `LoyaltyTier[]` from Core but queries live loyalty profiles via API.

---

## Schema Alignment

### Shared Types (Must Match)

Both repositories define these types — **they must remain synchronized**:

| Type | Core Location | POS Location | Notes |
|------|---------------|--------------|-------|
| `Concept` | `types/schema.ts` | `src/types.ts` | Multi-brand support |
| `Category` | `types/schema.ts` | `src/types.ts` | Menu hierarchy |
| `Product` | `types/schema.ts` | `src/types.ts` | Menu items |
| `ModifierGroup` | `types/schema.ts` | `src/types.ts` | Recursive modifiers |
| `ModifierOption` | `types/schema.ts` | `src/types.ts` | Modifier choices |
| `Recipe` | `types/schema.ts` | `src/types.ts` | BOH integration |
| `InventoryItem` | `types/schema.ts` | `src/types.ts` | Stock tracking |

### POS-Specific Extensions

POS extends Core schemas with UI-specific fields:

```typescript
// POS adds UI state to OrderItem
export interface OrderItem extends Product {
  uniqueId: string;              // Client-side ID
  selectedModifiers: SelectedModifier[];
  notes?: string;
  finalPrice: number;
  originalPrice?: number;
  isDiscounted?: boolean;
}
```

### Core-Specific Extensions

Core adds agent metadata not needed by POS:

```typescript
// Core adds AI agent fields to Product
export interface Product {
  // ... base fields ...
  
  // Logistics Agent (PLS)
  logisticsMetadata?: {
    volumetricScore: number;
    requiresContainer: boolean;
    packagingDims?: [number, number, number];
  };
  
  // Forecaster Agent (Plan)
  prepBatchSize?: number;
  
  // Menu Engineer Agent (Profit)
  costOfGoods?: number;
  
  // Trainer Agent (SOP)
  recipeText?: string;
}
```

**Rule**: POS ignores unknown fields; Core never removes base fields.

---

## Integration Phases

### Phase 0: Current State (Offline Prototypes)
- ✅ Core: Proto-dashboard with mock data
- ✅ POS: Fully functional UI with mock data
- ❌ No API layer
- ❌ No real-time sync

### Phase 1: Core Backend Setup (Weeks 1-4)
- [ ] Core: Drizzle ORM + SQLite setup
- [ ] Core: Zustand stores for state management
- [ ] Core: Menu release export utility (JSON)
- [ ] POS: Menu import from JSON file (manual)

### Phase 2: API Integration (Weeks 5-8)
- [ ] Core API: REST endpoints for menu, transactions, loyalty
- [ ] POS: API client with offline queue
- [ ] Core API: WebSocket for real-time updates
- [ ] POS: Live order status sync

### Phase 3: Production Hardening (Weeks 9-12)
- [ ] Core: Multi-tenant support (storeId isolation)
- [ ] POS: Encrypted local storage
- [ ] Both: End-to-end testing
- [ ] Both: Performance optimization

---

## API Contract (Future)

### Core API Endpoints (Planned)

#### Menu Management
```
GET  /api/v1/menu/releases          # List all releases
GET  /api/v1/menu/releases/:version # Download specific release
POST /api/v1/menu/releases          # Publish new release (Core only)
```

#### Transactions
```
POST /api/v1/transactions           # Submit completed order
GET  /api/v1/transactions           # Query transactions (Core only)
```

#### Fleet Monitoring
```
POST /api/v1/devices/heartbeat      # POS heartbeat
GET  /api/v1/devices                # List all devices (Core only)
```

#### Loyalty
```
GET  /api/v1/loyalty/profile/:cardNumber  # Lookup loyalty profile
POST /api/v1/loyalty/transaction          # Record loyalty event
GET  /api/v1/loyalty/tiers                # Get tier definitions
```

### Authentication
- **Core Dashboard**: OAuth2 (Google/Email)
- **POS Devices**: Device token + staff PIN
- **API**: JWT with role-based access control (RBAC)

---

## Offline-First Strategy

Both Core and POS follow the **Offline-First** principle:

### Core (Dashboard)
- Operates on local SQLite database
- Syncs to cloud (optional) for multi-location setups
- Can manage menu/inventory without internet

### POS (Tablet)
- Caches menu in IndexedDB
- Queues transactions in local storage
- Displays "Offline Mode" indicator
- Auto-syncs when connection restored

**Golden Rule**: Internet is an **accelerator**, not a **requirement**.

---

## Testing Strategy

### Schema Compatibility Tests
```bash
# Run in both repos
npm run test:schema-compat
```

Validates that shared types match between Core and POS.

### Integration Tests
```bash
# Core: Test menu export
npm run test:menu-export

# POS: Test menu import
npm run test:menu-import
```

### End-to-End Flow
1. Core: Create product with modifiers
2. Core: Publish menu release
3. POS: Import menu release
4. POS: Create order with modifiers
5. POS: Submit transaction
6. Core: Verify transaction received
7. Core: Verify inventory deducted

---

## Migration Strategy

### Breaking Changes Protocol
If Core needs to make breaking changes to `types/schema.ts`:

1. **Version the schema**: Add `schemaVersion` field to `MenuRelease`
2. **Dual support**: Core supports both old and new schemas for 2 releases
3. **Deprecation notice**: Update POS documentation 1 month in advance
4. **Migration guide**: Provide step-by-step upgrade instructions

### Example: Adding Required Field
```typescript
// BAD: Breaks existing POS
export interface Product {
  id: string;
  name: string;
  newRequiredField: string; // ❌ POS will crash
}

// GOOD: Optional with default
export interface Product {
  id: string;
  name: string;
  newField?: string; // ✅ POS ignores, Core provides default
}
```

---

## Current Status

### Core (hyphae-core)
- **Phase**: Initialization
- **Next Step**: Drizzle + Zustand setup
- **Blockers**: None

### POS (hyphae-pos)
- **Phase**: Prototype/MVP
- **Status**: Fully functional UI, no backend
- **Next Step**: Phase 0 stabilization (build system, linting)
- **Blockers**: Waiting for Core API

---

## Contact & Governance

- **Core Repo**: [geckogtmx/hyphae-core](https://github.com/geckogtmx/hyphae-core)
- **POS Repo**: [geckogtmx/hyphae-pos](https://github.com/geckogtmx/hyphae-pos)
- **Schema Changes**: Require approval from both teams
- **Breaking Changes**: 1-month deprecation notice required

---

*Last Updated: 2026-01-16*  
*Maintained by: Hyphae Architect*
