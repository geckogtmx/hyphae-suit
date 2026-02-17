import React from 'react';
import {
  MeasurementUnit,
  Product,
  ModifierGroup,
  ModifierOption,
  Concept,
  Category,
  PackagingMetadata,
  RecipeComponent,
  ModifierDependency,
  RecipeDefinition,
  StaffRole,
  StaffProfile,
  SystemInfo,
  LoyaltyTier,
  LoyaltyCard,
  LoyaltyTransactionType,
  LoyaltyTransaction,
  LoyaltyProfile
} from '@hyphae/schemas';

export * from '@hyphae/schemas';

export type OrderType = 'DineIn' | 'Takeout' | 'Delivery';

// --- SYSTEM & STAFF ---
// StaffRole, StaffProfile, SystemInfo are now in @hyphae/schemas

// --- INVENTORY & RECIPE TYPES ---
// RecipeDefinition, RecipeComponent, MeasurementUnit are now in @hyphae/schemas

// --- MENU TYPES ---
// Concept, Category, ModifierOption, ModifierDependency, ModifierGroup, PackagingMetadata, Product are now in @hyphae/schemas

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
  items?: OrderItem[]; // For sub-items / combos if needed
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
// LoyaltyTier, LoyaltyCard, LoyaltyTransaction, LoyaltyProfile, LoyaltyTransactionType are now in @hyphae/schemas

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
  useExternalKDS: boolean;
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
  | { type: 'TOGGLE_EXTERNAL_KDS' }
  | { type: 'UPDATE_ORDER_STATUS'; payload: { orderId: string; status: OrderStatus } }
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
