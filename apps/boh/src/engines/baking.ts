/**
 * Baker's Math Engine
 * 
 * Core Concept: Flour is always 100%. All other ingredients are a percentage of the flour weight.
 * This allows for auto-scaling based on available resource (e.g. "I only have 850g of flour").
 */

export interface BakersPercentage {
    flour: number; // Always 100
    water: number; // Hydration
    salt: number;
    yeast: number;
    others?: Record<string, number>; // sugar, butter, etc.
}

export interface ScaledRecipe {
    flour: number;
    water: number;
    salt: number;
    yeast: number;
    others?: Record<string, number>;
    totalWeight: number;
}

export function calculateBakersMath(
    flourWeight: number,
    percentages: BakersPercentage
): ScaledRecipe {
    const scale = flourWeight / 100;

    const result: ScaledRecipe = {
        flour: flourWeight,
        water: Math.round(percentages.water * scale),
        salt: Math.round(percentages.salt * scale),
        yeast: Math.round(percentages.yeast * scale),
        others: {},
        totalWeight: 0
    };

    if (percentages.others) {
        for (const [key, pct] of Object.entries(percentages.others)) {
            result.others![key] = Math.round(pct * scale);
        }
    }

    // Calculate total weight
    result.totalWeight = result.flour + result.water + result.salt + result.yeast +
        Object.values(result.others || {}).reduce((a, b) => a + b, 0);

    return result;
}

// Example: Brioche
// Flour 100%, Water(Eggs/Milk) 60%, Salt 2%, Yeast 2%, Butter 50%, Sugar 15%
export const BRIOCHE_RATIO: BakersPercentage = {
    flour: 100,
    water: 10, // Milk/Eggs handled separately usually, but for simple scaling:
    salt: 2,
    yeast: 2.5,
    others: {
        butter: 50,
        sugar: 15,
        eggs: 40
    }
};
