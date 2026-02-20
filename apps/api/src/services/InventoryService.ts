/**
 * @author Hyphae POS Team
 * @description Service for managing inventory levels and depletion logic.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

import { db, schema, eq, sql } from '@hyphae/database';
import { socketService } from './SocketService';

export class InventoryService {
    /**
     * Deducts inventory based on an order's items.
     * Processes each product, finds its assembly recipe, and depletes associated ingredients.
     * Deducts from STAND/FOH inventory.
     */
    static async deductOrderInventory(orderId: string, items: any[]) {
        console.log(`[Inventory] Processing depletion for order ${orderId} (STAND)...`);

        await db.transaction(async (tx) => {
            for (const item of items) {
                try {
                    const product = await tx.query.products.findFirst({
                        where: eq(schema.products.id, item.productId),
                        with: {
                            recipe: {
                                with: {
                                    ingredients: true
                                }
                            }
                        }
                    });

                    if (!product || !product.recipe) {
                        console.warn(`[Inventory] No recipe found for product: ${item.name} (${item.productId})`);
                        continue;
                    }

                    const quantity = item.quantity || 1;

                    // Deduct from STAND Inventory
                    for (const ingredient of product.recipe.ingredients) {
                        const totalDeduction = ingredient.quantity * quantity;

                        await tx.update(schema.inventoryItems)
                            .set({
                                stockStand: sql`${schema.inventoryItems.stockStand} - ${totalDeduction}`
                            })
                            .where(eq(schema.inventoryItems.id, ingredient.inventoryItemId));

                        await tx.insert(schema.inventoryTransactions).values({
                            id: `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                            inventoryItemId: ingredient.inventoryItemId,
                            type: 'SALE',
                            quantity: -totalDeduction,
                            reason: `Order Sale: ${orderId} (Stand)`,
                            referenceId: orderId,
                            timestamp: Date.now()
                        });

                        // Emit update (we need to fetch the item again to get latest stock)
                        const updatedItem = await tx.query.inventoryItems.findFirst({
                            where: eq(schema.inventoryItems.id, ingredient.inventoryItemId)
                        });

                        if (updatedItem) {
                            socketService.emit('inventory:updated', {
                                id: updatedItem.id,
                                stockKitchen: updatedItem.stockKitchen,
                                stockStand: updatedItem.stockStand
                            });
                        }
                    }
                } catch (err) {
                    console.error(`[Inventory] Failed to deduct inventory for item ${item.name}:`, err);
                    throw err;
                }
            }
        });
    }

    /**
     * Processes a Batch Recipe execution (Cooking/Prep).
     * 1. Deducts raw ingredients from KITCHEN.
     * 2. Adds finished prep item to KITCHEN.
     */
    static async produceBatch(recipeId: string, quantityProduced: number) {
        console.log(`[Inventory] Producing batch for recipe ${recipeId} (Qty: ${quantityProduced})...`);

        return await db.transaction(async (tx) => {
            const recipe = await tx.query.recipes.findFirst({
                where: eq(schema.recipes.id, recipeId),
                with: {
                    ingredients: true
                }
            });

            if (!recipe) throw new Error('Recipe not found');
            if (recipe.type !== 'BATCH') throw new Error('Only BATCH recipes can be produced via this method');
            if (!recipe.outputInventoryItemId) throw new Error('Batch recipe has no output inventory item defined');

            const batchMultiplier = quantityProduced / recipe.yieldQuantity;

            // 1. Deduct Ingredients from KITCHEN
            for (const ingredient of recipe.ingredients) {
                const totalDeduction = ingredient.quantity * batchMultiplier;

                await tx.update(schema.inventoryItems)
                    .set({
                        stockKitchen: sql`${schema.inventoryItems.stockKitchen} - ${totalDeduction}`
                    })
                    .where(eq(schema.inventoryItems.id, ingredient.inventoryItemId));

                await tx.insert(schema.inventoryTransactions).values({
                    id: `tx_use_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                    inventoryItemId: ingredient.inventoryItemId,
                    type: 'USAGE',
                    quantity: -totalDeduction,
                    reason: `Batch Prep: ${recipe.name}`,
                    referenceId: recipeId,
                    timestamp: Date.now()
                });
            }

            // 2. Add Output to KITCHEN
            await tx.update(schema.inventoryItems)
                .set({
                    stockKitchen: sql`${schema.inventoryItems.stockKitchen} + ${quantityProduced}`
                })
                .where(eq(schema.inventoryItems.id, recipe.outputInventoryItemId));

            await tx.insert(schema.inventoryTransactions).values({
                id: `tx_prod_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                inventoryItemId: recipe.outputInventoryItemId,
                type: 'PRODUCTION',
                quantity: quantityProduced,
                reason: `Batch Complete: ${recipe.name}`,
                referenceId: recipeId,
                timestamp: Date.now()
            });

            return { success: true, produced: quantityProduced };
        });
    }

    /**
     * Receives new stock from a supplier into KITCHEN.
     */
    static async receiveInventory(itemId: string, quantity: number, cost: number, supplierId: string = 'unknown') {
        console.log(`[Inventory] Receiving ${quantity} of ${itemId} into Dictionary...`);

        return await db.transaction(async (tx) => {
            await tx.update(schema.inventoryItems)
                .set({
                    stockKitchen: sql`${schema.inventoryItems.stockKitchen} + ${quantity}`,
                    costPerUnit: cost
                })
                .where(eq(schema.inventoryItems.id, itemId));

            await tx.insert(schema.inventoryTransactions).values({
                id: `tx_rcv_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                inventoryItemId: itemId,
                type: 'RECEIPT',
                quantity: quantity,
                reason: `Received from Supplier`,
                referenceId: supplierId,
                timestamp: Date.now()
            });

            return { success: true };
        });
    }

    /**
     * Transfers inventory between Kitchen and Stand.
     * direction: 'EXIT' (Kitchen -> Stand) | 'INGRESS' (Stand -> Kitchen)
     */
    static async transferInventory(itemId: string, quantity: number, direction: 'EXIT' | 'INGRESS', note?: string) {
        console.log(`[Inventory] Transfer ${direction} - Item: ${itemId}, Qty: ${quantity}`);

        return await db.transaction(async (tx) => {
            const item = await tx.query.inventoryItems.findFirst({
                where: eq(schema.inventoryItems.id, itemId)
            });

            if (!item) throw new Error('Item not found');

            if (direction === 'EXIT') {
                // Kitchen -> Stand
                await tx.update(schema.inventoryItems)
                    .set({
                        stockKitchen: sql`${schema.inventoryItems.stockKitchen} - ${quantity}`,
                        stockStand: sql`${schema.inventoryItems.stockStand} + ${quantity}`
                    })
                    .where(eq(schema.inventoryItems.id, itemId));
            } else {
                // Stand -> Kitchen
                await tx.update(schema.inventoryItems)
                    .set({
                        stockStand: sql`${schema.inventoryItems.stockStand} - ${quantity}`,
                        stockKitchen: sql`${schema.inventoryItems.stockKitchen} + ${quantity}`
                    })
                    .where(eq(schema.inventoryItems.id, itemId));
            }

            await tx.insert(schema.inventoryTransactions).values({
                id: `tx_transfer_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                inventoryItemId: itemId,
                type: 'TRANSFER',
                quantity: quantity, // Just logging magnitude, validation happens in logic
                reason: `Transfer ${direction}: ${note || ''}`,
                referenceId: `transfer_${Date.now()}`,
                timestamp: Date.now()
            });

            return { success: true };
        });
    }
}
