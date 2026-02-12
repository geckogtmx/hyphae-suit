

/**
 * HYPHAE SHARED DATA SCHEMA
 * 
 * Strict implementation of the "Code B-Smash" data structure.
 * This ensures the Core defines the data exactly as the POS expects it.
 */

export type UUID = string;
export type ISODate = string;

// --- 1. HIERARCHY ---
export interface Concept {
  id: string;
  name: string;
  color: string;
  // Brand Logic for Kitchen Flow
  flowType: 'sequential' | 'party_seat' | 'ticket_all';
}

export interface Category {
  id: string;
  name: string;
  conceptId: string; // FK to Concept
}

// --- 2. PRODUCT & MODIFIERS ---
export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  inventoryMetadata?: {
    recipeId?: string; 
  };
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  options: ModifierOption[];
}

export interface Product {
  id: string;
  name: string;
  price: number;
  categoryId: string; // FK to Category
  requiresMods: boolean;
  stock?: number;
  modifierGroups?: ModifierGroup[]; // The recursive definition
  metadata?: {
    kitchenLabel?: string;
  };
  inventoryMetadata?: {
    recipeId?: string; // Links to Back-of-House
  };
  active?: boolean; // Helper for UI toggling

  // --- UNIFIED KITCHEN METADATA (Agent Data) ---
  stationId?: string; // e.g., 'station_grill'
  timeMetadata?: {
    cookTimeSeconds: number;
    activePrepTimeSeconds: number;
  };
  
  // --- AGENT SPECIFIC FIELDS (Hyphae Intelligence) ---
  
  // Logistics Agent (PLS)
  logisticsMetadata?: {
    volumetricScore: number; // 1-10 scale for bag packing
    requiresContainer: boolean;
    packagingDims?: [number, number, number]; // [Length, Width, Height] in cm
  };

  // Forecaster Agent (Plan)
  prepBatchSize?: number; // How many units do we prep at once?

  // Menu Engineer Agent (Profit)
  costOfGoods?: number; // Manual override or calculated COGS

  // Trainer Agent (SOP)
  recipeText?: string; // Full text instructions/SOP for RAG
}

// --- 3. RECIPES (Back of House) ---
export interface RecipeComponent {
  inventoryId: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  productId: string; // FK to Product
  name: string;
  stationId: string;
  cookTimeSeconds: number;
  activePrepTimeSeconds: number;
  volumetricScore: number;
  components: RecipeComponent[];
}

// --- 4. INVENTORY & WASTE ---
export interface InventoryItem {
  id: string;
  name: string;
  stockUnit: 'kg' | 'pcs' | 'oz' | 'slices' | 'liters';
  parLevel?: number;
  currentStock: number; 
  costPerUnit: number; // Added for Costing
  // Life Cycle State: RAW (Purchased) vs PREP (Processed)
  state: 'RAW' | 'PREP' | 'READY';
}

export interface WasteLog {
  id: string;
  inventoryId: string;
  quantity: number;
  reason: 'burnt' | 'dropped' | 'expired' | 'other';
  timestamp: ISODate;
  staffId?: string;
}

// --- 5. FLEET & SYNC (Core Specific) ---
export interface DeviceState {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'syncing';
  lastHeartbeat: ISODate;
  batteryLevel: number;
  appVersion: string;
  currentMenuVersion: string;
  pendingUploads: number;
}

// The Immutable Snapshot consumed by the POS
export interface MenuRelease {
  version: string;
  publishedAt: ISODate;
  hash: string;
  concepts: Concept[];
  categories: Category[];
  products: Product[];
  recipes: Recipe[]; // Added to release
}

// --- 6. OPERATIONAL DATA (Analytics) ---
export interface TransactionItem {
  productId: UUID;
  name: string; 
  quantity: number;
  priceAtSale: number;
  modifiers: string[];
}

export interface TransactionRecord {
  id: UUID;
  posId: string;
  timestamp: ISODate;
  items: TransactionItem[];
  total: number;
  paymentMethod: 'card' | 'cash' | 'qr';
  status: 'completed' | 'voided' | 'refunded';
}

// --- 7. FINANCE & STRATEGY ---
export interface FinancialMetrics {
  totalRevenueMXN: number;
  totalTaxCollectedMXN: number;
  grossProfitMargin: number;
  laborCostPercent: number;
  totalExpensesMXN: number;
}

export interface VendorInvoice {
  id: string;
  supplier: string;
  amount: number;
  dueDate: ISODate;
  status: 'Pending' | 'Paid' | 'Overdue';
}

export interface AccountsReceivableItem {
  id: string;
  partner: string;
  amount: number;
  dueDate: ISODate;
  status: 'Pending' | 'Collected' | 'Overdue';
}

// --- 8. INTEGRATIONS & SETTLEMENT ---
export interface PaymentGatewayConfig {
  provider: string;
  status: 'Active' | 'Inactive' | 'Error';
  liveApiKey: string; // Secure/Masked in UI
  payoutFrequency: string;
  lastPayoutDate: ISODate;
  lastPayoutAmount: number;
}

export interface DeliveryPartnerConfig {
  name: string;
  apiStatus: 'Active' | 'Inactive' | 'Scheduled Maintenance' | 'Error';
  menuSyncStatus: string;
  commissionRate: number; // 0.30 = 30%
  lastError?: string;
  partnerToken: string; // Secure/Masked in UI
}