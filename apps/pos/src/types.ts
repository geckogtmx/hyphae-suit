/**
 * @link e:\git\hyphae-pos\src\types.ts
 * @author Hyphae POS Team
 * @description Global type definitions for the Hyphae POS ecosystem.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React from 'react';

export type OrderType = 'DineIn' | 'Takeout' | 'Delivery';

// --- SYSTEM & STAFF TYPES (NEW) ---

export type StaffRole = 'Manager' | 'Cashier' | 'Kitchen';

export interface StaffProfile {
  id: string;
  name: string;
  pin: string; // In real app, hashed
  role: StaffRole;
}

export interface SystemInfo {
  storeId: string;
  terminalId: string;
  staffId: string;
  shiftId?: string;
}

// --- INVENTORY & RECIPE TYPES ---

export type MeasurementUnit = 'oz' | 'lb' | 'g' | 'kg' | 'fl_oz' | 'qt' | 'gal' | 'count';

export interface InventoryItem {
  id: string;
  name: string;
  type: 'RAW' | 'PREP'; // RAW is bought, PREP is made in-house
  stockUnit: MeasurementUnit;
  costPerUnit: number;
  parLevel?: number;
}

export interface RecipeComponent {
  inventoryItemId: string;
  quantity: number;
  unit: MeasurementUnit;
  wasteFactor?: number; // e.g., 0.1 for 10% waste
}

export interface RecipeDefinition {
  id: string;
  name: string;
  yieldQuantity: number;
  yieldUnit: MeasurementUnit;
  components: RecipeComponent[];
  instructions?: string[];
  outputInventoryItemId?: string; // If this recipe creates a PREP item (e.g. Salsa Batch -> inv_salsa_roja)
}

// --- MENU TYPES ---

export interface Concept {
  id: string;
  name: string;
  color: string; // Tailwind color class stub (e.g. 'orange-500')
}

export interface Category {
  id: string;
  name: string;
  conceptId: string;
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
}

export type ModifierVariation = 'Normal' | 'No' | 'Side' | 'Extra';

export interface SelectedModifier {
  groupId: string;
  optionId: string;
  name: string;
  price: number;
  variation: ModifierVariation;
}

export interface MenuItem extends Product {
  category?: string;
}

export interface OrderItem extends Product {
  uniqueId: string;
  selectedModifiers: SelectedModifier[];
  notes?: string;
  finalPrice: number;
  originalPrice?: number; // Track pre-discount price
  isDiscounted?: boolean;
}

export interface Customer {
  id?: string;
  name: string;
  phone?: string;
}

// --- LOYALTY TYPES ---

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
  // activeCardNumber removed from core schema to support multi-card/loss scenarios
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

// --- NEW TYPES FOR CHECKOUT & PERSISTENCE ---

export type OrderStatus = 'Pending' | 'Kitchen' | 'Ready' | 'Completed';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';
export type PaymentMethod = 'Cash' | 'Clip' | 'Transfer' | 'Split';

export interface SavedOrder {
  id: string;
  table: string; // Mock placeholder
  time: string; // Human readable time string

  // Context Metadata (Who, Where, When)
  systemInfo?: SystemInfo;

  // Timestamps for lifecycle tracking
  createdAt: number;
  cookingStartedAt?: number;
  readyAt?: number;
  completedAt?: number;

  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  confirmationNumber?: string;
  tenderedAmount?: number;
  tipAmount?: number;
  isLoyalty?: boolean;
  loyaltySnapshot?: {
    tierName: string;
    tierColor: string;
    pointsEarned: number;
  };
}

export interface OrderState {
  items: OrderItem[];
  customer: Customer | null;
  loyaltyProfile: LoyaltyProfile | null; // Active loyalty user
  upgradeTriggered: { prevTier: string; newTier: string; profile: LoyaltyProfile } | null; // Trigger for modal

  orderType: OrderType;
  taxStatus: boolean;

  activeOrders: SavedOrder[]; // LIVE: Pending, Kitchen, Ready
  completedOrders: SavedOrder[]; // ARCHIVE: Completed (Removed from active memory in future DB impl)

  editingOrder: SavedOrder | null; // The order currently being modified

  // System State
  currentStaffId?: string;
}

export type OrderAction =
  | { type: 'ADD_ITEM'; payload: OrderItem }
  | { type: 'REMOVE_ITEM'; payload: string } // uniqueId
  | { type: 'UPDATE_ITEM'; payload: OrderItem } // NEW: Update existing item
  | { type: 'SET_ORDER_TYPE'; payload: OrderType }
  | { type: 'SET_CUSTOMER'; payload: Customer | null }
  | { type: 'SET_LOYALTY_PROFILE'; payload: LoyaltyProfile } // Async Login
  | { type: 'LOGIN_LOYALTY'; payload: string } // Deprecated: Sync lookup
  | { type: 'LOGOUT_LOYALTY' }
  | { type: 'CONFIRM_TIER_UPGRADE'; payload: { newCardNumber: string } }
  | { type: 'DISMISS_UPGRADE' }
  | { type: 'CLEAR_ORDER' }
  | { type: 'REORDER_ORDERS'; payload: SavedOrder[] }
  | { type: 'UPDATE_ORDER'; payload: SavedOrder }
  | { type: 'LOAD_ORDER_FOR_EDIT'; payload: SavedOrder }
  | { type: 'CANCEL_EDIT' }
  | { type: 'SET_STAFF'; payload: string } // Login Staff
  | {
      type: 'CREATE_ORDER';
      payload: {
        method: PaymentMethod;
        amountPaid: number;
        isFullPayment: boolean;
        subtotal: number;
        tax: number;
        total: number;
        confirmationNumber?: string;
        tenderedAmount?: number;
        isLoyalty?: boolean;
        tipAmount?: number;
      };
    };

export interface OrderContextType {
  state: OrderState;
  dispatch: React.Dispatch<OrderAction>;
  total: number;
  tax: number;
  grandTotal: number;
}
