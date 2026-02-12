/**
 * @link e:\git\hyphae-pos\src\lib\indexedDB.ts
 * @author Hyphae POS Team
 * @description IndexedDB wrapper using 'idb' library for offline persistence.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Product, SavedOrder } from '../types';

export interface SyncQueueItem {
  id?: number;
  endpoint: string;
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  payload: any;
  timestamp: number;
  retryCount: number;
}

interface HyphaeDB extends DBSchema {
  products: {
    key: string;
    value: Product;
  };
  orders: {
    key: string;
    value: SavedOrder;
    indexes: { 'by-status': string; 'by-created': number };
  };
  sync_queue: {
    key: number;
    value: SyncQueueItem;
    autoIncrement: true;
  };
  config: {
    key: string;
    value: any;
  };
}

const DB_NAME = 'hyphae_db_v1';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<HyphaeDB>>;

export const initDB = () => {
  if (!dbPromise) {
    dbPromise = openDB<HyphaeDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('products')) {
          db.createObjectStore('products', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('orders')) {
          const store = db.createObjectStore('orders', { keyPath: 'id' });
          store.createIndex('by-status', 'status');
          store.createIndex('by-created', 'createdAt');
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('config')) {
          db.createObjectStore('config');
        }
      },
    });
  }
  return dbPromise;
};

export const getDB = () => initDB();
