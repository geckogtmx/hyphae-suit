import initSqlJs from 'sql.js';
import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { products as menuItems, orders } from '@hyphae/database';
import { eq } from 'drizzle-orm';

describe('Database Integration', () => {
  let db: any;
  let rawDb: any;

  beforeAll(async () => {
    const SQL = await initSqlJs();
    rawDb = new SQL.Database();

    db = drizzle(
      async (sql, params, method) => {
        try {
          if (method === 'run') {
            rawDb.run(sql, params as any[]);
            return { rows: [] };
          }
          const stmt = rawDb.prepare(sql);
          stmt.bind(params as any[]);
          const rows: any[][] = [];
          while (stmt.step()) {
            rows.push(stmt.get());
          }
          stmt.free();
          return { rows };
        } catch (e: any) {
          throw e;
        }
      }
    );
  });

  beforeEach(async () => {
    // Initialize tables in memory
    rawDb.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        "table" TEXT NOT NULL DEFAULT 'Counter',
        time TEXT NOT NULL,
        store_id TEXT NOT NULL,
        terminal_id TEXT NOT NULL,
        staff_id TEXT NOT NULL,
        created_at INTEGER NOT NULL,
        cooking_started_at INTEGER,
        ready_at INTEGER,
        completed_at INTEGER,
        updated_at INTEGER NOT NULL,
        synced_at INTEGER,
        items TEXT NOT NULL,
        subtotal REAL NOT NULL,
        tax REAL NOT NULL,
        total REAL NOT NULL,
        amount_paid REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        payment_status TEXT NOT NULL DEFAULT 'Unpaid',
        order_type TEXT NOT NULL DEFAULT 'DineIn',
        confirmation_number TEXT,
        tendered_amount REAL,
        tip_amount REAL,
        is_loyalty INTEGER,
        loyalty_snapshot TEXT,
        loyalty_profile_id TEXT
      )
    `);

    rawDb.run(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category_id TEXT NOT NULL,
        price REAL NOT NULL,
        requires_mods INTEGER NOT NULL DEFAULT 0,
        is_active INTEGER NOT NULL DEFAULT 1,
        kitchen_label TEXT,
        packaging_sku TEXT,
        recipe_id TEXT NOT NULL,
        inventory_item_id TEXT,
        updated_at INTEGER NOT NULL DEFAULT 0,
        deleted_at INTEGER
      )
    `);

    // Clean up test data
    await db.delete(menuItems);
    await db.delete(orders);
  });

  afterAll(() => {
    if (rawDb) {
      rawDb.close();
    }
  });

  it('should write and read menu items', async () => {
    const item = {
      id: 'test-item-1',
      name: 'Test Burger',
      categoryId: 'burgers',
      price: 12.99,
      requiresMods: false,
      isActive: true,
      recipeId: 'recipe-1',
      kitchenLabel: null,
      packagingSku: null,
      inventoryItemId: null,
      updatedAt: 0,
      deletedAt: null
    };

    await db.insert(menuItems).values(item);

    const result = await db.select().from(menuItems).where(eq(menuItems.id, 'test-item-1'));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(item);
  });

  it('should write and read orders', async () => {
    const fixedTimestamp = 1705420800000;
    const order = {
      id: 'order-1',
      storeId: 'store-1',
      terminalId: 'term-1',
      staffId: 'staff-1',
      createdAt: fixedTimestamp,
      completedAt: null,
      syncedAt: null,
      subtotal: 20.0,
      tax: 1.6,
      total: 21.6,
      status: 'Pending',
      paymentStatus: 'Paid',
      orderType: 'DineIn',
      loyaltyProfileId: null
    };

    await db.insert(orders).values(order);

    const result = await db.select().from(orders).where(eq(orders.id, 'order-1'));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(order);
  });
});
