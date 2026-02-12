/**
 * @link e:\git\hyphae-pos\src\services\SyncEngine.ts
 * @author Hyphae POS Team
 * @description Offline-first sync engine managing local persistence and remote synchronization.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { getDB, SyncQueueItem } from '../lib/indexedDB';
import { SavedOrder } from '../types';

const API_URL = 'http://localhost:3001'; // Fallback to same mock var

export class SyncEngine {
  private static instance: SyncEngine;
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;

  private constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  private handleOnline = () => {
    console.log('🌐 Online: Syncing queue...');
    this.isOnline = true;
    this.processQueue();
  };

  private handleOffline = () => {
    console.log('📴 Offline Mode.');
    this.isOnline = false;
  };

  /**
   * Save order locally and attempt to sync.
   */
  async saveOrder(order: SavedOrder): Promise<void> {
    const db = await getDB();

    // 1. Local Persistence (Always save locally first)
    await db.put('orders', order);

    // 2. Network Check
    if (this.isOnline) {
      try {
        await this.pushToRemote('/orders', 'POST', order);
        return; // precise success
      } catch (e) {
        console.warn('Sync failed, queuing...', e);
        // Fallthrough to queue
      }
    }

    // 3. Add to Sync Queue (If offline or failed)
    await this.enqueue({
      endpoint: '/orders',
      method: 'POST',
      payload: order,
      timestamp: Date.now(),
      retryCount: 0,
    });
  }

  /**
   * Add item to sync queue
   */
  private async enqueue(item: SyncQueueItem) {
    const db = await getDB();
    await db.add('sync_queue', item);
  }

  /**
   * Process the Sync Queue (FIFO)
   */
  async processQueue(): Promise<void> {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const db = await getDB();
    let cursor = await db.transaction('sync_queue', 'readwrite').store.openCursor();

    while (cursor) {
      if (!this.isOnline) break; // Stop if we go offline during sync

      const item = cursor.value;

      try {
        await this.pushToRemote(item.endpoint, item.method, item.payload);
        await cursor.delete(); // Remove on success
        console.log(`✅ Synced item ${item.id}`);
      } catch (e) {
        console.error(`❌ Failed to sync item ${item.id}`, e);
        // Increment retry or move to DLQ logic here
        const updated = { ...item, retryCount: item.retryCount + 1 };
        await cursor.update(updated);
      }

      cursor = await cursor.continue();
    }

    this.isSyncing = false;
  }

  /**
   * Generic Remote Pusher
   */
  private async pushToRemote(endpoint: string, method: string, payload: any) {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
    return res.json();
  }
}
