/**
 * @link e:\git\hyphae-suit\apps\pos\src\data\mock_data_expanded.ts
 * @author Hyphae POS Team
 * @description Extended mock data with Suppliers and Supply Chain elements.
 * @version 1.1.0
 */

import { STAFF_PROFILES, SYSTEM_CONFIG, INVENTORY_ITEMS, RECIPES, CONCEPTS, CATEGORIES, PRODUCTS, LOYALTY_TIERS, LOYALTY_TRANSACTIONS, LOYALTY_CARDS, LOYALTY_PROFILES } from './mock_data';

// --- SUPPLIERS ---
export interface Supplier {
    id: string;
    name: string;
    contactName: string;
    email: string;
    phone: string;
    category: 'Produce' | 'Meat' | 'DryGoods' | 'Packaging';
    leadTimeDays: number;
}

export const SUPPLIERS: Supplier[] = [
    {
        id: 'supp_farm_fresh',
        name: 'Farm Fresh Produce',
        contactName: 'Joe Farmer',
        email: 'orders@farmfresh.com',
        phone: '555-0199',
        category: 'Produce',
        leadTimeDays: 1,
    },
    {
        id: 'supp_meat_bros',
        name: 'The Meat Bros',
        contactName: 'Sam Butcher',
        email: 'pork@meatbros.com',
        phone: '555-0200',
        category: 'Meat',
        leadTimeDays: 2,
    },
    {
        id: 'supp_rest_depot',
        name: 'Restaurant Depot',
        contactName: 'General Mgr',
        email: 'support@rdepot.com',
        phone: '555-9000',
        category: 'DryGoods',
        leadTimeDays: 0, // Cash & Carry
    },
];

export {
    STAFF_PROFILES, SYSTEM_CONFIG, INVENTORY_ITEMS, RECIPES, CONCEPTS, CATEGORIES, PRODUCTS,
    LOYALTY_TIERS, LOYALTY_TRANSACTIONS, LOYALTY_CARDS, LOYALTY_PROFILES
};
