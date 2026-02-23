/**
 * @author Hyphae POS Team
 * @description sql.js schema bootstrap — creates all tables the POS needs in the in-memory DB.
 *   This runs once on boot before the SyncEngine pulls data from Core.
 *   Using plain SQL DDL (not Drizzle migrations) because the DB is ephemeral (in-memory).
 *   The SyncEngine will UPSERT all data after this; table existence is all that matters here.
 * @version 1.0.0
 * @last-updated 2026-02-23
 */

import { getSqlJsDb } from './sqljs';

const SCHEMA_DDL = `
PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;

-- Lookup / Sync tables (populated by SyncEngine.pullSnapshot)
CREATE TABLE IF NOT EXISTS suppliers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT,
  phone TEXT,
  category TEXT NOT NULL,
  lead_time_days INTEGER DEFAULT 0,
  updated_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  stock_unit TEXT NOT NULL,
  cost_per_unit REAL NOT NULL,
  stock_kitchen REAL DEFAULT 0,
  stock_stand REAL DEFAULT 0,
  preferred_supplier_id TEXT REFERENCES suppliers(id),
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  concept_id TEXT,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS modifier_groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  required INTEGER DEFAULT 0,
  multi_select INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS modifier_options (
  id TEXT PRIMARY KEY,
  group_id TEXT REFERENCES modifier_groups(id),
  name TEXT NOT NULL,
  price REAL DEFAULT 0,
  kitchen_label TEXT,
  recipe_id TEXT,
  inventory_item_id TEXT,
  updated_at INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category_id TEXT,
  price REAL NOT NULL,
  is_active INTEGER DEFAULT 1,
  requires_mods INTEGER DEFAULT 0,
  packaging_sku TEXT,
  kitchen_label TEXT,
  recipe_id TEXT,
  inventory_item_id TEXT,
  updated_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS product_modifiers (
  id TEXT PRIMARY KEY,
  product_id TEXT REFERENCES products(id),
  group_id TEXT REFERENCES modifier_groups(id),
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  pin_hash TEXT,
  updated_at INTEGER NOT NULL DEFAULT 0,
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS loyalty_profiles (
  id TEXT PRIMARY KEY,
  card_number TEXT,
  customer_name TEXT,
  phone TEXT,
  current_points INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  current_tier_id TEXT,
  is_physical_card INTEGER DEFAULT 0,
  created_at INTEGER,
  updated_at INTEGER NOT NULL DEFAULT 0
);

-- Transaction tables (written by POS, pushed by SyncEngine)
CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  store_id TEXT,
  terminal_id TEXT,
  staff_id TEXT,
  loyalty_profile_id TEXT,
  status TEXT NOT NULL DEFAULT 'Pending',
  payment_status TEXT DEFAULT 'UNPAID',
  order_type TEXT DEFAULT 'dine_in',
  subtotal REAL,
  tax REAL,
  total REAL,
  created_at INTEGER,
  completed_at INTEGER,
  synced_at INTEGER
);

CREATE TABLE IF NOT EXISTS order_items (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  product_id TEXT,
  name TEXT,
  price REAL,
  quantity INTEGER DEFAULT 1,
  modifiers TEXT
);

CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY,
  order_id TEXT REFERENCES orders(id),
  method TEXT NOT NULL,
  amount REAL NOT NULL,
  status TEXT DEFAULT 'COMPLETED',
  transaction_id TEXT,
  timestamp INTEGER NOT NULL
);
`;

export async function runMigrations(): Promise<void> {
    console.log('📦 Running POS schema bootstrap...');
    const sqlJsDb = getSqlJsDb();
    if (!sqlJsDb) throw new Error('[Migrations] sql.js DB not available — call initDb() first');

    sqlJsDb.run(SCHEMA_DDL);
    console.log('✅ Schema bootstrap complete.');
}
