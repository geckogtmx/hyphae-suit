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

    const response = await fetch(`${API_URL}/sync/pull?since=${lastSync}`, {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
      }
    });

    if (!response.ok) throw new Error(`Pull failed: ${response.statusText}`);

    const data = await response.json();
    const {
      products, categories, modifierGroups, modifierOptions,
      inventoryItems, suppliers, users, loyaltyProfiles, timestamp
    } = data;

    // Use raw sql.js for bulk upserts.
    // Reason: Drizzle sqlite-proxy ignores the `set` object in onConflictDoUpdate
    // and regenerates the SET clause from the full schema — this doubles the `?` param
    // count and misaligns bindings, causing NOT NULL constraint failures on shifted columns.
    // Using `excluded.*` in raw SQL means the SET clause needs ZERO extra `?` params,
    // so there is no possibility of misalignment.
    const { getSqlJsDb } = await import('../db/sqljs');
    const rawDb = getSqlJsDb();
    if (!rawDb) throw new Error('[Sync] sql.js DB not available');

    rawDb.run('BEGIN');
    try {
      // FK order: suppliers → inventoryItems, modifierGroups → modifierOptions

      // --- Suppliers ---
      for (const s of suppliers) {
        if (!s.id || !s.name || !s.category) {
          console.warn('[Sync] Skipping supplier with missing required field:', JSON.stringify(s));
          continue;
        }
        try {
          rawDb.run(
            `REPLACE INTO suppliers (id, name, contact_name, email, phone, category, lead_time_days, updated_at, deleted_at)
             VALUES ($id, $name, $contactName, $email, $phone, $category, $leadTimeDays, $updatedAt, $deletedAt)`,
            {
              $id: s.id,
              $name: s.name,
              $contactName: s.contactName ?? null,
              $email: s.email ?? null,
              $phone: s.phone ?? null,
              $category: s.category,
              $leadTimeDays: s.leadTimeDays ?? 0,
              $updatedAt: s.updatedAt ?? 0,
              $deletedAt: s.deletedAt ?? null
            }
          );
        } catch (e: any) {
          console.error('[Sync] SUPPLIER upsert failed:', e.message, '| Record:', JSON.stringify(s));
          throw e;
        }
      }

      // --- Modifier Groups ---
      for (const g of modifierGroups) {
        if (!g.id || !g.name) {
          console.warn('[Sync] Skipping modifierGroup with missing required field:', JSON.stringify(g));
          continue;
        }
        try {
          rawDb.run(
            `REPLACE INTO modifier_groups (id, name, required, multi_select)
             VALUES ($id, $name, $required, $multiSelect)`,
            {
              $id: g.id,
              $name: g.name,
              $required: g.required ? 1 : 0,
              $multiSelect: g.multiSelect ? 1 : 0
            }
          );
        } catch (e: any) {
          console.error('[Sync] MODIFIER_GROUP upsert failed:', e.message, '| Record:', JSON.stringify(g));
          throw e;
        }
      }

      // --- Categories ---
      for (const c of categories) {
        if (!c.id || !c.name) {
          console.warn('[Sync] Skipping category with missing required field:', JSON.stringify(c));
          continue;
        }
        try {
          rawDb.run(
            `REPLACE INTO categories (id, name, concept_id, updated_at)
             VALUES ($id, $name, $conceptId, $updatedAt)`,
            {
              $id: c.id,
              $name: c.name,
              $conceptId: c.conceptId ?? null,
              $updatedAt: c.updatedAt ?? 0
            }
          );
        } catch (e: any) {
          console.error('[Sync] CATEGORY upsert failed:', e.message, '| Record:', JSON.stringify(c));
          throw e;
        }
      }

      // --- Products ---
      for (const p of products) {
        if (!p.id || !p.name) {
          console.warn('[Sync] Skipping product with missing required field:', JSON.stringify(p));
          continue;
        }
        try {
          rawDb.run(
            `REPLACE INTO products (id, name, category_id, price, is_active, requires_mods, packaging_sku, kitchen_label, recipe_id, inventory_item_id, updated_at, deleted_at)
             VALUES ($id, $name, $categoryId, $price, $isActive, $requiresMods, $packagingSku, $kitchenLabel, $recipeId, $inventoryItemId, $updatedAt, $deletedAt)`,
            {
              $id: p.id,
              $name: p.name,
              $categoryId: p.categoryId ?? null,
              $price: p.price,
              $isActive: p.isActive ? 1 : 0,
              $requiresMods: p.requiresMods ? 1 : 0,
              $packagingSku: p.packagingSku ?? null,
              $kitchenLabel: p.kitchenLabel ?? null,
              $recipeId: p.recipeId ?? null,
              $inventoryItemId: p.inventoryItemId ?? null,
              $updatedAt: p.updatedAt ?? 0,
              $deletedAt: p.deletedAt ?? null
            }
          );
        } catch (e: any) {
          console.error('[Sync] PRODUCT upsert failed:', e.message, '| Record:', JSON.stringify(p));
          throw e;
        }
      }

      // --- Modifier Options ---
      for (const m of modifierOptions) {
        if (!m.id || !m.name) {
          console.warn('[Sync] Skipping modifierOption with missing required field:', JSON.stringify(m));
          continue;
        }
        try {
          rawDb.run(
            `REPLACE INTO modifier_options (id, group_id, name, price, kitchen_label, recipe_id, inventory_item_id, updated_at)
             VALUES ($id, $groupId, $name, $price, $kitchenLabel, $recipeId, $inventoryItemId, $updatedAt)`,
            {
              $id: m.id,
              $groupId: m.groupId ?? null,
              $name: m.name,
              $price: m.price ?? 0,
              $kitchenLabel: m.kitchenLabel ?? null,
              $recipeId: m.recipeId ?? null,
              $inventoryItemId: m.inventoryItemId ?? null,
              $updatedAt: m.updatedAt ?? 0
            }
          );
        } catch (e: any) {
          console.error('[Sync] MODIFIER_OPTION upsert failed:', e.message, '| Record:', JSON.stringify(m));
          throw e;
        }
      }

      // --- Inventory Items ---
      for (const i of inventoryItems) {
        if (!i.id || !i.name) {
          console.warn('[Sync] Skipping inventoryItem with missing required field:', JSON.stringify(i));
          continue;
        }
        try {
          rawDb.run(
            `REPLACE INTO inventory_items (id, name, type, stock_unit, cost_per_unit, stock_kitchen, stock_stand, preferred_supplier_id, updated_at)
             VALUES ($id, $name, $type, $stockUnit, $costPerUnit, $stockKitchen, $stockStand, $preferredSupplierId, $updatedAt)`,
            {
              $id: i.id,
              $name: i.name,
              $type: i.type,
              $stockUnit: i.stockUnit,
              $costPerUnit: i.costPerUnit ?? 0,
              $stockKitchen: i.stockKitchen ?? 0,
              $stockStand: i.stockStand ?? 0,
              $preferredSupplierId: i.preferredSupplierId ?? null,
              $updatedAt: i.updatedAt ?? 0
            }
          );
        } catch (e: any) {
          console.error('[Sync] INVENTORY_ITEM upsert failed:', e.message, '| Record:', JSON.stringify(i));
          throw e;
        }
      }

      // --- Users ---
      for (const u of users) {
        if (!u.id || !u.name) {
          console.warn('[Sync] Skipping user with missing required field:', JSON.stringify(u));
          continue;
        }
        try {
          rawDb.run(
            `REPLACE INTO users (id, name, role, pin_hash, updated_at, deleted_at)
             VALUES ($id, $name, $role, $pinHash, $updatedAt, $deletedAt)`,
            {
              $id: u.id,
              $name: u.name,
              $role: u.role,
              $pinHash: u.pinHash ?? null,
              $updatedAt: u.updatedAt ?? 0,
              $deletedAt: u.deletedAt ?? null
            }
          );
        } catch (e: any) {
          console.error('[Sync] USER upsert failed:', e.message, '| Record:', JSON.stringify(u));
          throw e;
        }
      }

      // --- Loyalty Profiles ---
      for (const l of loyaltyProfiles) {
        if (!l.id) continue;
        try {
          rawDb.run(
            `REPLACE INTO loyalty_profiles (id, card_number, customer_name, phone, current_points, total_points_earned, current_tier_id, is_physical_card, created_at, updated_at)
             VALUES ($id, $cardNumber, $customerName, $phone, $currentPoints, $totalPointsEarned, $currentTierId, $isPhysicalCard, $createdAt, $updatedAt)`,
            {
              $id: l.id,
              $cardNumber: l.cardNumber ?? null,
              $customerName: l.customerName ?? null,
              $phone: l.phone ?? null,
              $currentPoints: l.currentPoints ?? 0,
              $totalPointsEarned: l.totalPointsEarned ?? 0,
              $currentTierId: l.currentTierId ?? null,
              $isPhysicalCard: l.isPhysicalCard ? 1 : 0,
              $createdAt: l.createdAt ?? null,
              $updatedAt: l.updatedAt ?? 0
            }
          );
        } catch (e: any) {
          console.error('[Sync] LOYALTY_PROFILE upsert failed:', e.message, '| Record:', JSON.stringify(l));
          throw e;
        }
      }

      rawDb.run('COMMIT');
    } catch (e) {
      rawDb.run('ROLLBACK');
      throw e;
    }

    localStorage.setItem(this.lastSyncKey, timestamp.toString());
    console.log(
      `📥 Pull complete — ${products.length} products, ${modifierGroups.length} mod groups, ` +
      `${suppliers.length} suppliers. Sync point: ${timestamp}`
    );
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

        const response = await fetch(`${API_URL}/order/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || ''
          },
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
