/**
 * @link e:\git\hyphae-pos\src\context\OrderContext.tsx
 * @author Hyphae POS Team
 * @description Central state machine for order lifecycle, loyalty calculation, and persistence.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import React, { createContext, useContext, useReducer, ReactNode, useMemo, useEffect } from 'react';
import {
  OrderState,
  OrderAction,
  OrderContextType,
  OrderItem,
  SavedOrder,
  LoyaltyProfile,
  LoyaltyTransaction,
} from '../types';
import {
  LOYALTY_PROFILES,
  LOYALTY_TIERS,
  SYSTEM_CONFIG,
  LOYALTY_TRANSACTIONS,
  LOYALTY_CARDS,
} from '../data/mock_data';

const LOCAL_STORAGE_KEY = 'hyphae_pos_state_v3'; // Bumped version for new schema

const initialState: OrderState = {
  items: [],
  customer: null,
  loyaltyProfile: null,
  upgradeTriggered: null,
  orderType: 'DineIn',
  taxStatus: true,
  activeOrders: [],
  completedOrders: [], // Archive Layer
  editingOrder: null,
  currentStaffId: 'staff_001', // Default Mock Staff
};

const OrderContext = createContext<OrderContextType | undefined>(undefined);

import { OrderService } from '../services/OrderService';

// --- HELPER WRAPPER ---
const recalculateCartWithPerks = (
  items: OrderItem[],
  profile: LoyaltyProfile | null
): OrderItem[] => {
  return OrderService.applyLoyaltyPerks(items, profile);
};

const orderReducer = (state: OrderState, action: OrderAction): OrderState => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const newItems = [...state.items, action.payload];
      return { ...state, items: recalculateCartWithPerks(newItems, state.loyaltyProfile) };
    }
    case 'REMOVE_ITEM': {
      const newItems = state.items.filter((item) => item.uniqueId !== action.payload);
      return { ...state, items: recalculateCartWithPerks(newItems, state.loyaltyProfile) };
    }
    case 'UPDATE_ITEM': {
      const newItems = state.items.map((item) =>
        item.uniqueId === action.payload.uniqueId ? action.payload : item
      );
      return { ...state, items: recalculateCartWithPerks(newItems, state.loyaltyProfile) };
    }
    case 'SET_ORDER_TYPE':
      return { ...state, orderType: action.payload };
    case 'SET_CUSTOMER':
      return { ...state, customer: action.payload };
    case 'SET_STAFF':
      return { ...state, currentStaffId: action.payload };

    // --- LOYALTY ACTIONS ---
    case 'SET_LOYALTY_PROFILE': {
      const profile = action.payload;
      return {
        ...state,
        loyaltyProfile: profile,
        items: recalculateCartWithPerks(state.items, profile),
      };
    }

    case 'LOGIN_LOYALTY': {
      // Deprecated in favor of SET_LOYALTY_PROFILE via useLoyalty hook
      const cardNum = action.payload.toUpperCase();
      // ... keep legacy fallback if needed for tests ...
      const activeCard = LOYALTY_CARDS.find((c) => c.code === cardNum && c.status === 'ACTIVE');
      if (activeCard) {
        const profile = LOYALTY_PROFILES.find((p) => p.id === activeCard.userId);
        if (profile) {
          const transactions = LOYALTY_TRANSACTIONS.filter((t) => t.customerId === profile.id);
          const hydratedProfile: LoyaltyProfile = {
            ...profile,
            activeCard: activeCard,
            recentTransactions: transactions,
          };
          return {
            ...state,
            loyaltyProfile: hydratedProfile,
            items: recalculateCartWithPerks(state.items, hydratedProfile),
          };
        }
      }
      return state;
    }
    case 'LOGOUT_LOYALTY':
      // Reset prices to normal
      return {
        ...state,
        loyaltyProfile: null,
        items: state.items.map((i) => ({
          ...i,
          finalPrice:
            i.originalPrice ||
            i.price + (i.selectedModifiers?.reduce((a, m) => a + m.price, 0) || 0),
          isDiscounted: false,
        })),
      };

    case 'CONFIRM_TIER_UPGRADE': {
      if (!state.upgradeTriggered) return state;

      const { profile, newTier } = state.upgradeTriggered;

      // In a real app, this would be a batch write:
      // 1. Deactivate old card
      // 2. Create new card
      // 3. Update User Tier

      const newCardCode = action.payload.newCardNumber.toUpperCase();

      // Simulate DB Update: Create New Card
      const newCardId = `card_${Date.now()}`;
      LOYALTY_CARDS.push({
        id: newCardId,
        code: newCardCode,
        userId: profile.id,
        status: 'ACTIVE',
        issuedAt: Date.now(),
      });

      // Simulate DB Update: Deactivate Old Card
      if (profile.activeCard) {
        const oldCardIndex = LOYALTY_CARDS.findIndex((c) => c.id === profile.activeCard!.id);
        if (oldCardIndex !== -1) LOYALTY_CARDS[oldCardIndex].status = 'INACTIVE';
      }

      const updatedProfile: LoyaltyProfile = {
        ...profile,
        currentTierId: newTier,
        activeCard: LOYALTY_CARDS.find((c) => c.id === newCardId),
      };

      // Update mock data reference (hack for demo persistence)
      const profileIdx = LOYALTY_PROFILES.findIndex((p) => p.id === profile.id);
      if (profileIdx !== -1) LOYALTY_PROFILES[profileIdx].currentTierId = newTier;

      return {
        ...state,
        loyaltyProfile: updatedProfile,
        upgradeTriggered: null,
      };
    }

    case 'DISMISS_UPGRADE':
      return { ...state, upgradeTriggered: null };

    case 'CLEAR_ORDER':
      if (state.editingOrder) {
        return {
          ...state,
          items: [],
          customer: null,
          activeOrders: [...state.activeOrders, state.editingOrder].sort(
            (a, b) => b.createdAt - a.createdAt
          ),
          editingOrder: null,
          loyaltyProfile: null,
        };
      }
      return { ...state, items: [], customer: null, loyaltyProfile: null };

    case 'REORDER_ORDERS':
      return { ...state, activeOrders: action.payload };

    case 'UPDATE_ORDER': {
      const updatedOrder = action.payload;
      const existingOrder = state.activeOrders.find((o) => o.id === updatedOrder.id);

      if (!existingOrder) return state;

      if (updatedOrder.status === 'Kitchen' && !existingOrder.cookingStartedAt) {
        updatedOrder.cookingStartedAt = Date.now();
      }
      if (updatedOrder.status === 'Ready' && !existingOrder.readyAt) {
        updatedOrder.readyAt = Date.now();
      }

      // OPTIMIZATION: If completed, move to completedOrders and remove from activeOrders
      if (updatedOrder.status === 'Completed') {
        if (!existingOrder.completedAt) {
          updatedOrder.completedAt = Date.now();
        }
        return {
          ...state,
          activeOrders: state.activeOrders.filter((o) => o.id !== updatedOrder.id),
          completedOrders: [updatedOrder, ...state.completedOrders],
        };
      }

      return {
        ...state,
        activeOrders: state.activeOrders.map((o) => (o.id === updatedOrder.id ? updatedOrder : o)),
      };
    }

    case 'LOAD_ORDER_FOR_EDIT': {
      return {
        ...state,
        items: [...action.payload.items],
        editingOrder: action.payload,
        activeOrders: state.activeOrders.filter((o) => o.id !== action.payload.id),
      };
    }

    case 'CANCEL_EDIT': {
      if (!state.editingOrder) return state;
      return {
        ...state,
        items: [],
        editingOrder: null,
        activeOrders: [...state.activeOrders, state.editingOrder].sort(
          (a, b) => b.createdAt - a.createdAt
        ),
      };
    }

    case 'CREATE_ORDER': {
      const {
        method,
        amountPaid,
        isFullPayment,
        subtotal,
        tax,
        total,
        confirmationNumber,
        tenderedAmount,
        isLoyalty,
        tipAmount,
      } = action.payload;

      // --- LOYALTY EARNING LOGIC ---
      let updatedProfile = state.loyaltyProfile;
      let upgradeTriggered = null;
      let snapshot = undefined;

      // New Order ID
      const newOrderId = (
        100 +
        state.activeOrders.length +
        state.completedOrders.length +
        1
      ).toString();

      const effectiveIsLoyalty = !!updatedProfile || isLoyalty === true;

      if (updatedProfile) {
        const currentTier = LOYALTY_TIERS.find((t) => t.id === updatedProfile?.currentTierId);
        const earnedPoints = subtotal * (currentTier?.cashbackRate || 0);
        const today = new Date().toISOString().split('T')[0];
        const hasVisitedToday = updatedProfile.lastVisitDate === today;
        const newPunches = hasVisitedToday ? 0 : 1;
        const newTotalPunches = updatedProfile.totalPunches + newPunches;

        // 1. Create Transaction Record (Event Source)
        const newTransaction: LoyaltyTransaction = {
          id: `tx_${Date.now()}`,
          customerId: updatedProfile.id,
          cardId: updatedProfile.activeCard?.id, // Track audit trail
          orderId: newOrderId,
          timestamp: Date.now(),
          type: 'EARN',
          points: earnedPoints,
          description: `Points for Order #${newOrderId}`,
        };

        // Push to Mock DB
        LOYALTY_TRANSACTIONS.push(newTransaction);

        // 2. Update Profile Cache
        updatedProfile = {
          ...updatedProfile,
          currentPoints: updatedProfile.currentPoints + earnedPoints,
          totalPunches: newTotalPunches,
          lastVisitDate: today,
          recentTransactions: [newTransaction, ...(updatedProfile.recentTransactions || [])],
        };

        const qualifiedTier = [...LOYALTY_TIERS]
          .sort((a, b) => b.minPunches - a.minPunches)
          .find((t) => newTotalPunches >= t.minPunches);

        if (
          qualifiedTier &&
          qualifiedTier.id !== currentTier?.id &&
          qualifiedTier.minPunches > (currentTier?.minPunches || 0)
        ) {
          upgradeTriggered = {
            prevTier: currentTier?.id || 'tier_starter',
            newTier: qualifiedTier.id,
            profile: updatedProfile,
          };
        }

        const pIdx = LOYALTY_PROFILES.findIndex((p) => p.id === updatedProfile?.id);
        if (pIdx !== -1) LOYALTY_PROFILES[pIdx] = updatedProfile;

        snapshot = {
          tierName: currentTier?.name || '',
          tierColor: currentTier?.color || '',
          pointsEarned: earnedPoints,
        };
      }

      if (effectiveIsLoyalty && !snapshot) {
        snapshot = {
          tierName: 'VIP',
          tierColor: 'yellow-400',
          pointsEarned: 0,
        };
      }
      // --- END LOYALTY LOGIC ---

      // --- SYSTEM CONTEXT INJECTION ---
      const systemInfo = {
        storeId: SYSTEM_CONFIG.storeId,
        terminalId: SYSTEM_CONFIG.terminalId,
        staffId: state.currentStaffId || 'unknown_staff',
      };

      if (state.editingOrder) {
        const originalOrder = state.editingOrder;
        const newAmountPaid = originalOrder.amountPaid + amountPaid;

        const updatedOrder: SavedOrder = {
          ...originalOrder,
          systemInfo: originalOrder.systemInfo || systemInfo, // Preserve orig context or add new
          items: [...state.items],
          subtotal,
          tax,
          total,
          amountPaid: newAmountPaid,
          paymentStatus: newAmountPaid >= total - 0.01 ? 'Paid' : 'Partial',
          confirmationNumber: confirmationNumber || originalOrder.confirmationNumber,
          tenderedAmount: tenderedAmount || originalOrder.tenderedAmount,
          tipAmount: (tipAmount || 0) + (originalOrder.tipAmount || 0),
          isLoyalty: effectiveIsLoyalty,
          loyaltySnapshot: snapshot || originalOrder.loyaltySnapshot,
        };

        return {
          ...state,
          items: [],
          customer: null,
          editingOrder: null,
          activeOrders: [...state.activeOrders, updatedOrder].sort(
            (a, b) => b.createdAt - a.createdAt
          ),
          loyaltyProfile: null,
        };
      } else {
        const newOrder: SavedOrder = {
          id: newOrderId,
          table: 'Counter',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),

          // Inject System Context
          systemInfo: systemInfo,

          createdAt: Date.now(),
          items: [...state.items],
          subtotal,
          tax,
          total,
          amountPaid,
          status: 'Pending',
          paymentStatus: isFullPayment ? 'Paid' : 'Partial',
          orderType: state.orderType,
          confirmationNumber,
          tenderedAmount,
          tipAmount: tipAmount || 0,
          isLoyalty: effectiveIsLoyalty,
          loyaltySnapshot: snapshot,
        };

        return {
          ...state,
          items: [],
          customer: null,
          loyaltyProfile: null,
          activeOrders: [newOrder, ...state.activeOrders],
          upgradeTriggered: upgradeTriggered,
        };
      }
    }
    default:
      return state;
  }
};

interface OrderProviderProps {
  children?: ReactNode;
}

export const OrderProvider = ({ children }: OrderProviderProps) => {
  const [state, dispatch] = useReducer(orderReducer, initialState, (initial) => {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          // Migration check for old state without completedOrders
          if (!parsed.completedOrders) parsed.completedOrders = [];
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load local storage state', e);
    }
    return initial;
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Failed to save state to local storage', e);
    }
  }, [state]);

  const { total, tax, grandTotal } = useMemo(() => {
    const subtotal = state.items.reduce(
      (sum, item) => sum + (item.finalPrice !== undefined ? item.finalPrice : item.price),
      0
    );
    const taxAmount = state.taxStatus ? subtotal * 0.0825 : 0;
    return {
      total: subtotal,
      tax: taxAmount,
      grandTotal: subtotal + taxAmount,
    };
  }, [state.items, state.taxStatus]);

  return (
    <OrderContext.Provider value={{ state, dispatch, total, tax, grandTotal }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};
