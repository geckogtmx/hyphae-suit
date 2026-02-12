export type MeasurementUnit = 'oz' | 'lb' | 'g' | 'kg' | 'fl_oz' | 'qt' | 'gal' | 'count';

// --- SHARED WITH POS (DO NOT MODIFY WITHOUT SYNC) ---

export interface InventoryItem {
    id: string;
    name: string;
    type: 'RAW' | 'PREP'; // RAW is bought, PREP is made in-house
    stockUnit: MeasurementUnit;
    costPerUnit: number; // For cost averaging
    parLevel?: number;
    // BOH Extensions (Local only until sync)
    currentStock: number; // BOH tracks this live
    storageLocation?: string;
    lastReceivedAt?: number;
    expiryDate?: string; // ISO
}

export interface RecipeComponent {
    inventoryItemId: string;
    quantity: number;
    unit: MeasurementUnit;
    wasteFactor?: number;
}

export interface PackagingMetadata {
    sku: string;
    volumePoints: number;
    isMessy: boolean;
}

export interface ModifierOption {
    id: string;
    name: string;
    price: number;
    metadata?: {
        kitchenLabel?: string;
        quantity?: number;
    };
    inventoryMetadata?: {
        recipeId?: string;
        directDepletion?: RecipeComponent[];
    };
}

export interface ModifierDependency {
    groupId: string;
    requiredOptions?: string[];
}

export interface ModifierGroup {
    id: string;
    name: string;
    required: boolean;
    multiSelect: boolean;
    options: ModifierOption[];
    dependency?: ModifierDependency;
    variant?: string;
}

export interface Product {
    id: string;
    name: string;
    price: number;
    categoryId: string;
    requiresMods: boolean;
    stock?: number;
    modifierGroups?: ModifierGroup[];
    metadata?: {
        kitchenLabel?: string;
        quantity?: number;
    };
    packaging?: PackagingMetadata;
    inventoryMetadata?: {
        recipeId?: string;
        directDepletion?: RecipeComponent[];
    };
}

// --- BOH SPECIFIC TYPES (FROM PROMPT & PDF) ---

export interface RecipeStep {
    stepNumber: number;
    instruction: string;
    type: 'active' | 'passive'; // PDF: Chemistry/Physics vs Mechanics
    durationMinutes?: number;
    isCheckpoint?: boolean;
    image?: string;
    tips?: string[];
    equipmentNeeded?: string[]; // "Oven_Slot_1"
}

export interface RecipeDefinition {
    id: string;
    name: string;
    category: 'bread' | 'sauce' | 'protein' | 'produce' | 'assembly';
    yieldQuantity: number;
    yieldUnit: MeasurementUnit;
    activeTimeMinutes: number;
    totalTimeMinutes: number;
    components: RecipeComponent[];
    steps: RecipeStep[];
    equipment: string[];
    storageInstructions?: string;
    shelfLifeDays?: number;
    outputInventoryItemId?: string;
}

export interface PrepTask {
    id: string;
    scheduleId: string;
    recipeId: string;
    targetQuantity: number;
    unit: string;
    assignedDay: string; // "2026-02-12"
    estimatedMinutes: number;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    completedQuantity?: number;
    completedAt?: number;
    completedBy?: string;
    notes?: string;
    dependsOn?: string[];
    startedAt?: number;
}

export interface PrepSchedule {
    id: string;
    name: string;
    targetDate: string;
    status: 'planning' | 'active' | 'completed';
    estimatedSalesUnits: number;
    tasks: PrepTask[];
    createdAt: number;
    completedAt?: number;
}

// --- NEW PDF TYPES ---

export interface BatchID {
    id: string; // SAUCE-ROJA-1127
    itemId: string;
    createdAt: number;
    expiresAt: number;
    createdBy: string;
}

export interface ShiftLog {
    id: string;
    staffId: string;
    clockIn: number;
    clockOut?: number;
    tasksCompleted: number;
}

export interface WasteLog {
    id: string;
    inventoryItemId: string;
    quantity: number;
    reason: 'expired' | 'damaged' | 'overproduced' | 'quality' | 'spill';
    notes?: string;
    loggedAt: number;
    loggedBy: string;
    convertedTo?: string; // If upcycled (e.g. to Bread Pudding)
}

export interface ReceivingLog {
    id: string;
    items: {
        inventoryItemId: string;
        quantityReceived: number; // e.g. 1
        unitReceived: string; // "Arpilla"
        netQuantity: number; // 25
        netUnit: MeasurementUnit; // 'kg'
        totalCost: number; // $300
        calculatedCostPerUnit: number; // $12/kg
    }[];
    receivedAt: number;
    receivedBy: string;
}
// --- STORE TYPES ---

export interface InventoryStore {
    inventory: InventoryItem[];
    getRawInventory: () => InventoryItem[];
    getPrepInventory: () => InventoryItem[];
    updateQuantity: (id: string, quantity: number) => void;
    adjustParLevel: (id: string, level: number) => void;
}
