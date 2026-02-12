# Database Architecture

## Overview
We use [Drizzle ORM](https://orm.drizzle.team/) for type-safe database interactions and [SQLite](https://sqlite.org/) for local storage.

## Driver Selection
We are using `@libsql/client` ('file:' protocol) instead of `better-sqlite3`.
**Reason**: `better-sqlite3` native bindings were failing to build on the current Windows/Node environment (Node v24 ABI 137). LibSQL provides a compatible and robust alternative.

## Schema
Located in `src/db/schema.ts`.
- **Orders**: Tracks sales, status, and totals.
- **MenuItems**: Canonical product list.

## Usage
```typescript
import { db } from '@/db';
import { orders } from '@/db/schema';

await db.select().from(orders);
```

## Migration
- `pnpm db:generate`: Create SQL from schema changes.
- `pnpm db:push`: Apply schema directly to `sqlite.db`.
