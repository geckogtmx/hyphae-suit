# Hyphae Core Integration Notes

> **Status**: Phase 0 - Schema Alignment Only  
> **Last Updated**: 2026-01-16  
> **Core Repo**: [geckogtmx/hyphae-core](https://github.com/geckogtmx/hyphae-core)

---

## 🎯 Purpose

This document tracks the integration contract between **Hyphae Core** (strategic brain) and **Hyphae POS** (operational hands). It ensures schema alignment and provides a roadmap for future API integration.

---

## 📊 Current State

### Phase 0: Offline Prototypes (Current)

- **Core**: Proto-dashboard with menu management and analytics
- **POS**: Tablet UI with local mock data
- **Integration**: None (both repos operate independently)
- **Schema**: Manually synchronized via `types/schema.ts` (Core) ↔ `src/types.ts` (POS)

### Future Phases

- **Phase 1**: Core Backend Setup (Weeks 1-4)
- **Phase 2**: API Integration (Weeks 5-8)
- **Phase 3**: Production Hardening (Weeks 9-12)

See [Core POS_INTEGRATION.md](https://github.com/geckogtmx/hyphae-core/blob/main/docs/POS_INTEGRATION.md) for full roadmap.

---

## 🔗 Schema Alignment

### Shared Types (Must Match)

These types are defined in **both** repositories and must remain synchronized:

| Type             | Core Location     | POS Location   | Status                        |
| ---------------- | ----------------- | -------------- | ----------------------------- |
| `Concept`        | `types/schema.ts` | `src/types.ts` | ✅ Aligned                    |
| `Category`       | `types/schema.ts` | `src/types.ts` | ✅ Aligned                    |
| `Product`        | `types/schema.ts` | `src/types.ts` | ⚠️ POS has extensions         |
| `ModifierGroup`  | `types/schema.ts` | `src/types.ts` | ⚠️ POS has `dependency` field |
| `ModifierOption` | `types/schema.ts` | `src/types.ts` | ✅ Aligned                    |
| `Recipe`         | `types/schema.ts` | `src/types.ts` | ⚠️ Different structure        |
| `InventoryItem`  | `types/schema.ts` | `src/types.ts` | ⚠️ Different units            |

### POS-Specific Extensions

POS extends Core schemas with UI and operational fields:

```typescript
// POS adds UI state to OrderItem
export interface OrderItem extends Product {
  uniqueId: string; // Client-side ID
  selectedModifiers: SelectedModifier[];
  notes?: string;
  finalPrice: number;
  originalPrice?: number;
  isDiscounted?: boolean;
}

// POS adds dependency logic to ModifierGroup
export interface ModifierDependency {
  groupId: string;
  requiredOptions?: string[];
}

// POS adds packaging metadata
export interface PackagingMetadata {
  sku: string;
  volumePoints: number;
  isMessy: boolean;
}
```

### Core-Specific Extensions

Core adds AI agent metadata not needed by POS:

```typescript
// Core adds agent fields to Product
export interface Product {
  // ... base fields ...

  logisticsMetadata?: {
    volumetricScore: number;
    requiresContainer: boolean;
    packagingDims?: [number, number, number];
  };

  prepBatchSize?: number; // Forecaster Agent
  costOfGoods?: number; // Menu Engineer Agent
  recipeText?: string; // Trainer Agent (SOP)
}
```

**Rule**: POS ignores unknown fields; Core never removes base fields.

---

## 🚀 Integration Strategy

### Immediate Actions (Phase 0)

1. **No Action Required**: Schemas are manually aligned and working
2. **Monitor**: Watch for breaking changes in Core `types/schema.ts`
3. **Document**: Keep this file updated with schema drift notes

### Future Integration (Phase 2+)

When Core API is ready:

1. **Menu Distribution**: POS will consume `MenuRelease` snapshots from Core
2. **Transaction Upload**: POS will send `TransactionRecord` to Core for analytics
3. **Fleet Monitoring**: POS will send heartbeats to Core dashboard
4. **Loyalty Sync**: Bidirectional sync of loyalty profiles and transactions

**Data Flow**:

```
Core → POS: Menu releases, loyalty tiers, configuration
POS → Core: Transaction records, device heartbeats, inventory updates
```

---

## 📋 Schema Drift Tracking

### Known Differences (Acceptable)

| Field                       | Core                                            | POS                            | Reason                       |
| --------------------------- | ----------------------------------------------- | ------------------------------ | ---------------------------- |
| `ModifierGroup.dependency`  | ❌ Missing                                      | ✅ Present                     | POS-specific UI logic        |
| `Product.packaging`         | ❌ Missing                                      | ✅ Present                     | POS-specific kitchen routing |
| `Product.logisticsMetadata` | ✅ Present                                      | ❌ Ignored                     | Core-specific AI agent data  |
| `InventoryItem.stockUnit`   | `'kg' \| 'pcs' \| 'oz' \| 'slices' \| 'liters'` | `MeasurementUnit` (more units) | POS needs more granularity   |

### Breaking Changes Protocol

If Core makes a breaking change to shared types:

1. **Deprecation Notice**: 1-month warning in Core `@DEV_HANDOFF.md`
2. **Migration Guide**: Core provides migration script or instructions
3. **POS Update**: Update `src/types.ts` and run full test suite
4. **Verification**: Ensure `pnpm test:run` and `pnpm build` pass

---

## 🔍 Monitoring

### Manual Checks (Monthly)

- [ ] Compare Core `types/schema.ts` with POS `src/types.ts`
- [ ] Review Core `@DEV_HANDOFF.md` for breaking change notices
- [ ] Update this document with any schema drift

### Automated Checks (Future)

- [ ] CI job to validate schema compatibility
- [ ] TypeScript type tests for shared interfaces
- [ ] Integration tests for API contract

---

## 📖 References

- **Core Repo**: [geckogtmx/hyphae-core](https://github.com/geckogtmx/hyphae-core)
- **Core Integration Doc**: [POS_INTEGRATION.md](https://github.com/geckogtmx/hyphae-core/blob/main/docs/POS_INTEGRATION.md)
- **Core Schema**: [types/schema.ts](https://github.com/geckogtmx/hyphae-core/blob/main/types/schema.ts)
- **POS Schema**: `src/types.ts`

---

## 🤝 Contact & Governance

- **Schema Changes**: Discuss in Core repo issues before implementing
- **Breaking Changes**: Require approval from both Core and POS maintainers
- **Backwards Compatibility**: Mandatory for all shared types
