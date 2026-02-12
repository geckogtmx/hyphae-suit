# Security Policy

> **Status**: Active
> **Last Audit**: 2026-01-16

## 🛡️ Core Principles

1.  **Shift Left**: Security checks happen during development, not just before deployment.
2.  **Zero Trust inputs**: All external data (API, User, Database) must be validated.
3.  **Least Privilege**: Components only get access to the data they need.

## 🚨 Threat Model

| Asset                     | Threat              | Mitigation                                     |
| ------------------------- | ------------------- | ---------------------------------------------- |
| **Customer Data**         | SQL Injection       | Use Drizzle ORM (No raw SQL).                  |
| **Transaction Integrity** | Manipulation        | Server-side calculation of totals.             |
| **API Keys**              | Leaked in git       | `.env` enforcement, secret scanning.           |
| **Local Database**        | Unauthorized Access | File permissions, encrypted at rest (Phase 4). |

## 🔒 Mandatory Guidelines

### 1. Input Validation

All external inputs MUST be validated using **Zod** schemas.

```typescript
import { z } from 'zod';

export const OrderSchema = z.object({
  id: z.string().uuid(),
  total: z.number().nonnegative(),
  items: z.array(OrderItemSchema).min(1),
  // Sanitize strings automatically
  notes: z.string().trim().max(500).optional(),
});

// Use .strict() to reject unknown fields
export const StrictOrderSchema = OrderSchema.strict();
```

- **API Payloads**: Validate on entry.
- **Form Inputs**: Validate on submit.
- **DB Reads**: Typed via Drizzle, but runtime checks recommended for critical data.

### 2. Database Interactions

**Forbidden Patterns:**

```typescript
// ❌ NEVER DO THIS
db.run(`SELECT * FROM users WHERE name = '${input}'`);
```

**Required Patterns:**

```typescript
// ✅ ALWAYS DO THIS
import { eq } from 'drizzle-orm';
await db.select().from(users).where(eq(users.name, input));
```

- **Sanitization**: Drizzle handles parameterization automatically.
- **File Location**: Ensure `sqlite.db` is NOT in `public/` or any web-accessible directory.

### 3. Secret Management

- **Never** commit secrets to git (enforced by `.gitignore`).
- **Local Development**: Use `.env` files (must be listed in `.env.example`).
- **Production**: Use Electron `safeStorage` API for encrypting keys at rest (Phase 4).
- **Forbidden**: Storing secrets in `localStorage` or `sessionStorage`.

### 4. XSS Prevention

- **User-Generated Content**: Sanitize all text inputs (customer names, order notes).
- **React Safety**: Never use `dangerouslySetInnerHTML` unless absolutely necessary and content is sanitized.
- **Zod Sanitization**: Use `.trim()`, `.max()`, and consider regex validation for names.

### 5. Authentication & RBAC

| Role        | Permissions                            |
| ----------- | -------------------------------------- |
| **Kitchen** | `VIEW_ORDERS`, `UPDATE_STATUS`         |
| **Cashier** | `CREATE_ORDER`, `TAKE_PAYMENT`         |
| **Manager** | `VOID_ORDER`, `REFUND`, `MANAGE_STAFF` |

- **Staff PINs**: Hash immediately using bcrypt or Argon2. Never store plain text.
- **Sessions**: Auto-logout after 15 minutes of inactivity (configurable).
- **Cleanup**: Clear IndexedDB session keys on logout.

### 6. Audit Logging (Phase 3+)

All sensitive operations MUST be logged:

- Order voids/refunds
- Staff permission changes
- Cash drawer openings
- Failed authentication attempts

```typescript
interface AuditLog {
  timestamp: number;
  staffId: string;
  action: 'VOID_ORDER' | 'REFUND' | 'CASH_DRAWER_OPEN';
  resourceId: string;
  metadata?: Record<string, unknown>;
}
```

### 7. Dependency Management

- Run `pnpm audit` before every Phase gate.
- Pin exact versions for security-critical libraries (crypto, auth, payment SDKs).
- Review dependency updates manually; never auto-merge security patches without testing.

## 🐛 Vulnerability Reporting

If you find a security issue, please create a **Private Issue** in the repository or contact the lead developer. Do not file public issues for exploits.
