/**
 * @author Hyphae POS Team
 * @description Zustand store for BOH inventory, suppliers, and supply orders.
 * @version 1.1.0
 * @last-updated 2026-02-23
 */

import { create } from 'zustand';
import type { InventoryItem, InventoryStore } from '../types';
import { mockInventory } from '../lib/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
            const res = await fetch(`${API_URL}/inventory`, {
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
                fetch(`${API_URL}/suppliers`, { headers: reqHeaders }),
                fetch(`${API_URL}/supply-orders`, { headers: reqHeaders })
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
