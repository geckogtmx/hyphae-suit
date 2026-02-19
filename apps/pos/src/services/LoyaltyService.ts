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

    /**
     * Register a new loyalty profile.
     */
    static async registerProfile(data: { name: string; phone?: string; email?: string; cardNumber?: string }): Promise<LoyaltyProfile> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/loyalty/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || 'dev-secret-123',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Registration failed');
            }

            const result = await response.json();
            return result.profile;
        } catch (error: any) {
            console.error('[LoyaltyService] Registration Error:', error);
            throw error;
        }
    }

    /**
     * Redeem points for a profile.
     */
    static async redeemPoints(profileId: string, points: number): Promise<{ success: boolean; newBalance?: number }> {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/loyalty/redeem`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || 'dev-secret-123',
                },
                body: JSON.stringify({ profileId, points }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Redemption failed');
            }

            return await response.json();
        } catch (error: any) {
            console.error('[LoyaltyService] Redeem Error:', error);
            throw error; // Re-throw to let UI handle it
        }
    }
    /**
     * Swap a loyalty profile to a new physical card.
     */
    static async swapCard(currentCardNumber: string, newCardNumber: string): Promise<{ success: boolean; newCardNumber: string }> {
        const API_URL = import.meta.env.VITE_API_URL || '';
        try {
            const response = await fetch(`${API_URL}/loyalty/swap-card`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': import.meta.env.VITE_HYPHAE_API_KEY || 'dev-secret-123',
                },
                body: JSON.stringify({ currentCardNumber, newCardNumber }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Card swap failed');
            }

            return await response.json();
        } catch (error: any) {
            console.error('[LoyaltyService] Swap Error:', error);
            throw error;
        }
    }
}
