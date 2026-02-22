/**
 * @link e:\git\hyphae-pos\src\services\SyncEngine.ts
 * @author Hyphae POS Team
 * @description Local-First sync engine for POS. Manages SQLite replication between POS and CORE.
 * @version 2.0.0
 * @last-updated 2026-02-22
 */

import { db } from '../db';
import { schema } from '@hyphae/database';
import { eq, sql } from 'drizzle-orm';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:3001';

export class SyncEngine {
  private static instance: SyncEngine;
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;
  private lastSyncKey = 'hyphae_last_sync_ts';

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.runSyncLoop();
      });
      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  /**
   * Main Sync Loop: Pull structural data, then push transaction data.
   */
  async runSyncLoop(): Promise<void> {
    if (this.isSyncing || !this.isOnline) return;
    this.isSyncing = true;

    try {
      console.log('🔄 Starting Sync Loop...');
      await this.pullSnapshot();
      await this.pushOrders();
      console.log('✅ Sync Loop Complete.');
    } catch (e) {
      console.error('❌ Sync Loop Failed:', e);
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * pullSnapshot: Fetch changed Menu, Pricing, and Staff data from CORE.
   */
  private async pullSnapshot(): Promise<void> {
    const lastSync = localStorage.getItem(this.lastSyncKey) || '0';

    const response = await fetch(`${API_URL}/api/sync/pull?since=${lastSync}`, {
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) throw new Error(`Pull failed: ${response.statusText}`);

    const data = await response.json();
    const { products, categories, modifierOptions, inventoryItems, users, loyaltyProfiles, timestamp } = data;

    // Atomic upsert into local SQLite
    // Note: LibSQL/Drizzle in browser handles this sequentially or via batch
    await db.transaction(async (tx) => {
      // Products
      for (const p of products) {
        await tx.insert(schema.products).values(p).onConflictDoUpdate({ target: schema.products.id, set: p });
      }
      // Categories
      for (const c of categories) {
        await tx.insert(schema.categories).values(c).onConflictDoUpdate({ target: schema.categories.id, set: c });
      }
      // Modifier Options
      for (const m of modifierOptions) {
        await tx.insert(schema.modifierOptions).values(m).onConflictDoUpdate({ target: schema.modifierOptions.id, set: m });
      }
      // Inventory (stock levels for 86ing)
      for (const i of inventoryItems) {
        await tx.insert(schema.inventoryItems).values(i).onConflictDoUpdate({ target: schema.inventoryItems.id, set: i });
      }
      // Users (Offline Auth)
      for (const u of users) {
        await tx.insert(schema.users).values(u).onConflictDoUpdate({ target: schema.users.id, set: u });
      }
      // Loyalty Profiles
      for (const l of loyaltyProfiles) {
        await tx.insert(schema.loyaltyProfiles).values(l).onConflictDoUpdate({ target: schema.loyaltyProfiles.id, set: l });
      }
    });

    localStorage.getItem(this.lastSyncKey);
    localStorage.setItem(this.lastSyncKey, timestamp.toString());
    console.log(`📥 Pulled ${products.length} products, sync point: ${timestamp}`);
  }

  /**
   * pushOrders: Push local orders that haven't been synced to CORE.
   */
  private async pushOrders(): Promise<void> {
    const { OrderRepository } = await import('../repositories/OrderRepository');
    const repo = new OrderRepository();
    const unsynced = await repo.getUnsyncedOrders();

    if (unsynced.length === 0) return;

    console.log(`📤 Found ${unsynced.length} unsynced orders.`);

    for (const order of unsynced) {
      try {
        // Prepare payload for Checkout API
        const payload = {
          id: order.id,
          storeId: order.systemInfo?.storeId,
          terminalId: order.systemInfo?.terminalId,
          staffId: order.systemInfo?.staffId,
          loyaltyProfileId: order.loyaltyProfileId,
          orderType: order.orderType,
          items: order.items.map(i => ({
            productId: i.productId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
            modifiers: JSON.stringify(i.selectedModifiers)
          })),
          subtotal: order.subtotal,
          tax: order.tax,
          total: order.total,
          payment: {
            method: order.payment?.method || 'CASH',
            amount: order.payment?.amount || order.total,
            transactionId: order.payment?.transactionId
          }
        };

        const response = await fetch(`${API_URL}/api/order/checkout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          await repo.setSynced(order.id);
          console.log(`✅ Synced order ${order.id}`);
        } else {
          console.error(`❌ Failed to sync order ${order.id}: ${response.statusText}`);
        }
      } catch (e) {
        console.error(`❌ Error pushing order ${order.id}:`, e);
      }
    }
  }

  /**
   * Utility to manually trigger a sync (e.g. from a 'Refresh' button)
   */
  async forceSync(): Promise<void> {
    await this.runSyncLoop();
  }
}
