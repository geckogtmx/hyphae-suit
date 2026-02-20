

/**
 * HYPHAE SHARED DATA SCHEMA
 * 
 * Strict implementation of the "Code B-Smash" data structure.
 * This ensures the Core defines the data exactly as the POS expects it.
 */

export type UUID = string;
export type ISODate = string;

export * from '@hyphae/schemas';
import { Concept, Category, Product, ModifierGroup, ModifierOption, RecipeComponent, InventoryItem, RecipeDefinition } from '@hyphae/schemas';

// --- 1. HIERARCHY ---


// --- 2. PRODUCT & MODIFIERS ---
// Use shared types from @hyphae/schemas


// --- 3. RECIPES (Back of House) ---
// Note: Using RecipeDefinition from @hyphae/schemas which is already exported via * above.
// Legacy Recipe interface removed to avoid confusion.

// --- 4. INVENTORY & WASTE ---
// Use shared InventoryItem type

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
  type: 'POS' | 'KDS' | 'CORE';
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
  recipes: RecipeDefinition[]; // Added to release
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