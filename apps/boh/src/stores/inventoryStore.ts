
import { create } from 'zustand';
import type { InventoryItem, InventoryStore } from '../types';
import { mockInventory } from '../lib/mockData';

export const useInventoryStore = create<InventoryStore>((set) => ({
    inventory: mockInventory, // Mock data
    getRawInventory: () => mockInventory.filter((i) => i.type === 'RAW'),
    getPrepInventory: () => mockInventory.filter((i) => i.type === 'PREP'),

    updateQuantity: (id, quantity) =>
        set((state) => ({
            inventory: state.inventory.map((i) =>
                i.id === id ? { ...i, currentStock: quantity } : i
            ),
        })),

    adjustParLevel: (id, level) =>
        set((state) => ({
            inventory: state.inventory.map((i) =>
                i.id === id ? { ...i, parLevel: level } : i
            ),
        })),
}));
