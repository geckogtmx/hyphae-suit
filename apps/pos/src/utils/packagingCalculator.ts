/**
 * @link e:\git\hyphae-pos\src\utils\packagingCalculator.ts
 * @author Hyphae POS Team
 * @description Heuristic-based logic for determining required order ancillaries and packaging.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import { OrderType } from '../types';

// --- CONFIGURATION ---
const BAG_CAPACITY_VP = 8; // Max Volume Points per standard bag

const ANCILLARIES: Record<string, Record<string, number>> = {
  // Base items per sale item (Layer A)
  codebs_burger: { SKU_WRAPPER: 1 },
  codebs_basic: { SKU_WRAPPER: 1 },
  t1: { SKU_BOAT_SMALL: 1 },
  t2: { SKU_BOAT_SMALL: 1 },
  t3: { SKU_BOAT_SMALL: 1 },
  t4: { SKU_BOAT_SMALL: 1 },
  b1: { SKU_WRAPPER_XL: 1 },
  b2: { SKU_WRAPPER_XL: 1 },
  b3: { SKU_BOWL_LID: 1 },
};

// Global Heuristics
const GLOBAL_ITEMS = {
  MODIFIER_CUP: { SKU: 'CUP_2OZ', QTY: 1 },
  MODIFIER_LID: { SKU: 'LID_2OZ', QTY: 1 },
  NAPKIN_BASE: 4, // 4 per order base
  NAPKIN_PER_MAIN: 1, // 1 per main item
  NAPKIN_PER_MESSY: 2, // 2 extra per item where isMessy=true
  BAG_SKU: 'BAG_STD', // The SKU for the carrier bag
};

interface CalculationItem {
  sku: string; // The Product ID (e.g. 'codebs_burger')
  qty: number;
  volumePoints: number;
  isMessy: boolean;
  modifiers: string[];
}

interface OrderPayload {
  orderId: string;
  serviceType: OrderType;
  items: CalculationItem[];
}

interface CalculationResult {
  success: boolean;
  orderId: string;
  packagingUsed: Record<string, number>;
}

export const calculatePackagingFallback = (orderPayload: OrderPayload): CalculationResult => {
  const packagingUsed: Record<string, number> = {};

  // Safety check for payload
  if (!orderPayload || !Array.isArray(orderPayload.items)) {
    return {
      success: false,
      orderId: orderPayload?.orderId || 'unknown',
      packagingUsed: {},
    };
  }

  const addToPackaging = (sku: string, qty: number) => {
    if (!sku) return;
    if (!packagingUsed[sku]) packagingUsed[sku] = 0;
    packagingUsed[sku] += qty;
  };

  let totalVolumePoints = 0;
  let totalItems = 0;
  let totalMessyItems = 0;

  // --- Layer A/C Deduction Loop (Item-by-Item) ---
  orderPayload.items.forEach((item) => {
    if (!item) return;

    const itemQty = item.qty || 1;
    totalItems += itemQty;
    totalVolumePoints += (item.volumePoints || 0) * itemQty;
    if (item.isMessy) totalMessyItems += itemQty;

    // 1. Static Packaging from ANCILLARIES
    if (item.sku) {
      const staticPkg = ANCILLARIES[item.sku];
      if (staticPkg) {
        Object.entries(staticPkg).forEach(([sku, qty]) => {
          addToPackaging(sku, qty * itemQty);
        });
      }
    }

    // 2. Modifiers "On Side" Logic
    const safeModifiers = Array.isArray(item.modifiers) ? item.modifiers : [];
    const hasOnSide = safeModifiers.some(
      (mod) => mod && typeof mod === 'string' && mod.toLowerCase().includes('side')
    );

    if (hasOnSide) {
      addToPackaging(GLOBAL_ITEMS.MODIFIER_CUP.SKU, GLOBAL_ITEMS.MODIFIER_CUP.QTY * itemQty);
      addToPackaging(GLOBAL_ITEMS.MODIFIER_LID.SKU, GLOBAL_ITEMS.MODIFIER_LID.QTY * itemQty);
    }
  });

  // --- Layer B Deduction (Bin Packing / Bags) ---
  // Rule: Every order requires at least one bag if it has items.
  if (
    (orderPayload.serviceType === 'Takeout' || orderPayload.serviceType === 'Delivery') &&
    totalItems > 0
  ) {
    // Enforce minimum of 1 bag
    const bagsNeeded = Math.max(1, Math.ceil(totalVolumePoints / BAG_CAPACITY_VP));
    addToPackaging(GLOBAL_ITEMS.BAG_SKU, bagsNeeded);
  }

  // --- Layer C Deduction (Napkins) ---
  const napkinCount =
    GLOBAL_ITEMS.NAPKIN_BASE +
    GLOBAL_ITEMS.NAPKIN_PER_MAIN * totalItems +
    GLOBAL_ITEMS.NAPKIN_PER_MESSY * totalMessyItems;

  addToPackaging('NAPKIN', napkinCount);

  return {
    success: true,
    orderId: orderPayload.orderId,
    packagingUsed,
  };
};
