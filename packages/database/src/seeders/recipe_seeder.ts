import { db, schema, eq } from '../index';
import { randomUUID } from 'crypto';

async function seedRecipes() {
    console.log('🌱 Seeding Complex Burger Recipes...');

    // 1. Ensure Inventory Items exist
    const items = [
        { id: 'inv_veggie_patty', name: 'Portobello Veggie Patty', type: 'RAW', stockUnit: 'count', costPerUnit: 1.5, currentStock: 50 },
        { id: 'inv_ketchup', name: 'Ketchup (Standard)', type: 'RAW', stockUnit: 'oz', costPerUnit: 0.1, currentStock: 500 },
        { id: 'inv_mayo', name: 'Mayo (Premium)', type: 'RAW', stockUnit: 'oz', costPerUnit: 0.15, currentStock: 500 },
        { id: 'inv_mustard', name: 'Yellow Mustard', type: 'RAW', stockUnit: 'oz', costPerUnit: 0.05, currentStock: 400 },
        { id: 'inv_potato_bun', name: 'Potato Bun', type: 'RAW', stockUnit: 'count', costPerUnit: 0.8, currentStock: 100 },
        { id: 'inv_lettuce_leaf', name: 'Bibb Lettuce Leaf', type: 'RAW', stockUnit: 'count', costPerUnit: 0.2, currentStock: 150 },
        { id: 'inv_house_sauce_batch', name: 'Hyphae House Sauce (Batch)', type: 'PREP', stockUnit: 'qt', costPerUnit: 4.5, currentStock: 10 },
    ];

    for (const item of items) {
        const existing = await db.query.inventoryItems.findFirst({ where: eq(schema.inventoryItems.id, item.id) });
        if (!existing) {
            await db.insert(schema.inventoryItems).values(item);
            console.log(`+ Added Inventory: ${item.name}`);
        }
    }

    // 2. Define Complex Recipes
    const complexRecipes = [
        {
            id: 'recipe_house_sauce',
            name: 'Hyphae House Sauce (5L Batch)',
            type: 'BATCH' as const,
            category: 'sauce' as const,
            yieldQuantity: 5,
            yieldUnit: 'qt' as const,
            activeTimeMinutes: 15,
            totalTimeMinutes: 30,
            outputInventoryItemId: 'inv_house_sauce_batch',
            equipment: 'Blender, Mixing Bowl',
            storageInstructions: 'Refrigerate in airtight container',
            shelfLifeDays: 7,
            ingredients: [
                { id: 'inv_mayo', qty: 3, unit: 'qt' },
                { id: 'inv_ketchup', qty: 1, unit: 'qt' },
                { id: 'inv_mustard', qty: 0.5, unit: 'qt' },
                { id: 'inv_onion_red', qty: 0.2, unit: 'kg' },
            ],
            steps: [
                { num: 1, text: 'Finely mince red onions', type: 'active', mins: 10 },
                { num: 2, text: 'Combine mayo, ketchup, and mustard in bowl', type: 'active', mins: 5 },
                { num: 3, text: 'Fold in minced onions', type: 'active', mins: 5 },
                { num: 4, text: 'Chill for 10 minutes to set flavor', type: 'passive', mins: 10, checkpoint: true },
            ]
        },
        {
            id: 'recipe_burger_og',
            name: 'The OG Classic Burger (Assembly)',
            type: 'ASSEMBLY' as const,
            category: 'assembly' as const,
            yieldQuantity: 1,
            yieldUnit: 'count' as const,
            activeTimeMinutes: 5,
            totalTimeMinutes: 8,
            equipment: 'Flat-top Grill, Toaster',
            ingredients: [
                { id: 'inv_brioche_bun', qty: 1, unit: 'count' },
                { id: 'inv_beef_patty', qty: 1, unit: 'count' },
                { id: 'inv_american_slice', qty: 1, unit: 'count' },
                { id: 'inv_lettuce_leaf', qty: 2, unit: 'count' },
                { id: 'inv_tomato', qty: 2, unit: 'slices' },
                { id: 'inv_ketchup', qty: 0.5, unit: 'oz' },
                { id: 'inv_mayo', qty: 0.5, unit: 'oz' },
            ],
            steps: [
                { num: 1, text: 'Toast brioche bun until golden', type: 'active', mins: 1 },
                { num: 2, text: 'Sear patty on high heat, season with salt', type: 'active', mins: 3 },
                { num: 3, text: 'Apply cheese and melt under dome', type: 'passive', mins: 1 },
                { num: 4, text: 'Layer: Mayo on bottom, Lettuce, Tomato, Patty, Ketchup on top', type: 'active', mins: 1 },
            ]
        },
        {
            id: 'recipe_burger_veggie',
            name: 'Garden Gate Veggie Burger (Assembly)',
            type: 'ASSEMBLY' as const,
            category: 'assembly' as const,
            yieldQuantity: 1,
            yieldUnit: 'count' as const,
            activeTimeMinutes: 6,
            totalTimeMinutes: 10,
            equipment: 'Flat-top Grill, Toaster',
            ingredients: [
                { id: 'inv_potato_bun', qty: 1, unit: 'count' },
                { id: 'inv_veggie_patty', qty: 1, unit: 'count' },
                { id: 'inv_american_slice', qty: 1, unit: 'count' },
                { id: 'inv_lettuce_leaf', qty: 2, unit: 'count' },
                { id: 'inv_house_sauce_batch', qty: 1, unit: 'oz' },
            ],
            steps: [
                { num: 1, text: 'Toast potato bun', type: 'active', mins: 1 },
                { num: 2, text: 'Grill veggie patty, ensure internal temp 165F', type: 'active', mins: 4 },
                { num: 3, text: 'Melt cheese on patty', type: 'passive', mins: 1 },
                { num: 4, text: 'Layer: House Sauce on both buns, Lettuce, Patty', type: 'active', mins: 1 },
            ]
        }
    ];

    for (const r of complexRecipes) {
        // Upsert Recipe
        await db.insert(schema.recipes).values({
            id: r.id,
            name: r.name,
            type: r.type,
            category: r.category,
            yieldQuantity: r.yieldQuantity,
            yieldUnit: r.yieldUnit,
            activeTimeMinutes: r.activeTimeMinutes,
            totalTimeMinutes: r.totalTimeMinutes,
            outputInventoryItemId: r.outputInventoryItemId,
            equipment: r.equipment,
            storageInstructions: r.storageInstructions,
            shelfLifeDays: r.shelfLifeDays
        }).onConflictDoUpdate({
            target: schema.recipes.id,
            set: {
                name: r.name,
                type: r.type,
                category: r.category,
                yieldQuantity: r.yieldQuantity,
                yieldUnit: r.yieldUnit,
                activeTimeMinutes: r.activeTimeMinutes,
                totalTimeMinutes: r.totalTimeMinutes,
                outputInventoryItemId: r.outputInventoryItemId,
                equipment: r.equipment,
                storageInstructions: r.storageInstructions,
                shelfLifeDays: r.shelfLifeDays
            }
        });

        // Clear and Re-add Ingredients
        await db.delete(schema.recipeIngredients).where(eq(schema.recipeIngredients.recipeId, r.id));
        for (const ing of r.ingredients) {
            await db.insert(schema.recipeIngredients).values({
                id: randomUUID(),
                recipeId: r.id,
                inventoryItemId: ing.id,
                quantity: ing.qty,
                unit: ing.unit
            });
        }

        // Clear and Re-add Steps
        await db.delete(schema.recipeSteps).where(eq(schema.recipeSteps.recipeId, r.id));
        for (const step of r.steps) {
            const castStep = step as any;
            await db.insert(schema.recipeSteps).values({
                id: randomUUID(),
                recipeId: r.id,
                stepNumber: step.num,
                instruction: step.text,
                type: step.type as any,
                durationMinutes: step.mins,
                isCheckpoint: castStep.checkpoint || false
            });
        }

        console.log(`+ Processed Recipe: ${r.name}`);
    }

    // 3. Link Recipes to Products (Update existing products if needed)
    const productsToUpdate = [
        { name: 'House Burger', recipeId: 'recipe_burger_og' },
        { name: 'Veggie Bloom', recipeId: 'recipe_burger_veggie' }
    ];

    for (const p of productsToUpdate) {
        await db.update(schema.products)
            .set({ recipeId: p.recipeId })
            .where(eq(schema.products.name, p.name));
        console.log(`+ Linked Product ${p.name} to ${p.recipeId}`);
    }

    console.log('✅ Seeding Complete!');
}

seedRecipes().catch(console.error);
