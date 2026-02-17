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
     */
    static async deductOrderInventory(orderId: string, items: any[]) {
        console.log(`[Inventory] Processing depletion for order ${orderId}...`);

        for (const item of items) {
            try {
                // 1. Fetch the product and its assembly recipe
                const product = await db.query.products.findFirst({
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

                // 2. Loop through ingredients and deduct
                for (const ingredient of product.recipe.ingredients) {
                    const totalDeduction = ingredient.quantity * quantity;

                    console.log(`[Inventory] Deducting ${totalDeduction} of item ${ingredient.inventoryItemId} for ${item.name}`);

                    // Update stock
                    await db.update(schema.inventoryItems)
                        .set({
                            currentStock: sql`${schema.inventoryItems.currentStock} - ${totalDeduction}`
                        })
                        .where(eq(schema.inventoryItems.id, ingredient.inventoryItemId));

                    // Record transaction
                    await db.insert(schema.inventoryTransactions).values({
                        id: `tx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
                        inventoryItemId: ingredient.inventoryItemId,
                        type: 'SALE',
                        quantity: -totalDeduction,
                        reason: `Order Sale: ${orderId}`,
                        referenceId: orderId,
                        timestamp: Date.now()
                    });

                    // Fetch updated stock level for broadcast
                    const updatedItem = await db.query.inventoryItems.findFirst({
                        where: eq(schema.inventoryItems.id, ingredient.inventoryItemId)
                    });

                    if (updatedItem) {
                        socketService.emit('inventory:updated', {
                            id: updatedItem.id,
                            currentStock: updatedItem.currentStock
                        });
                    }
                }
            } catch (err) {
                console.error(`[Inventory] Failed to deduct inventory for item ${item.name}:`, err);
            }
        }
    }
}
