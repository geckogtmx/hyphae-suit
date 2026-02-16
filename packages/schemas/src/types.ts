export type OrderType = 'DineIn' | 'Takeout' | 'Delivery';

export interface Concept {
    id: string;
    name: string;
    color: string; // Tailwind color class stub (e.g. 'orange-500')
    flowType?: string;
}

export interface Category {
    id: string;
    name: string;
    conceptId: string;
}

export type MeasurementUnit = 'oz' | 'lb' | 'g' | 'kg' | 'fl_oz' | 'qt' | 'gal' | 'count' | 'pcs' | 'slices' | 'liters';

export interface InventoryItem {
    id: string;
    name: string;
    type: 'RAW' | 'PREP' | 'READY';
    state?: 'RAW' | 'PREP' | 'READY'; // Core uses state, POS uses type? Let's support both or merge.
    stockUnit: MeasurementUnit;
    costPerUnit: number;
    parLevel?: number;
    currentStock?: number; // Core uses this
}

export interface RecipeComponent {
    inventoryItemId: string;
    quantity: number;
    unit: MeasurementUnit;
    wasteFactor?: number;
}

export interface ModifierOption {
    id: string;
    name: string;
    price: number;
    metadata?: {
        kitchenLabel?: string; // e.g. "Beef Patty"
        quantity?: number; // e.g. 2 (for Double)
    };
    // Link to Inventory
    inventoryMetadata?: {
        recipeId?: string; // Use a complex recipe
        directDepletion?: RecipeComponent[]; // Simple deduction
    };
}

export interface ModifierDependency {
    groupId: string;
    requiredOptions?: string[]; // If present, one of these options must be selected. If empty, any selection works.
}

export interface ModifierGroup {
    id: string;
    name: string;
    required: boolean;
    multiSelect: boolean; // If true, user can pick multiple. If false, auto-advance after one.
    options: ModifierOption[];
    dependency?: ModifierDependency;
    variant?: string;
}

export interface PackagingMetadata {
    sku: string; // The wrapper/box SKU for this item
    volumePoints: number; // Space taken in bag (1-8 scale)
    isMessy: boolean; // Triggers extra napkin logic
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
        kitchenLabel?: string; // e.g. "Brioche Buns"
        quantity?: number; // e.g. 1
    };
    packaging?: PackagingMetadata;
    // Link to Inventory
    inventoryMetadata?: {
        recipeId?: string; // Use a complex recipe (e.g. Burger Assembly)
        directDepletion?: RecipeComponent[]; // Simple deduction (e.g. Soda Can)
    };
    // Core unified fields
    active?: boolean;
    stationId?: string;
    timeMetadata?: {
        cookTimeSeconds: number;
        activePrepTimeSeconds: number;
    };
    logisticsMetadata?: {
        volumetricScore: number;
        requiresContainer: boolean;
        packagingDims?: [number, number, number];
    };
    prepBatchSize?: number;
    costOfGoods?: number;
    recipeText?: string;
}

// --- RECIPES ---

export interface RecipeDefinition {
    id: string;
    name: string;
    yieldQuantity: number;
    yieldUnit: MeasurementUnit;
    components: RecipeComponent[];
    instructions?: string[];
    outputInventoryItemId?: string;
}

// --- SYSTEM & STAFF ---

export type StaffRole = 'Manager' | 'Cashier' | 'Kitchen';

export interface StaffProfile {
    id: string;
    name: string;
    // pin: string; // REMOVED: Secure auth required
    role: StaffRole;
}

export interface SystemInfo {
    storeId: string;
    terminalId: string;
    staffId: string;
    shiftId?: string;
}

// --- LOYALTY ---

export interface LoyaltyTier {
    id: string;
    name: string;
    color: string; // Tailwind color (e.g. 'amber-400')
    minPunches: number;
    cashbackRate: number; // e.g. 0.02 for 2%
    perks: string[];
}

export interface LoyaltyCard {
    id: string;
    code: string; // The physical/digital code (e.g., 123456AB)
    userId: string; // The LoyaltyProfile ID this card belongs to
    status: 'ACTIVE' | 'INACTIVE' | 'LOST';
    issuedAt: number;
}

export type LoyaltyTransactionType = 'EARN' | 'REDEEM' | 'ADJUSTMENT' | 'TIER_BONUS';

export interface LoyaltyTransaction {
    id: string;
    customerId: string;
    cardId?: string; // Which card was used for this transaction?
    orderId?: string;
    timestamp: number;
    type: LoyaltyTransactionType;
    points: number;
    description: string;
}

export interface LoyaltyProfile {
    id: string;
    name: string;
    phone: string;
    currentTierId: string;

    // These are "Cached Aggregates" - derived from the sum of transactions
    totalPunches: number;
    currentPoints: number;

    lastVisitDate: string; // YYYY-MM-DD
    joinedDate: number;

    // Hydrated on load (not persisted in the profile doc itself in Firestore usually)
    recentTransactions?: LoyaltyTransaction[];
    activeCard?: LoyaltyCard; // Hydrated currently used card
}
