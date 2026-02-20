import { Product, RecipeDefinition, InventoryItem } from '../types/schema';

export interface ForecastTarget {
    productId: string;
    productName: string;
    targetCount: number;
}

export interface ForecastResultItem {
    inventoryItemId: string;
    inventoryItem: InventoryItem;
    requiredQuantity: number;
    unit: string;
    estimatedCost: number;
}

export const runForecast = (
    targets: ForecastTarget[],
    products: Product[],
    recipes: RecipeDefinition[],
    inventory: InventoryItem[]
): ForecastResultItem[] => {
    const requirements = new Map<string, number>();

    const addRequirement = (invId: string, qty: number) => {
        requirements.set(invId, (requirements.get(invId) || 0) + qty);
    };

    const explodeItem = (invId: string, qty: number) => {
        const invItem = inventory.find(i => i.id === invId);
        if (!invItem) return;

        // If PREP, we must find the BATCH recipe to explode it further into RAW items
        if (invItem.type === 'PREP') {
            const batchRecipe = recipes.find(r => r.type === 'BATCH' && r.outputInventoryItemId === invId);
            if (batchRecipe && batchRecipe.yieldQuantity > 0) {
                const multiplier = qty / batchRecipe.yieldQuantity;
                batchRecipe.components.forEach(comp => {
                    explodeItem(comp.inventoryItemId, comp.quantity * multiplier);
                });
            } else {
                // If no BATCH recipe is found, we must just list it as is
                addRequirement(invId, qty);
            }
        } else {
            // RAW or READY items are leaf nodes in the explosion tree
            addRequirement(invId, qty);
        }
    };

    targets.forEach(target => {
        if (target.targetCount <= 0) return;
        const product = products.find(p => p.id === target.productId);
        if (!product || !product.inventoryMetadata) return;

        if (product.inventoryMetadata.directDepletion) {
            product.inventoryMetadata.directDepletion.forEach(comp => {
                explodeItem(comp.inventoryItemId, comp.quantity * target.targetCount);
            });
        } else if (product.inventoryMetadata.recipeId) {
            const recipe = recipes.find(r => r.id === product.inventoryMetadata?.recipeId);
            if (recipe) {
                recipe.components.forEach(comp => {
                    explodeItem(comp.inventoryItemId, comp.quantity * target.targetCount);
                });
            }
        }
    });

    const results: ForecastResultItem[] = [];
    requirements.forEach((qty, invId) => {
        const invItem = inventory.find(i => i.id === invId);
        if (invItem) {
            results.push({
                inventoryItemId: invId,
                inventoryItem: invItem,
                requiredQuantity: qty,
                unit: invItem.stockUnit,
                estimatedCost: qty * invItem.costPerUnit
            });
        }
    });

    return results.sort((a, b) => b.estimatedCost - a.estimatedCost);
};
