
import { create } from 'zustand';
import type { InventoryItem, InventoryStore } from '../types';
import { mockInventory } from '../lib/mockData';

export const useInventoryStore = create<InventoryStore>((set, get) => ({
    inventory: [], // Start empty
    getRawInventory: () => get().inventory.filter((i) => i.type === 'RAW'),
    getPrepInventory: () => get().inventory.filter((i) => i.type === 'PREP'),

    fetchInventory: async () => {
        try {
            const apiKey = import.meta.env.VITE_HYPHAE_API_KEY;
            const res = await fetch('http://localhost:3001/api/inventory', {
                headers: {
                    'x-api-key': apiKey || ''
                }
            });
            if (res.ok) {
                const data = await res.json();
                set({ inventory: data });
            } else {
                console.error('Failed to fetch inventory', res.status);
                set({ inventory: mockInventory }); // Fallback for demo
            }
        } catch (e) {
            console.error('Inventory fetch error', e);
            set({ inventory: mockInventory });
        }
    },

    updateQuantity: (id, quantity) =>
        set((state) => ({
            inventory: state.inventory.map((i) =>
                i.id === id ? { ...i, stockKitchen: quantity } : i
            ),
        })),

    adjustParLevel: (id, level) =>
        set((state) => ({
            inventory: state.inventory.map((i) =>
                i.id === id ? { ...i, parLevel: level } : i
            ),
        })),
}));
