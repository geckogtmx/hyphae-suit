# SOP-001: Header Injection

## Objective

Ensure every source file contains the mandatory metadata header for compliance and tracking.

## Header Format

```typescript
/**
 * @link e:\git\hyphae-pos\src\...
 * @author Hyphae POS Team
 * @description [Brief description of the file's purpose]
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
```

## Procedure

1. Identify all files in `src/` (excluding tests).
2. Prepend the header block.
3. Update `@description` based on file content.
4. Update `@last-updated` to current date.

## Targeted Files

- `src/index.tsx`
- `src/App.tsx`
- `src/db/schema.ts`
- All components in `src/components/*.tsx`
- All hooks in `src/hooks/*.ts`
- All utilities in `src/utils/*.ts`
