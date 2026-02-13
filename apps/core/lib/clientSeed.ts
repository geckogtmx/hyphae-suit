import { db, schema } from '@hyphae/database';
import {
    SUPPLIERS,
    INVENTORY_ITEMS,
    RECIPES,
    CONCEPTS,
    CATEGORIES,
    PRODUCTS
} from '@hyphae/database';

export const seedClientDatabase = async () => {
    console.log('🌱 Seeding Client-Side In-Memory Database...');

    try {
        // Seed Suppliers
        for (const supp of SUPPLIERS) {
            await db.insert(schema.suppliers).values(supp).onConflictDoNothing();
        }

        // Seed Inventory
        for (const item of INVENTORY_ITEMS) {
            await db.insert(schema.inventoryItems).values({
                ...item,
                preferredSupplierId: item.type === 'RAW' ? SUPPLIERS[0].id : null
            }).onConflictDoNothing();
        }

        // Seed Recipes
        for (const recipe of RECIPES) {
            const type = recipe.outputInventoryItemId ? 'BATCH' : 'ASSEMBLY';
            await db.insert(schema.recipes).values({
                ...recipe,
                type
            }).onConflictDoNothing();

            if (recipe.components) {
                for (const comp of recipe.components) {
                    await db.insert(schema.recipeIngredients).values({
                        id: `${recipe.id}_${comp.inventoryItemId}`,
                        recipeId: recipe.id,
                        inventoryItemId: comp.inventoryItemId,
                        quantity: comp.quantity,
                        unit: comp.unit
                    }).onConflictDoNothing();
                }
            }
        }

        // Seed Products & Categories
        for (const concept of CONCEPTS) {
            await db.insert(schema.concepts).values(concept).onConflictDoNothing();
        }
        for (const cat of CATEGORIES) {
            await db.insert(schema.categories).values(cat).onConflictDoNothing();
        }

        // Products (simplified for verify)
        for (const p of PRODUCTS) {
            await db.insert(schema.products).values({
                id: p.id,
                name: p.name,
                categoryId: p.categoryId,
                price: p.price,
                requiresMods: p.requiresMods,
                packagingSku: p.packaging?.sku,
                kitchenLabel: p.metadata?.kitchenLabel,
                recipeId: p.inventoryMetadata?.recipeId
            }).onConflictDoNothing();
        }

        console.log('✅ Client DB Seeded!');
    } catch (error) {
        console.error('❌ Client Seeding Failed:', error);
    }
};

