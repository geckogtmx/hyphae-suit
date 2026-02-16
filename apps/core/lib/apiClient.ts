
const API_BASE_URL = 'http://localhost:3001/api';

export const ApiClient = {
    async analyzePerformance(transactions: any[], menu: any[]) { // Using 'any' for speed, ideally typed
        try {
            const response = await fetch(`${API_BASE_URL}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ transactions, menu }),
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.result;
        } catch (error) {
            console.error('API Analysis Failed', error);
            return "Strategic Analysis currently unavailable from backend.";
        }
    },

    async generateKitchenNote(productName: string) {
        try {
            const response = await fetch(`${API_BASE_URL}/kitchen-note`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productName }),
            });

            if (!response.ok) throw new Error('API Error');
            const data = await response.json();
            return data.result;
        } catch (error) {
            return productName.substring(0, 10); // Fallback
        }
    }
};
