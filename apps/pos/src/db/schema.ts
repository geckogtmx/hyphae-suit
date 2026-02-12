/**
 * @link e:\git\hyphae-pos\src\db\schema.ts
 * @author Hyphae POS Team
 * @description Drizzle ORM database schema definitions.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  table: text('table').notNull().default('Counter'),
  time: text('time').notNull(),

  // System Info
  storeId: text('store_id').notNull(),
  terminalId: text('terminal_id').notNull(),
  staffId: text('staff_id').notNull(),

  // Timestamps
  createdAt: integer('created_at').notNull(),
  cookingStartedAt: integer('cooking_started_at'),
  readyAt: integer('ready_at'),
  completedAt: integer('completed_at'),
  updatedAt: integer('updated_at').notNull(),

  // Financials
  items: text('items').notNull(), // JSON
  subtotal: real('subtotal').notNull(),
  tax: real('tax').notNull(),
  total: real('total').notNull(),
  amountPaid: real('amount_paid').notNull(),

  // Status
  status: text('status').notNull().default('Pending'),
  paymentStatus: text('payment_status').notNull().default('Unpaid'),
  orderType: text('order_type').notNull().default('DineIn'),

  // Payment Extras
  confirmationNumber: text('confirmation_number'),
  tenderedAmount: real('tendered_amount'),
  tipAmount: real('tip_amount'),

  // Loyalty
  isLoyalty: integer('is_loyalty', { mode: 'boolean' }),
  loyaltySnapshot: text('loyalty_snapshot'), // JSON
});

export const menuItems = sqliteTable('menu_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: text('category_id').notNull(),
  price: real('price').notNull(),
  requiresMods: integer('requires_mods', { mode: 'boolean' }).notNull().default(false),

  // Composed Fields (JSON)
  modifierGroups: text('modifier_groups'),
  metadata: text('metadata'),
  packaging: text('packaging'),
  inventoryMetadata: text('inventory_metadata'),

  isAvailable: integer('is_available', { mode: 'boolean' }).notNull().default(true),
});
