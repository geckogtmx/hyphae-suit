import type {
    InventoryItem,
    RecipeComponent,
    RecipeStep,
    RecipeDefinition,
    MeasurementUnit,
    Order,
    OrderItem,
    OrderStatus,
    PaymentStatus
} from '@hyphae/schemas';

export type {
    InventoryItem,
    RecipeComponent,
    RecipeStep,
    RecipeDefinition,
    MeasurementUnit,
    Order,
    OrderItem,
    OrderStatus,
    PaymentStatus
};

// --- BOH SPECIFIC TYPES (STILL LOCAL UNTIL FULL SYNC) ---

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
    fetchInventory: () => Promise<void>;
}
