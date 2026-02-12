---
name: drizzle-schema
description: Guides Drizzle ORM schema design and migrations for LOOM Engine. Use this skill when creating new database tables, modifying schemas, writing migrations, or ensuring the "Markdown is canonical, DB is accelerator" principle is maintained. Covers SQLite-specific patterns with Drizzle.
---

# Drizzle Schema Designer

This skill provides guidance for Drizzle ORM schema design in LOOM Engine.

## Core Principle

> **The database is an accelerator, not the source of truth.**
> All authoritative data must be rebuildable from Markdown files.

This means:
- DB optimizes reads and queries
- Markdown files in `.loom/` are canonical
- If MD and DB disagree, Markdown wins
- Schema must support reconciliation

## Drizzle Setup (SQLite)

```typescript
// packages/db/src/client.ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

const sqlite = new Database('loom.db');
export const db = drizzle(sqlite, { schema });
```

## Schema Conventions

### Naming
- Tables: `snake_case` plural (`sessions`, `world_deltas`)
- Columns: `snake_case` (`world_id`, `created_at`)
- Indexes: `{table}_{column}_idx` (`sessions_world_idx`)

### Required Columns

Every table should have:

```typescript
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const baseColumns = {
  id: text('id').primaryKey(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
};
```

### World-Scoped Tables

Tables that store World-specific data MUST have `world_id`:

```typescript
export const sessions = sqliteTable('sessions', {
  ...baseColumns,
  worldId: text('world_id').notNull(), // REQUIRED for L2/L3
  name: text('name').notNull(),
  status: text('status', {
    enum: ['pending', 'active', 'summarizing', 'closed', 'failed']
  }).notNull(),
}, (table) => ({
  worldIdx: index('sessions_world_idx').on(table.worldId),
}));
```

## LOOM Schema Design

### L4 Tables (Telos)

```typescript
// Operator Telos - Single row, rarely changes
export const operatorTelos = sqliteTable('operator_telos', {
  id: text('id').primaryKey().default('operator'),
  values: text('values').notNull(),        // JSON
  preferences: text('preferences'),         // JSON
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
  // NO world_id - global
});

// World Telos
export const worldTelos = sqliteTable('world_telos', {
  id: text('id').primaryKey(),
  worldId: text('world_id').notNull().unique(),
  purpose: text('purpose').notNull(),
  identity: text('identity').notNull(),    // JSON
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});

// Agent Telos
export const agentTelos = sqliteTable('agent_telos', {
  id: text('id').primaryKey(),
  agentId: text('agent_id').notNull().unique(),
  corePurpose: text('core_purpose').notNull(),
  constraints: text('constraints'),         // JSON array
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
});
```

### L3 Tables (Knowledge)

```typescript
// Worlds
export const worlds = sqliteTable('worlds', {
  ...baseColumns,
  name: text('name').notNull(),
  purpose: text('purpose').notNull(),
  config: text('config'),                   // JSON
  status: text('status', { enum: ['active', 'archived'] }).default('active'),
});

// Agents
export const agents = sqliteTable('agents', {
  ...baseColumns,
  worldId: text('world_id').notNull(),
  name: text('name').notNull(),
  profile: text('profile').notNull(),       // JSON: PROFILE section
  modes: text('modes'),                     // JSON: MODES section
  tools: text('tools'),                     // JSON: TOOLS section
  modelPreferences: text('model_preferences'), // JSON
}, (table) => ({
  worldIdx: index('agents_world_idx').on(table.worldId),
}));

// Patterns
export const patterns = sqliteTable('patterns', {
  ...baseColumns,
  name: text('name').notNull(),
  family: text('family', {
    enum: ['ideation', 'structuring', 'decision', 'production', 'refinement', 'analysis']
  }).notNull(),
  purpose: text('purpose').notNull(),
  worldScope: text('world_scope', { enum: ['global', 'world-specific'] }).default('global'),
  config: text('config'),                   // JSON: full pattern config
});

// Pattern Steps
export const patternSteps = sqliteTable('pattern_steps', {
  ...baseColumns,
  patternId: text('pattern_id').notNull().references(() => patterns.id),
  order: integer('order').notNull(),
  name: text('name').notNull(),
  agentId: text('agent_id').notNull(),
  layerWrites: text('layer_writes'),        // JSON array: ['L1', 'L2']
  tempoMode: text('tempo_mode', { enum: ['allegro', 'andante', 'adagio'] }),
  constraints: text('constraints'),          // JSON array
}, (table) => ({
  patternIdx: index('pattern_steps_pattern_idx').on(table.patternId),
  orderIdx: index('pattern_steps_order_idx').on(table.patternId, table.order),
}));
```

### L2 Tables (Episodic)

```typescript
// Sessions
export const sessions = sqliteTable('sessions', {
  ...baseColumns,
  worldId: text('world_id').notNull(),
  patternId: text('pattern_id'),
  status: text('status', {
    enum: ['pending', 'initializing', 'primacy', 'active', 'summarizing', 'closed', 'failed']
  }).notNull(),
  sieId: text('sie_id'),                    // Session Intent Envelope
  modelUsed: text('model_used'),
  tokensIn: integer('tokens_in').default(0),
  tokensOut: integer('tokens_out').default(0),
  closedAt: integer('closed_at', { mode: 'timestamp' }),
}, (table) => ({
  worldIdx: index('sessions_world_idx').on(table.worldId),
}));

// Session Summaries (Continuity Artifacts)
export const sessionSummaries = sqliteTable('session_summaries', {
  ...baseColumns,
  sessionId: text('session_id').notNull().references(() => sessions.id),
  worldId: text('world_id').notNull(),
  type: text('type', { enum: ['checkpoint', 'final'] }).notNull(),
  content: text('content').notNull(),       // JSON: structured summary
}, (table) => ({
  worldIdx: index('session_summaries_world_idx').on(table.worldId),
  sessionIdx: index('session_summaries_session_idx').on(table.sessionId),
}));

// Decisions
export const decisions = sqliteTable('decisions', {
  ...baseColumns,
  sessionId: text('session_id').notNull(),
  worldId: text('world_id').notNull(),
  type: text('type').notNull(),
  content: text('content').notNull(),       // JSON
}, (table) => ({
  worldIdx: index('decisions_world_idx').on(table.worldId),
}));
```

## Migrations

Create migrations in `packages/db/drizzle/`:

```typescript
// packages/db/drizzle.config.ts
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/schema/index.ts',
  out: './drizzle',
  driver: 'better-sqlite',
  dbCredentials: {
    url: './loom.db',
  },
} satisfies Config;
```

### Running Migrations

```bash
# Generate migration from schema changes
pnpm drizzle-kit generate:sqlite

# Push changes (dev only)
pnpm drizzle-kit push:sqlite

# Run migrations programmatically
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
migrate(db, { migrationsFolder: './drizzle' });
```

## Query Patterns

### Always Use Parameterized Queries

```typescript
// ✅ CORRECT: Drizzle ORM
const worldSessions = await db.select()
  .from(sessions)
  .where(eq(sessions.worldId, worldId));

// ❌ WRONG: String interpolation
const results = db.run(`SELECT * FROM sessions WHERE world_id = '${worldId}'`);
```

### Typed Selects

```typescript
// Infer types from schema
type Session = typeof sessions.$inferSelect;
type NewSession = typeof sessions.$inferInsert;

// Use in functions
async function createSession(data: NewSession): Promise<Session> {
  const [session] = await db.insert(sessions)
    .values(data)
    .returning();
  return session;
}
```

### Relations

```typescript
// Define relations
export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  world: one(worlds, {
    fields: [sessions.worldId],
    references: [worlds.id],
  }),
  summaries: many(sessionSummaries),
}));

// Query with relations
const sessionWithSummaries = await db.query.sessions.findFirst({
  where: eq(sessions.id, sessionId),
  with: {
    summaries: true,
  },
});
```

## Reconciliation Support

Design schemas to support MD ↔ DB sync:

```typescript
// Add sync metadata columns
export const syncMetadata = {
  mdPath: text('md_path'),                  // Path to source markdown
  mdHash: text('md_hash'),                  // Hash for change detection
  lastSyncedAt: integer('last_synced_at', { mode: 'timestamp' }),
};

export const worlds = sqliteTable('worlds', {
  ...baseColumns,
  ...syncMetadata,
  name: text('name').notNull(),
  // ... other columns
});
```

## Testing Schema

```typescript
describe('Schema', () => {
  it('should enforce world_id on L2 tables', async () => {
    // Attempt insert without world_id
    await expect(
      db.insert(sessions).values({
        id: 'test',
        status: 'pending',
        // Missing worldId
      })
    ).rejects.toThrow();
  });

  it('should cascade delete pattern steps', async () => {
    await db.insert(patterns).values({ id: 'p1', name: 'Test', family: 'ideation', purpose: 'Test' });
    await db.insert(patternSteps).values({ id: 's1', patternId: 'p1', order: 1, name: 'Step 1', agentId: 'a1' });

    await db.delete(patterns).where(eq(patterns.id, 'p1'));

    const steps = await db.select().from(patternSteps).where(eq(patternSteps.patternId, 'p1'));
    expect(steps).toHaveLength(0);
  });
});
```
