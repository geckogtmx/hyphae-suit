
import { create } from 'zustand';
import type { InventoryItem, InventoryStore } from '../types';
import { mockInventory } from '../lib/mockData';

export const useInventoryStore = create<InventoryStore & {
    suppliers: any[];
    supplyOrders: any[];
    fetchSupplyOrders: () => Promise<void>;
}>((set, get) => ({
    inventory: [], // Start empty
    suppliers: [],
    supplyOrders: [],
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

    fetchSupplyOrders: async () => {
        try {
            const apiKey = import.meta.env.VITE_HYPHAE_API_KEY;

            const reqHeaders = {
                'x-api-key': apiKey || ''
            };

            const [suppliersRes, ordersRes] = await Promise.all([
                fetch('http://localhost:3001/api/suppliers', { headers: reqHeaders }),
                fetch('http://localhost:3001/api/supply-orders', { headers: reqHeaders })
            ]);

            if (suppliersRes.ok && ordersRes.ok) {
                const suppliers = await suppliersRes.json();
                const orders = await ordersRes.json();
                set({ suppliers, supplyOrders: orders.filter((o: any) => o.status === 'PLACED') });
            }
        } catch (e) {
            console.error('Failed to fetch orders/suppliers', e);
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
