---
name: backend-testing
description: Enforces mandatory backend testing guidelines using Vitest for Hyphae POS. Use this skill when writing unit tests, integration tests, or verifying code coverage for core logic (non-UI). Ensures compliance with QA_TESTING.md standards.
---

# Backend Testing Specialist (Hyphae POS)

This skill provides authoritative guidance on writing and running backend tests for Hyphae POS using **Vitest**.

## When to Use

- **New Features**: Every new feature MUST include unit tests.
- **Refactoring**: Ensure no regression by running the test suite.
- **Database Logic**: Testing Drizzle ORM queries and data integrity.
- **Coverage Checks**: Verify code meets the 70% coverage threshold.

## Core Mandates

### 1. Test Framework: Vitest

All backend tests (Unit & Integration) use **Vitest**.

- **Run All**: `pnpm test:run`
- **Coverage**: `pnpm test:coverage`
- **Watch Mode**: `pnpm test`

### 2. Location & Naming

- **Location**: Test files in `__tests__` directories adjacent to source.
- **Naming**: `<filename>.test.ts` or `<filename>.test.tsx`
- **Example**: `src/services/OrderService.ts` → `src/services/__tests__/OrderService.test.ts`

### 3. Coverage Thresholds

Builds will FAIL if these are not met:

| Scope                | Threshold                                    |
| -------------------- | -------------------------------------------- |
| **Global**           | 70% (lines, functions, branches, statements) |
| **POS Calculations** | 100% (tax, totals, balancing)                |
| **Inventory Logic**  | 90% (stock levels)                           |
| **UI Components**    | 70% (interaction logic)                      |

### 4. Test Template (Standard)

Use this boilerplate for all new test files:

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TargetClass } from '../TargetClass';

describe('TargetClass', () => {
  let instance: TargetClass;

  beforeEach(() => {
    // Reset mocks and instance
    vi.clearAllMocks();
    instance = new TargetClass();
  });

  it('should perform expected behavior', () => {
    // Arrange
    const input = 'test';

    // Act
    const result = instance.method(input);

    // Assert
    expect(result).toBeDefined();
  });
});
```

### 5. Database Testing Pattern

When testing Drizzle queries, use `beforeEach` for cleanup:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../index';
import { orders } from '../schema';
import { eq } from 'drizzle-orm';

describe('Order Repository', () => {
  beforeEach(async () => {
    // Clean up test data before each test
    await db.delete(orders).where(eq(orders.id, 'test-order-1'));
  });

  it('should insert and retrieve order', async () => {
    const order = {
      id: 'test-order-1',
      total: 100.0,
      // ... other fields
    };

    await db.insert(orders).values(order);
    const result = await db.select().from(orders).where(eq(orders.id, 'test-order-1'));

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(order);
  });
});
```

## Common Commands

- **Run specific test file**: `pnpm test src/path/to/file.test.ts`
- **Run with coverage**: `pnpm test:coverage`
- **Watch mode**: `pnpm test`
- **Run once (CI)**: `pnpm test:run`
