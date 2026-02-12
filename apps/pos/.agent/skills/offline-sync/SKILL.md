---
name: offline-sync
description: Guide for Offline-First architecture. Covers IndexedDB schema, Sync Queue, and Conflict Resolution. Use this when implementing data persistence or sync protocols.
---

# Offline-First Architecture

Hyphae POS must operate fully without internet access.

## 1. Local Persistence (IndexedDB)

We use `idb` to wrap IndexedDB.

### Database: `hyphae_db_v1`

**Stores:**
- `products`: Read-only cache of menu. Key: `id`.
- `orders`: Active and completed orders. Key: `id`. Indexes: `status`, `createdAt`.
- `sync_queue`: Mutations waiting to go to server. Key: `autoIncrement`.
- `config`: Device settings.

## 2. Sync Queue Protocol

When a user performs an action (e.g., `PAY_ORDER`):

1. **Optimistic UI:** Update Context/State immediately.
2. **Persist Local:** Save to `orders` store.
3. **Network Check:**
   - **If Online:** Send API request.
     - Success: Done.
     - Fail: Add to `sync_queue`.
   - **If Offline:** Add to `sync_queue` immediately.

### Queue Item Structure
```typescript
interface QueueItem {
  id: number;
  endpoint: string; // e.g., '/orders'
  method: 'POST' | 'PUT' | 'PATCH';
  payload: any;
  timestamp: number;
  retryCount: number;
}
```

## 3. Re-Sync Process (The "Flush")

When connectivity returns (event `online`):

1. **Lock Queue:** Pause adding new items if possible.
2. **Process FIFO:** Read oldest item first.
3. **Execute:** Send to API.
   - **200 OK:** Delete from queue.
   - **4xx/5xx:** Increment retry. If >5, move to `dead_letter_queue` and alert user.
4. **Unlock:** Resume normal operation.

## 4. Conflict Resolution

**Strategy:** Last Write Wins (for V0).
**Future:** Server diffing.

If server detects conflict (e.g., Order modified by BOH while POS was offline):
- Server rejects sync with `409 Conflict`.
- App prompts user: "This order was modified by Kitchen. [Keep Local] | [Overwrite w/ Server]".
