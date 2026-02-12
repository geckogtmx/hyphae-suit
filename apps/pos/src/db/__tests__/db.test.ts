import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { menuItems, orders } from '../schema';
import { eq, sql } from 'drizzle-orm';

const testClient = createClient({ url: 'file::memory:' });
const db = drizzle(testClient);

describe('Database Integration', () => {
  beforeEach(async () => {
    // Initialize tables in memory
    await testClient.execute(`
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
        loyalty_snapshot TEXT
      )
    `);

    await testClient.execute(`
      CREATE TABLE IF NOT EXISTS menu_items (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category_id TEXT NOT NULL,
        price REAL NOT NULL,
        requires_mods INTEGER NOT NULL DEFAULT 0,
        modifier_groups TEXT,
        metadata TEXT,
        packaging TEXT,
        inventory_metadata TEXT,
        is_available INTEGER NOT NULL DEFAULT 1
      )
    `);

    // Clean up test data
    await db.delete(menuItems);
    await db.delete(orders);
  });

  it('should write and read menu items', async () => {
    const item = {
      id: 'test-item-1',
      name: 'Test Burger',
      categoryId: 'burgers',
      price: 12.99,
      requiresMods: false,
      isAvailable: true,
      modifierGroups: null,
      metadata: null,
      packaging: null,
      inventoryMetadata: null,
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
      table: 'Counter',
      time: '12:00 PM',
      storeId: 'store-1',
      terminalId: 'term-1',
      staffId: 'staff-1',
      createdAt: fixedTimestamp,
      cookingStartedAt: null,
      readyAt: null,
      completedAt: null,
      updatedAt: fixedTimestamp,
      items: '[]',
      subtotal: 20.0,
      tax: 1.6,
      total: 21.6,
      amountPaid: 21.6,
      status: 'Pending',
      paymentStatus: 'Paid',
      orderType: 'DineIn',
      confirmationNumber: null,
      tenderedAmount: null,
      tipAmount: null,
      isLoyalty: false,
      loyaltySnapshot: null,
    };

    await db.insert(orders).values(order);

    const result = await db.select().from(orders).where(eq(orders.id, 'order-1'));
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(order);
  });
});
