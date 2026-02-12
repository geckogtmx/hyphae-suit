# Hyphae BOH Integration Notes

> **Status**: Phase 0 - Planning & AI Prompt Definition  
> **Last Updated**: 2026-02-07  
> **BOH Repo**: Future: `geckogtmx/hyphae-boh` (not yet created)  
> **AI Prompt**: `docs/BOH_AI_PROMPT.md`

---

## 🎯 Purpose

This document tracks the integration contract between **Hyphae BOH** (BatchPrep Manager - prep kitchen management) and **Hyphae POS** (point of sale). It defines how these systems will share data and work together.

---

## 📊 Current State

### Phase 0: Design & Specification (Current)

- **BOH**: Not implemented - AI prompt defined in `docs/BOH_AI_PROMPT.md`
- **POS**: Tablet UI with KDS column for live order tracking
- **Integration**: None (BOH repo doesn't exist yet)
- **Schema**: Prep types defined in `BOH_AI_PROMPT.md` - will sync to `types/prep.ts`

### Key Clarification: BOH vs POS KDS

| Feature                     | POS                     | BOH             |
| --------------------------- | ----------------------- | --------------- |
| **Live Orders**             | ✅ Built-in KDS column  | ❌ Not included |
| **Order Bump Actions**      | ✅ Start/Ready/Complete | ❌ Not included |
| **Real-time via WebSocket** | ✅ Yes                  | ❌ No           |
| **Prep Schedules**          | ❌ Not included         | ✅ Core feature |
| **Recipe Execution**        | ❌ Not included         | ✅ Core feature |
| **Inventory Tracking**      | ❌ Not included         | ✅ Core feature |
| **Batch Prep for Events**   | ❌ Not included         | ✅ Core feature |

> **Rule**: BOH handles advance prep (days/weeks before events). POS handles live sales and order tracking.

---

## 🔗 Schema Alignment

### Shared Types (Future)

These types will be defined in both repositories and must remain synchronized:

| Type            | BOH Location    | POS Location   | Status    |
| --------------- | --------------- | -------------- | --------- |
| `Product`       | `types/prep.ts` | `src/types.ts` | 🔮 Future |
| `InventoryItem` | `types/prep.ts` | `src/types.ts` | 🔮 Future |
| `Recipe`        | `types/prep.ts` | `src/types.ts` | 🔮 Future |
| `MenuData`      | `types/prep.ts` | `src/types.ts` | 🔮 Future |

### BOH-Specific Types

Types unique to BOH (defined in `BOH_AI_PROMPT.md`):

```typescript
// Prep Kitchen Types
export interface PrepSchedule {
  id: string;
  name: string; // "Market Weekend Prep"
  targetEvent: string; // "Saturday Farmers Market"
  targetDate: string; // ISO date
  status: 'planning' | 'active' | 'completed';
  tasks: PrepTask[];
  createdAt: number;
}

export interface PrepTask {
  id: string;
  scheduleId: string;
  recipeId: string;
  name: string; // "Brioche Buns (x40)"
  targetQuantity: number;
  unit: string;
  assignedDay: string; // "Wednesday"
  priority: number;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: number;
  completedAt?: number;
  completedBy?: string;
  completedQuantity?: number;
  notes?: string;
  estimatedMinutes?: number;
}

export interface RecipeDefinition {
  id: string;
  name: string;
  category: string;
  batchSize: number;
  batchUnit: string;
  totalTimeMinutes: number;
  steps: RecipeStep[];
  components: RecipeComponent[];
  outputInventoryItemId?: string;
}

export interface RecipeStep {
  stepNumber: number;
  instruction: string;
  duration?: number; // Timer in seconds
  tips?: string[];
  ingredients?: string[];
  checkpoint?: boolean;
  image?: string;
}

export interface RecipeComponent {
  inventoryItemId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: 'RAW' | 'PREP'; // Raw ingredient vs prepped item
  currentStock: number;
  unit: string;
  parLevel: number; // Minimum stock trigger
  storageLocation?: string;
  expirationDays?: number;
  lastUpdated: number;
}

export interface WasteLog {
  id: string;
  inventoryItemId: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'overproduction' | 'quality' | 'other';
  notes?: string;
  loggedAt: number;
  loggedBy?: string;
}

// Prep Math Types
export interface PrepCalculation {
  eventId: string;
  eventName: string;
  eventDate: string;
  salesProjections: SalesProjection[];
  prepRequirements: PrepRequirement[];
  generatedAt: number;
}

export interface SalesProjection {
  productId: string;
  productName: string;
  expectedSales: number;
  confidence: 'low' | 'medium' | 'high';
  basedOn: 'historical' | 'manual' | 'forecast';
}

export interface PrepRequirement {
  recipeId: string;
  recipeName: string;
  batchesNeeded: number;
  totalYield: number;
  yieldUnit: string;
  suggestedPrepDay: string;
}
```

### POS-Specific Extensions

POS has concepts BOH doesn't need:

```typescript
// POS-only: Live order tracking (KDS lives in POS)
export interface SavedOrder {
  id: string;
  orderNumber: number;
  status: 'placed' | 'cooking' | 'ready' | 'completed' | 'cancelled';
  cookingStartedAt?: number;
  readyAt?: number;
  // ... rest of order fields
}

// POS-only: UI state for live orders
export interface OrderItem extends Product {
  uniqueId: string;
  selectedModifiers: SelectedModifier[];
  notes?: string;
  finalPrice: number;
}
```

---

## 🚀 Integration Strategy

### Immediate Actions (Phase 0)

1. ✅ **AI Prompt Complete**: `docs/BOH_AI_PROMPT.md` defines all BOH requirements
2. ✅ **Integration Doc Created**: This document tracks the contract
3. 🔮 **Future**: Create `hyphae-boh` repo from AI prompt

### Future Integration (Phase 2+)

When BOH is implemented:

1. **Inventory Sync**: BOH updates inventory → syncs to Core → POS sees stock levels
2. **Recipe Library**: Shared recipe definitions between BOH and Core
3. **Prep Planning**: BOH reads sales data from Core to calculate prep needs
4. **Menu Sync**: Products defined in Core are available for prep scheduling

**Data Flow**:

```
Core → BOH: Menu items, recipes, sales forecasts
BOH → Core: Inventory updates, prep completion, waste logs
Core → POS: Real-time inventory levels (affects availability)
```

---

## 📋 Integration Boundaries

### Clear Separation of Concerns

| Responsibility        | Owner   | Rationale                            |
| --------------------- | ------- | ------------------------------------ |
| Live order display    | **POS** | Real-time WebSocket, instant updates |
| Order bump actions    | **POS** | Part of sales flow                   |
| Station filtering     | **POS** | Kitchen routing during service       |
| Prep scheduling       | **BOH** | Advance planning, not real-time      |
| Recipe execution      | **BOH** | Guided cooking for batch prep        |
| Inventory tracking    | **BOH** | Par levels, waste, stock counts      |
| Prep math/forecasting | **BOH** | Historical data analysis             |

### NO Duplication Rule

- ❌ BOH will NOT implement KDS features (POS already has them)
- ❌ POS will NOT implement prep scheduling (BOH's domain)
- ✅ Shared data (inventory, recipes) flows through Core API

---

## 🔍 Monitoring

### Manual Checks (When BOH Exists)

- [ ] Compare BOH `types/prep.ts` with POS `src/types.ts` for shared types
- [ ] Verify inventory sync doesn't conflict between systems
- [ ] Ensure recipe definitions are consistent

### Automated Checks (Future)

- [ ] CI job to validate schema compatibility
- [ ] Integration tests for Core ↔ BOH ↔ POS data flow
- [ ] Inventory consistency checks

---

## 📖 References

- **BOH AI Prompt**: `docs/BOH_AI_PROMPT.md` (Complete specification for AI generation)
- **Core Integration**: `docs/CORE_INTEGRATION.md` (POS ↔ Core contract)
- **Development Plan**: `docs/DEVELOPMENT_PLAN.md` (Ecosystem overview)
- **POS Schema**: `src/types.ts`

---

## 🤝 Contact & Governance

- **BOH Features**: Defined in `BOH_AI_PROMPT.md` - update prompt for changes
- **Schema Changes**: Coordinate between BOH, POS, and Core repos
- **KDS Questions**: If it's live orders, it belongs in POS, not BOH
- **Backwards Compatibility**: Mandatory for all shared types

---

## 📅 Roadmap

### Phase 0 (Current)

- ✅ Define BOH concept and requirements
- ✅ Create AI prompt for BOH generation
- ✅ Clarify BOH vs POS KDS responsibilities
- ✅ Create this integration document

### Phase 1 (Future)

- 🔮 Generate BOH app using AI prompt
- 🔮 Create `hyphae-boh` repository
- 🔮 Implement Core API endpoints for prep data

### Phase 2 (Future)

- 🔮 Integrate BOH with Core API
- 🔮 Enable inventory sync to POS
- 🔮 Add prep math based on POS sales data
