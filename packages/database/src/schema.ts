/**
 * @link e:\git\hyphae-pos\src\db\schema.ts
 * @author Hyphae POS Team
 * @description Comprehensive Drizzle ORM schema for the full Supply Chain (Market -> Prep -> Sales).
 * @version 2.0.0
 * @last-updated 2026-02-12
 */

import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// --- MARKET: SUPPLIERS & ORDERS ---

export const suppliers = sqliteTable('suppliers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  contactName: text('contact_name'),
  email: text('email'),
  phone: text('phone'),
  category: text('category').notNull(), // Produce, Meat, etc.
  leadTimeDays: integer('lead_time_days').default(0),
});

export const supplyOrders = sqliteTable('supply_orders', {
  id: text('id').primaryKey(),
  supplierId: text('supplier_id').notNull().references(() => suppliers.id),
  status: text('status').notNull().default('DRAFT'), // DRAFT, PLACED, RECEIVED
  placedAt: integer('placed_at'),
  receivedAt: integer('received_at'),
  totalCost: real('total_cost'),
});

export const supplyOrderItems = sqliteTable('supply_order_items', {
  id: text('id').primaryKey(),
  supplyOrderId: text('supply_order_id').notNull().references(() => supplyOrders.id),
  inventoryItemId: text('inventory_item_id').notNull(), // Linked to inventory
  quantityOrdered: real('quantity_ordered').notNull(),
  quantityReceived: real('quantity_received'),
  cost: real('cost'),
});

// --- STORAGE: INVENTORY ---

export const inventoryItems = sqliteTable('inventory_items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // RAW, PREP, READY
  stockUnit: text('stock_unit').notNull(), // lb, oz, count
  costPerUnit: real('cost_per_unit').notNull(),
  currentStock: real('current_stock').default(0),
  preferredSupplierId: text('preferred_supplier_id').references(() => suppliers.id),
});

export const inventoryTransactions = sqliteTable('inventory_transactions', {
  id: text('id').primaryKey(),
  inventoryItemId: text('inventory_item_id').notNull().references(() => inventoryItems.id),
  type: text('type').notNull(), // RECEIVE, PREP_USE, PREP_OUTPUT, SALE, WASTE, ADJUSTMENT
  quantity: real('quantity').notNull(), // Positive for Add, Negative for Remove
  reason: text('reason'),
  referenceId: text('reference_id'), // OrderID, SupplyOrderID, BatchID
  timestamp: integer('timestamp').notNull(),
});

// --- KITCHEN: PREP & RECIPES ---

export const recipes = sqliteTable('recipes', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull().default('BATCH'), // BATCH (Prep), ASSEMBLY (Sales)
  yieldQuantity: real('yield_quantity').notNull(),
  yieldUnit: text('yield_unit').notNull(),
  outputInventoryItemId: text('output_inventory_item_id').references(() => inventoryItems.id), // If Batch
  instructions: text('instructions'), // JSON string or text
});

export const recipeIngredients = sqliteTable('recipe_ingredients', {
  id: text('id').primaryKey(),
  recipeId: text('recipe_id').notNull().references(() => recipes.id),
  inventoryItemId: text('inventory_item_id').notNull().references(() => inventoryItems.id),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
});

// --- SALES: MENU & PRODUCTS ---

export const concepts = sqliteTable('concepts', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  color: text('color'),
});

export const categories = sqliteTable('categories', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  conceptId: text('concept_id').notNull().references(() => concepts.id),
});

export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: text('category_id').notNull().references(() => categories.id),
  price: real('price').notNull(),
  requiresMods: integer('requires_mods', { mode: 'boolean' }).default(false),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),

  // Metadata
  kitchenLabel: text('kitchen_label'),
  packagingSku: text('packaging_sku'),

  // Linked Assembly Recipe (for auto-depletion)
  recipeId: text('recipe_id').references(() => recipes.id),
});

export const modifierGroups = sqliteTable('modifier_groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  required: integer('required', { mode: 'boolean' }).default(false),
  multiSelect: integer('multi_select', { mode: 'boolean' }).default(false),
});

export const modifierOptions = sqliteTable('modifier_options', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull().references(() => modifierGroups.id),
  name: text('name').notNull(),
  price: real('price').default(0),
  kitchenLabel: text('kitchen_label'),
});

// Junction: Products <-> Modifier Groups
export const productModifiers = sqliteTable('product_modifiers', {
  id: text('id').primaryKey(),
  productId: text('product_id').notNull().references(() => products.id),
  modifierGroupId: text('modifier_group_id').notNull().references(() => modifierGroups.id),
  sortOrder: integer('sort_order').default(0),
});

// --- ORDERS (Sales Logs) ---

export const orders = sqliteTable('orders', {
  id: text('id').primaryKey(),
  storeId: text('store_id').notNull(),
  terminalId: text('terminal_id').notNull(),
  staffId: text('staff_id'),
  loyaltyProfileId: text('loyalty_profile_id').references(() => loyaltyProfiles.id),

  status: text('status').notNull().default('Pending'),
  paymentStatus: text('payment_status').notNull().default('Unpaid'),
  orderType: text('order_type').notNull().default('DineIn'),

  subtotal: real('subtotal').notNull(),
  tax: real('tax').notNull(),
  total: real('total').notNull(),

  createdAt: integer('created_at').notNull(),
  completedAt: integer('completed_at'),
});

export const payments = sqliteTable('payments', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  method: text('method').notNull(), // CASH, CARD, etc.
  amount: real('amount').notNull(),
  status: text('status').notNull(), // PENDING, COMPLETED, FAILED
  transactionId: text('transaction_id'),
  timestamp: integer('timestamp').notNull(),
});

export const orderItems = sqliteTable('order_items', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull().references(() => orders.id),
  productId: text('product_id').notNull().references(() => products.id),
  name: text('name').notNull(), // Snapshot
  price: real('price').notNull(), // Snapshot
  quantity: integer('quantity').default(1),
  modifiers: text('modifiers'), // JSON snapshot of selected mods
});

// --- AUTH: USERS ---

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  pin: text('pin').notNull(), // Hashed or Encrypted
  role: text('role').notNull().default('staff'), // admin, manager, staff
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
});

export const loyaltyProfiles = sqliteTable('loyalty_profiles', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  phone: text('phone'),
  cardNumber: text('card_number').notNull().unique(),
  currentPoints: real('current_points').default(0),
  totalPunches: integer('total_punches').default(0),
  currentTierId: text('current_tier_id').notNull().default('tier_bronze'),
  createdAt: integer('created_at').notNull(),
});

export const loyaltyTransactions = sqliteTable('loyalty_transactions', {
  id: text('id').primaryKey(),
  profileId: text('profile_id').notNull().references(() => loyaltyProfiles.id),
  type: text('type').notNull(), // EARN, REDEEM, ADJUST
  points: real('points').notNull(),
  orderId: text('order_id').references(() => orders.id),
  timestamp: integer('timestamp').notNull(),
});

// --- RELATIONS ---

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  orders: many(supplyOrders),
  inventoryItems: many(inventoryItems),
}));

export const inventoryItemsRelations = relations(inventoryItems, ({ one, many }) => ({
  supplier: one(suppliers, {
    fields: [inventoryItems.preferredSupplierId],
    references: [suppliers.id],
  }),
  transactions: many(inventoryTransactions),
  recipeUsage: many(recipeIngredients), // As an ingredient
}));

export const recipesRelations = relations(recipes, ({ many }) => ({
  ingredients: many(recipeIngredients),
}));

export const recipeIngredientsRelations = relations(recipeIngredients, ({ one }) => ({
  recipe: one(recipes, {
    fields: [recipeIngredients.recipeId],
    references: [recipes.id],
  }),
  inventoryItem: one(inventoryItems, {
    fields: [recipeIngredients.inventoryItemId],
    references: [inventoryItems.id],
  }),
}));

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  recipe: one(recipes, {
    fields: [products.recipeId],
    references: [recipes.id],
  }),
  modifierGroups: many(productModifiers),
}));

export const productModifiersRelations = relations(productModifiers, ({ one }) => ({
  product: one(products, {
    fields: [productModifiers.productId],
    references: [products.id],
  }),
  group: one(modifierGroups, {
    fields: [productModifiers.modifierGroupId],
    references: [modifierGroups.id],
  }),
}));

export const modifierGroupsRelations = relations(modifierGroups, ({ many }) => ({
  options: many(modifierOptions),
}));

export const modifierOptionsRelations = relations(modifierOptions, ({ one }) => ({
  group: one(modifierGroups, {
    fields: [modifierOptions.groupId],
    references: [modifierGroups.id],
  }),
}));

export const ordersRelations = relations(orders, ({ many }) => ({
  items: many(orderItems),
  payments: many(payments),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export const loyaltyProfilesRelations = relations(loyaltyProfiles, ({ many }) => ({
  transactions: many(loyaltyTransactions),
}));

export const loyaltyTransactionsRelations = relations(loyaltyTransactions, ({ one }) => ({
  profile: one(loyaltyProfiles, {
    fields: [loyaltyTransactions.profileId],
    references: [loyaltyProfiles.id],
  }),
  order: one(orders, {
    fields: [loyaltyTransactions.orderId],
    references: [orders.id],
  }),
}));
