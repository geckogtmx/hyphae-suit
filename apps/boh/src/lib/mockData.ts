import type { InventoryItem, PrepSchedule, PrepTask, RecipeDefinition } from '../types';

export const mockRecipes: RecipeDefinition[] = [
    {
        id: 'brioche_batch_20',
        name: 'Brioche Buns (20ct)',
        category: 'bread',
        yieldQuantity: 20,
        yieldUnit: 'count',
        activeTimeMinutes: 45,
        totalTimeMinutes: 180,
        equipment: ['Mixer', 'Oven_Slot_1', 'Counter'],
        components: [
            { inventoryItemId: 'flour_ap', quantity: 1000, unit: 'g' },
            { inventoryItemId: 'yeast', quantity: 20, unit: 'g' },
            { inventoryItemId: 'butter', quantity: 200, unit: 'g' },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Weigh ingredients', type: 'active', durationMinutes: 5 },
            { stepNumber: 2, instruction: 'Mix dough (low speed)', type: 'active', durationMinutes: 10 },
            { stepNumber: 3, instruction: 'Add butter gradually', type: 'active', durationMinutes: 15 },
            { stepNumber: 4, instruction: 'Bulk Proof', type: 'passive', durationMinutes: 60, tips: ['Cover with damp cloth'] },
            { stepNumber: 5, instruction: 'Shape buns (80g each)', type: 'active', durationMinutes: 20 },
            { stepNumber: 6, instruction: 'Final Proof', type: 'passive', durationMinutes: 45 },
            { stepNumber: 7, instruction: 'Bake at 375°F', type: 'passive', durationMinutes: 20 },
        ],
    },
    {
        id: 'salsa_roja_5l',
        name: 'Salsa Roja (5L)',
        category: 'sauce',
        yieldQuantity: 5,
        yieldUnit: 'qt', // Using qt to match POS units if needed, but lets stick to logic
        activeTimeMinutes: 20,
        totalTimeMinutes: 60,
        equipment: ['Burner_Slot_1', 'Blender'],
        components: [
            { inventoryItemId: 'tomatillos', quantity: 3, unit: 'kg' },
            { inventoryItemId: 'chiles_arbol', quantity: 100, unit: 'g' },
        ],
        steps: [
            { stepNumber: 1, instruction: 'Roast tomatillos & garlic', type: 'passive', durationMinutes: 15 },
            { stepNumber: 2, instruction: 'Toast chiles', type: 'active', durationMinutes: 5 },
            { stepNumber: 3, instruction: 'Blend ingredients', type: 'active', durationMinutes: 10 },
            { stepNumber: 4, instruction: 'Simmer to reduce', type: 'passive', durationMinutes: 30 },
            { stepNumber: 5, instruction: 'Cool down (HACCP Log)', type: 'passive', durationMinutes: 60, isCheckpoint: true },
        ],
    }
];

export const mockInventory: InventoryItem[] = [
    { id: 'flour_ap', name: 'AP Flour', type: 'RAW', stockUnit: 'kg', costPerUnit: 1.5, currentStock: 25 },
    { id: 'yeast', name: 'Instant Yeast', type: 'RAW', stockUnit: 'g', costPerUnit: 0.05, currentStock: 450 },
    { id: 'butter', name: 'Unsalted Butter', type: 'RAW', stockUnit: 'kg', costPerUnit: 12, currentStock: 5 },
    { id: 'tomatillos', name: 'Tomatillos', type: 'RAW', stockUnit: 'kg', costPerUnit: 3, currentStock: 10 },
    { id: 'chiles_arbol', name: 'Chiles de Arbol', type: 'RAW', stockUnit: 'g', costPerUnit: 0.02, currentStock: 500 },
];

export const mockSchedule: PrepSchedule = {
    id: 'sched_sat_market',
    name: 'Saturday Market Prep',
    targetDate: '2026-02-14',
    status: 'active',
    estimatedSalesUnits: 200,
    createdAt: Date.now(),
    tasks: [
        {
            id: 'task_buns_1',
            scheduleId: 'sched_sat_market',
            recipeId: 'brioche_batch_20',
            targetQuantity: 10, // 10 batches = 200 buns
            unit: 'batches',
            assignedDay: '2026-02-12',
            estimatedMinutes: 300, // Parallel execution assumed
            status: 'pending',
        },
        {
            id: 'task_salsa_1',
            scheduleId: 'sched_sat_market',
            recipeId: 'salsa_roja_5l',
            targetQuantity: 2, // 2 batches = 10L
            unit: 'batches',
            assignedDay: '2026-02-12',
            estimatedMinutes: 90,
            status: 'pending',
        }
    ]
};
