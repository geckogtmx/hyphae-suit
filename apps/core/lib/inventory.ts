import { InventoryItem } from "../types/schema";

export const InventoryService = {
  /**
   * Checks for items that are below their Par Level.
   * Returns an array of items needing attention.
   */
  getLowStockItems: (inventory: InventoryItem[]): InventoryItem[] => {
    return inventory.filter(item => {
      // If parLevel is defined, check against it.
      if (item.parLevel !== undefined) {
        return item.currentStock <= item.parLevel;
      }
      return false;
    });
  },

  /**
   * Calculates the stock health percentage for an item.
   * Useful for progress bars.
   */
  getStockHealth: (item: InventoryItem): number => {
    if (!item.parLevel || item.parLevel === 0) return 100;
    const percentage = (item.currentStock / item.parLevel) * 100;
    return Math.min(percentage, 100); // Cap at 100% for visualization
  },

  /**
   * Formats the alert message for an item.
   */
  getAlertMessage: (item: InventoryItem): string => {
    const deficit = (item.parLevel || 0) - item.currentStock;
    return `${item.name} is below par level (${item.currentStock}/${item.parLevel} ${item.stockUnit}). Order ${deficit} ${item.stockUnit} immediately.`;
  }
};