---
name: security
description: Enforces mandatory security guidelines for Hyphae POS. Covers Database Security (LibSQL/Drizzle), Input Validation (Zod), and Secret Management. Use this skill when implementing data flows, authentication, or DB interactions.
---

# Security Officer (Hyphae POS Edition)

This skill mandates security practices for Phase 2+ of Loome Engine / Hyphae POS.

## 1. Database Security (Drizzle & LibSQL)

### 🚫 Forbidden Patterns (Raw SQL)

- **NEVER** use `db.run()` with template literals for dynamic values.
- **NEVER** expose the raw `sqlite.db` file to the web root.

### ✅ Mandatory Patterns (ORM)

- **Always** use Drizzle's query builder methods (`db.select`, `db.insert`, `db.update`).
- **Parameterization** is handled automatically by Drizzle. Trust the ORM.
- **File Permissions**: Ensure `sqlite.db` is strictly local and not in `public/`.

```typescript
// BAD
db.run(`SELECT * FROM users WHERE name = '${input}'`);

// GOOD
await db.select().from(users).where(eq(users.name, input));
```

## 2. Input Validation (Zod)

All inputs—API responses, Form submissions, and Inter-Process Communication (IPC)—MUST be validated.

```typescript
import { z } from 'zod';

export const OrderSchema = z.object({
  id: z.string().uuid(),
  total: z.number().nonnegative(),
  items: z.array(OrderItemSchema).min(1),
  // Sanitize strings automatically
  notes: z.string().trim().max(500).optional(),
});
```

- **Sanitization**: Use `.trim()` and `.max()` constraints on free text.
- **Strict Mode**: Use `.strict()` to strip unknown fields from payloads.

## 3. Secret Management & Config

- **Git Hygiene**: `*.db`, `.env` must be git-ignored. **DO NOT** ignore `pnpm-lock.yaml` (needed for reproducible builds).
- **Environment Variables**:
  - Access via `import.meta.env` (Vite) or `process.env` (Node).
  - Define all keys in `.env.example`.
- **Encryption**:
  - Use Electron's `safeStorage` for persisting API keys on disk.
  - DO NOT store keys in `localStorage` or `sessionStorage`.

## 4. XSS Prevention

- **User-Generated Content**: All text inputs (customer names, order notes) must be sanitized.
- **React Safety**: Never use `dangerouslySetInnerHTML` unless content is pre-sanitized.
- **Zod Patterns**: Use `.trim()`, `.max()`, and regex validation for names/notes.

## 5. Authentication & RBAC

| Role        | Permissions                            |
| ----------- | -------------------------------------- |
| **Kitchen** | `VIEW_ORDERS`, `UPDATE_STATUS`         |
| **Cashier** | `CREATE_ORDER`, `TAKE_PAYMENT`         |
| **Manager** | `VOID_ORDER`, `REFUND`, `MANAGE_STAFF` |

- **Staff PINs**: Hash immediately (bcrypt/Argon2). Never store plain text.
- **Sessions**: Auto-logout after inactivity. Clean up indexedDB session keys on logout.

## 6. Audit Protocol

When modifying `package.json`:

1. Run `pnpm audit`.
2. Pin exact versions for security-critical libs (crypto, auth).
