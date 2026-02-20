/// <reference types="vite/client" />

import { AnalyzePayload } from '@hyphae/schemas';
import { Product } from '../types/schema';

const API_BASE_URL = 'http://127.0.0.1:3001/api';
const API_KEY = import.meta.env.VITE_HYPHAE_API_KEY;

export const ApiClient = {
    async analyzePerformance(transactions: AnalyzePayload['transactions'], menu: AnalyzePayload['menu']) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (API_KEY) {
                headers['x-api-key'] = API_KEY;
            }

            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ transactions, menu }),
            });

            if (response.status === 401) {
                throw new Error('Unauthorized: API Key invalid or missing');
            }

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('API Analysis Failed', error);
            if (error instanceof Error && error.message.includes('Unauthorized')) {
                return "Error: Security Check Failed (401). Check API Key.";
            }
            return "Strategic Analysis currently unavailable from backend.";
        }
    },

    async generateKitchenNote(productName: string) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (API_KEY) {
                headers['x-api-key'] = API_KEY;
            }

            const response = await fetch(`${API_BASE_URL}/kitchen-note`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ productName }),
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            return data.result;
        } catch (error) {
            return productName.substring(0, 10); // Fallback
        }
    },

    async getLoyaltySummary() {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (API_KEY) {
                headers['x-api-key'] = API_KEY;
            }

            const response = await fetch(`${API_BASE_URL}/loyalty-summary`, {
                headers,
            });

            if (!response.ok) throw new Error('API Error');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch loyalty summary', error);
            return { totalMembers: 0, recentEnrollments: 0 }; // Fallback
        }
    },

    async getInventory() {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (API_KEY) {
                headers['x-api-key'] = API_KEY;
            }
            const response = await fetch(`${API_BASE_URL}/inventory`, { headers });
            if (!response.ok) throw new Error('Failed to fetch inventory');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch inventory', error);
            return [];
        }
    },

    async getRecipes() {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (API_KEY) {
                headers['x-api-key'] = API_KEY;
            }
            const response = await fetch(`${API_BASE_URL}/recipes`, { headers });
            if (!response.ok) throw new Error('Failed to fetch recipes');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch recipes', error);
            return [];
        }
    },

    async getProducts() {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (API_KEY) {
                headers['x-api-key'] = API_KEY;
            }
            const response = await fetch(`${API_BASE_URL}/products`, { headers });
            if (!response.ok) throw new Error('Failed to fetch products');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch products', error);
            return [];
        }
    },

    async updateProducts(products: Product[]) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (API_KEY) {
                headers['x-api-key'] = API_KEY;
            }
            const response = await fetch(`${API_BASE_URL}/products`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(products)
            });
            if (!response.ok) throw new Error('Failed to update products');
            return { success: true };
        } catch (error) {
            console.error('Failed to update products', error);
            throw error;
        }
    },

    async deleteProduct(productId: string) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (API_KEY) {
                headers['x-api-key'] = API_KEY;
            }
            const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
                method: 'DELETE',
                headers
            });
            if (!response.ok) throw new Error('Failed to delete product');
            return { success: true };
        } catch (error) {
            console.error('Failed to delete product', error);
            throw error;
        }
    },

    async getTrash() {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;
            const response = await fetch(`${API_BASE_URL}/products/trash`, { headers });
            if (!response.ok) throw new Error('Failed to fetch trash');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch trash', error);
            return [];
        }
    },

    async restoreProduct(productId: string) {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;
            const response = await fetch(`${API_BASE_URL}/products/${productId}/restore`, {
                method: 'POST',
                headers
            });
            if (!response.ok) throw new Error('Failed to restore product');
            return { success: true };
        } catch (error) {
            console.error('Failed to restore product', error);
            throw error;
        }
    },

    async permanentlyDeleteProduct(productId: string) {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;
            const response = await fetch(`${API_BASE_URL}/products/${productId}/permanent`, {
                method: 'DELETE',
                headers
            });
            if (!response.ok) throw new Error('Failed to permanent delete product');
            return { success: true };
        } catch (error) {
            console.error('Failed to permanent delete product', error);
            throw error;
        }
    },

    async getSuppliers() {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;
            const response = await fetch(`${API_BASE_URL}/suppliers`, { headers });
            if (!response.ok) throw new Error('Failed to fetch suppliers');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch suppliers', error);
            return [];
        }
    },

    async createSupplier(supplier: any) {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;
            const response = await fetch(`${API_BASE_URL}/suppliers`, {
                method: 'POST',
                headers,
                body: JSON.stringify(supplier)
            });
            if (!response.ok) throw new Error('Failed to create supplier');
            return await response.json();
        } catch (error) {
            console.error('Failed to create supplier', error);
            throw error;
        }
    },

    async updateSupplier(id: string, supplier: any) {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;
            const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(supplier)
            });
            if (!response.ok) throw new Error('Failed to update supplier');
            return await response.json();
        } catch (error) {
            console.error('Failed to update supplier', error);
            throw error;
        }
    },

    async deleteSupplier(id: string) {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;
            const response = await fetch(`${API_BASE_URL}/suppliers/${id}`, {
                method: 'DELETE',
                headers
            });
            if (!response.ok) throw new Error('Failed to delete supplier');
            return await response.json();
        } catch (error) {
            console.error('Failed to delete supplier', error);
            throw error;
        }
    },

    async getSupplyOrders() {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;
            const response = await fetch(`${API_BASE_URL}/supply-orders`, { headers });
            if (!response.ok) throw new Error('Failed to fetch supply orders');
            return await response.json();
        } catch (error) {
            console.error('Failed to fetch supply orders', error);
            return [];
        }
    },

    async createSupplyOrder(order: any) {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;
            const response = await fetch(`${API_BASE_URL}/supply-orders`, {
                method: 'POST',
                headers,
                body: JSON.stringify(order)
            });
            if (!response.ok) throw new Error('Failed to create supply order');
            return await response.json();
        } catch (error) {
            console.error('Failed to create supply order', error);
            throw error;
        }
    },

    async updateSupplyOrder(id: string, order: any) {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;
            const response = await fetch(`${API_BASE_URL}/supply-orders/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(order)
            });
            if (!response.ok) throw new Error('Failed to update supply order');
            return await response.json();
        } catch (error) {
            console.error('Failed to update supply order', error);
            throw error;
        }
    },

    async transferInventory(itemId: string, quantity: number, direction: 'EXIT' | 'INGRESS', note?: string) {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;
            const response = await fetch(`${API_BASE_URL}/inventory/transfer`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ itemId, quantity, direction, note })
            });
            if (!response.ok) throw new Error('Failed to transfer inventory');
            return await response.json();
        } catch (error) {
            console.error('Failed to transfer inventory', error);
            throw error;
        }
    }
};
