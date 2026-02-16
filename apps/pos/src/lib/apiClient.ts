/// <reference types="vite/client" />

import { AnalyzePayload } from '@hyphae/schemas';

const API_BASE_URL = 'http://localhost:3001/api';
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

    async generateKitchenNote(payload: string | any) {
        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (API_KEY) {
                headers['x-api-key'] = API_KEY;
            }

            // Determine payload structure
            const body = typeof payload === 'string'
                ? { productName: payload }
                : { productName: `Order #${payload.id}`, orderDetails: payload };

            const response = await fetch(`${API_BASE_URL}/kitchen-note`, {
                method: 'POST',
                headers,
                body: JSON.stringify(body),
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('Kitchen Note Failed', error);
            // Fallback for string or object
            return typeof payload === 'string' ? payload.substring(0, 10) : "Offline Ticket";
        }
    },

    async getKitchenStatus() {
        try {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (API_KEY) headers['x-api-key'] = API_KEY;

            const response = await fetch(`${API_BASE_URL}/kitchen-status`, { headers });

            if (!response.ok) {
                console.warn('Kitchen Status Poll: API Error', response.status);
                return {};
            }
            return await response.json();
        } catch (error) {
            console.error('Kitchen Status Poll Failed', error);
            return {};
        }
    }
};
