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
    stockKitchen?: number; // BOH
    stockStand?: number; // FOH
    preferredSupplierId?: string;
    /** @deprecated Use stockKitchen or stockStand */
    currentStock?: number; // Core uses this (Legacy)
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
    /** @deprecated Use stock, stockKitchen, or stockStand instead */
    currentStock?: number;
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

export interface RecipeStep {
    stepNumber: number;
    instruction: string;
    type: 'active' | 'passive';
    durationMinutes?: number;
    isCheckpoint?: boolean;
    image?: string;
    tips?: string[];
    equipmentNeeded?: string[];
}

export interface RecipeDefinition {
    id: string;
    name: string;
    /** BATCH = produces a prep item in bulk; ASSEMBLY = depletes stock per sale. Omit for simple seed records. */
    type?: 'BATCH' | 'ASSEMBLY';
    /** Culinary category. Omit for simple seed records. */
    category?: 'bread' | 'sauce' | 'protein' | 'produce' | 'assembly';
    yieldQuantity: number;
    yieldUnit: MeasurementUnit;
    /** Active hands-on time in minutes. Omit for simple seed records. */
    activeTimeMinutes?: number;
    /** Total time including passive steps. Omit for simple seed records. */
    totalTimeMinutes?: number;
    components: RecipeComponent[];
    /** Step-by-step instructions. Omit for simple seed/assembly records. */
    steps?: RecipeStep[];
    /** Required equipment list. Omit for simple seed records. */
    equipment?: string[];
    storageInstructions?: string;
    shelfLifeDays?: number;
    outputInventoryItemId?: string; // If BATCH, produces this item
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

// --- ORDERS ---

export type OrderStatus = 'Pending' | 'Cooking' | 'Ready' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';

export interface OrderItem {
    id: string;
    productId: string;
    name: string;
    price: number;
    quantity: number;
    modifiers?: string; // JSON string of selected modifiers
}

export interface Order {
    id: string;
    storeId: string;
    terminalId: string;
    staffId?: string;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    orderType: OrderType;
    subtotal: number;
    tax: number;
    total: number;
    createdAt: number;
    completedAt?: number;
    items?: OrderItem[];
}

// --- PAYMENTS ---

export type PaymentMethod = 'CASH' | 'CARD' | 'LOYALTY' | 'OTHER';
export type PaymentRecordStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PaymentRecord {
    id: string;
    orderId: string;
    method: PaymentMethod;
    amount: number;
    status: PaymentRecordStatus;
    transactionId?: string; // Provider transaction ref
    timestamp: number;
}

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
    email?: string;
    phone: string;
    cardNumber?: string;
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

// --- FORECASTING ---

export interface PrepForecastItem {
    id: string;
    forecastId: string;
    productId: string;
    targetQuantity: number;
    // Hydrated
    product?: Product;
}

export type PrepForecastStatus = 'DRAFT' | 'ACTIVE' | 'COMPLETED';

export interface PrepForecast {
    id: string;
    name: string;
    targetDate: number; // Unix timestamp for the target day
    status: PrepForecastStatus;
    updatedAt: number;
    // Hydrated
    items?: PrepForecastItem[];
}
