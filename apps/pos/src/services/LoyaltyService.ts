/**
 * @author Hyphae POS Team
 * @description Service for managing loyalty profiles via the backend API.
 * @version 1.0.0
 * @last-updated 2026-02-17
 */

import { LoyaltyProfile, LoyaltyTransaction } from '../types';

export class LoyaltyService {
    /**
     * Fetch a loyalty profile by card number.
     */
    static async fetchProfile(cardNumber: string): Promise<LoyaltyProfile | null> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/loyalty/${cardNumber}`, {
                headers: {
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || 'dev-secret-123',
                },
            });

            if (!response.ok) {
                if (response.status === 404) return null;
                throw new Error('Failed to fetch loyalty profile');
            }

            return await response.json();
        } catch (error) {
            console.error('[LoyaltyService] Fetch Profile Error:', error);
            return null;
        }
    }

    /**
     * Fetch transaction history for a profile.
     */
    static async fetchHistory(profileId: string): Promise<LoyaltyTransaction[]> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/loyalty/profiles/${profileId}/history`, {
                headers: {
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || 'dev-secret-123',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch loyalty history');
            }

            return await response.json();
        } catch (error) {
            console.error('[LoyaltyService] Fetch History Error:', error);
            return [];
        }
    }
}
