/**
 * @link e:\git\hyphae-pos\src\services\OrderService.ts
 * @author Hyphae POS Team
 * @description Business logic for order calculations, tax, and loyalty perks.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { OrderItem, LoyaltyProfile, SavedOrder, OrderStatus, PaymentStatus } from '../types';

export class OrderService {
  private static TAX_RATE = 0.0825;

  /**
   * Calculate tax for a given subtotal.
   * Rule: 8.25% rounded half up to nearest cent.
   */
  static calculateTax(subtotal: number): number {
    return Math.round(subtotal * this.TAX_RATE * 100) / 100;
  }

  /**
   * Calculate final price for a single order item including its selected modifiers.
   */
  static calculateItemFinalPrice(item: OrderItem): number {
    const modifiersTotal = item.selectedModifiers?.reduce((acc, mod) => acc + mod.price, 0) || 0;
    return item.price + modifiersTotal;
  }

  /**
   * Recalculate cart items based on loyalty perks.
   * Current Rule: Gold members get Free Fries with any Burger.
   */
  static applyLoyaltyPerks(items: OrderItem[], profile: LoyaltyProfile | null): OrderItem[] {
    if (!profile) {
      return items.map((item) => ({
        ...item,
        finalPrice: this.calculateItemFinalPrice(item),
        isDiscounted: false,
      }));
    }

    const isGold = profile.currentTierId === 'tier_gold';

    return items.map((item) => {
      const isBurger = item.categoryId === 'burgers';
      let discounted = false;

      const modifiersTotal =
        item.selectedModifiers?.reduce((acc, mod) => {
          let modPrice = mod.price;

          // Perk: Free Fries with Burger for Gold members
          if (isGold && isBurger && mod.name.toLowerCase().includes('fries')) {
            modPrice = 0;
            discounted = true;
          }

          return acc + modPrice;
        }, 0) || 0;

      return {
        ...item,
        finalPrice: item.price + modifiersTotal,
        isDiscounted: discounted,
      };
    });
  }

  /**
   * Create a new SavedOrder object from the current state.
   */
  static createSavedOrder(params: {
    id: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    total: number;
    amountPaid: number;
    status: OrderStatus;
    paymentStatus: PaymentStatus;
    orderType: any;
    staffId: string;
    storeId: string;
    terminalId: string;
    loyaltyProfile?: LoyaltyProfile | null;
  }): SavedOrder {
    const now = Date.now();
    const date = new Date(now);

    return {
      id: params.id,
      table: 'Counter', // Default placeholder
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      systemInfo: {
        storeId: params.storeId,
        terminalId: params.terminalId,
        staffId: params.staffId,
      },
      createdAt: now,
      items: params.items,
      subtotal: params.subtotal,
      tax: params.tax,
      total: params.total,
      amountPaid: params.amountPaid,
      status: params.status,
      paymentStatus: params.paymentStatus,
      orderType: params.orderType,
      isLoyalty: !!params.loyaltyProfile,
      loyaltySnapshot: params.loyaltyProfile
        ? {
            tierName: params.loyaltyProfile.currentTierId, // In real app, map to name
            tierColor: '#FACC15', // Mock gold color
            pointsEarned: Math.floor(params.total),
          }
        : undefined,
    };
  }
}
