
/**
 * @link packages/database/src/seed.ts
 * @author Hyphae POS Team
 * @description Seed script to populate the full Supply Chain DB.
 * @version 2.0.0
 */

import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './index';
import * as schema from './schema';
import {
  SUPPLIERS,
  INVENTORY_ITEMS,
  RECIPES,
  CONCEPTS,
  CATEGORIES,
  PRODUCTS
} from './mock_data';
import { eq } from 'drizzle-orm';
import { generateMockOrders } from './seed_orders';

const seed = async () => {
  console.log('🌱 Starting Supply Chain Seeding...');

  try {
    // 1. Clean Database (optional, or just rely on upserts)
    // For now, let's just insert.

    // 2. Seed Suppliers
    console.log(`📦 Seeding ${SUPPLIERS.length} Suppliers...`);
    for (const supp of SUPPLIERS) {
      await db.insert(schema.suppliers).values({
        id: supp.id,
        name: supp.name,
        contactName: supp.contactName,
        email: supp.email,
        phone: supp.phone,
        category: supp.category,
        leadTimeDays: supp.leadTimeDays
      }).onConflictDoNothing();
    }

    // 3. Seed Inventory (Ingredients) - Raw Materials
    console.log(`🥕 Seeding ${INVENTORY_ITEMS.length} Inventory Items...`);
    for (const item of INVENTORY_ITEMS) {
      // Find a supplier if not explicitly linked in mock
      const supplierId = item.type === 'RAW' ? SUPPLIERS[0].id : null;

      await db.insert(schema.inventoryItems).values({
        id: item.id,
        name: item.name,
        type: item.type,
        stockUnit: item.stockUnit,
        costPerUnit: item.costPerUnit,
        preferredSupplierId: supplierId
      }).onConflictDoNothing();
    }

    // 4. Seed Recipes (Prep & Assembly)
    console.log(`👨‍🍳 Seeding ${RECIPES.length} Recipes...`);
    for (const recipe of RECIPES) {
      await db.insert(schema.recipes).values({
        id: recipe.id,
        name: recipe.name,
        type: recipe.outputInventoryItemId ? 'BATCH' : 'ASSEMBLY',
        yieldQuantity: recipe.yieldQuantity,
        yieldUnit: recipe.yieldUnit,
        outputInventoryItemId: recipe.outputInventoryItemId,
      }).onConflictDoNothing();

      // Seed Ingredients
      if (recipe.components) {
        for (const comp of recipe.components) {
          const compId = `${recipe.id}_${comp.inventoryItemId}`;
          await db.insert(schema.recipeIngredients).values({
            id: compId,
            recipeId: recipe.id,
            inventoryItemId: comp.inventoryItemId,
            quantity: comp.quantity,
            unit: comp.unit
          }).onConflictDoNothing();
        }
      }
    }

    // 5. Seed Menu Hierarchy
    console.log(`📑 Seeding Menu Hierarchy...`);
    for (const concept of CONCEPTS) {
      await db.insert(schema.concepts).values({
        id: concept.id,
        name: concept.name,
        color: concept.color
      }).onConflictDoNothing();
    }

    for (const cat of CATEGORIES) {
      await db.insert(schema.categories).values({
        id: cat.id,
        name: cat.name,
        conceptId: cat.conceptId
      }).onConflictDoNothing();
    }

    // 6. Seed Modifiers & Products
    const modifierGroupsMap = new Map();
    const modifierOptionsMap = new Map();

    PRODUCTS.forEach(p => {
      p.modifierGroups?.forEach(group => {
        modifierGroupsMap.set(group.id, group);
        group.options.forEach(opt => modifierOptionsMap.set(opt.id, { ...opt, groupId: group.id }));
      });
    });

    console.log(`🧂 Seeding ${modifierGroupsMap.size} Modifier Groups...`);
    for (const [id, group] of modifierGroupsMap) {
      await db.insert(schema.modifierGroups).values({
        id: group.id,
        name: group.name,
        required: group.required,
        multiSelect: group.multiSelect
      }).onConflictDoNothing();
    }

    console.log(`🌶️ Seeding ${modifierOptionsMap.size} Modifier Options...`);
    for (const [id, opt] of modifierOptionsMap) {
      await db.insert(schema.modifierOptions).values({
        id: opt.id,
        groupId: opt.groupId,
        name: opt.name,
        price: opt.price,
        kitchenLabel: opt.metadata?.kitchenLabel
      }).onConflictDoNothing();
    }

    console.log(`🍔 Seeding ${PRODUCTS.length} Products...`);
    for (const p of PRODUCTS) {
      const recipeId = p.inventoryMetadata?.recipeId;

      await db.insert(schema.products).values({
        id: p.id,
        name: p.name,
        categoryId: p.categoryId,
        price: p.price,
        requiresMods: p.requiresMods,
        packagingSku: p.packaging?.sku,
        kitchenLabel: p.metadata?.kitchenLabel,
        recipeId: recipeId
      }).onConflictDoNothing();

      // Link Modifiers
      if (p.modifierGroups) {
        let sortOrder = 0;
        for (const group of p.modifierGroups) {
          const linkId = `${p.id}_${group.id}`;
          await db.insert(schema.productModifiers).values({
            id: linkId,
            productId: p.id,
            modifierGroupId: group.id,
            sortOrder: sortOrder++
          }).onConflictDoNothing();
        }
      }
    }

    // 7. Initial Supply Transaction ("Big Bang")
    console.log(`🚚 Creating Initial Supply Received Log...`);
    const initialOrderId = 'so_init_001';
    await db.insert(schema.supplyOrders).values({
      id: initialOrderId,
      supplierId: SUPPLIERS[0].id,
      status: 'RECEIVED',
      placedAt: Date.now() - 86400000,
      receivedAt: Date.now(),
      totalCost: 0
    }).onConflictDoNothing();

    for (const item of INVENTORY_ITEMS) {
      if (item.type === 'RAW') {
        await db.insert(schema.supplyOrderItems).values({
          id: `${initialOrderId}_${item.id}`,
          supplyOrderId: initialOrderId,
          inventoryItemId: item.id,
          quantityOrdered: 100,
          quantityReceived: 100,
          cost: item.costPerUnit * 100
        }).onConflictDoNothing();

        await db.insert(schema.inventoryTransactions).values({
          id: `tx_init_${item.id}`,
          inventoryItemId: item.id,
          type: 'RECEIVE',
          quantity: 100,
          reason: 'Initial Stock',
          referenceId: initialOrderId,
          timestamp: Date.now()
        }).onConflictDoNothing();

        await db.update(schema.inventoryItems)
          .set({ currentStock: 100 })
          .where(eq(schema.inventoryItems.id, item.id));
      }
    }

    console.log('✅ Supply Chain Seeding Complete!');

    // 8. Seed Users
    console.log(`👤 Seeding Users...`);
    const MOCK_USERS = [
      { id: 'u_admin', name: 'Admin User', pin: '0000', role: 'admin' },
      { id: 'u_staff', name: 'Staff Member', pin: '1234', role: 'staff' },
      { id: 'u_mgr', name: 'Manager', pin: '9999', role: 'manager' }
    ];

    for (const u of MOCK_USERS) {
      await db.insert(schema.users).values(u).onConflictDoNothing();
    }

    // 9. Generate Historical Orders (For Dashboard/Analysis)
    await generateMockOrders(30);

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
