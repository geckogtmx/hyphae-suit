/**
 * @link e:\git\hyphae-pos\src\hooks\useLoyalty.ts
 * @author Hyphae POS Team
 * @description Hook for fetching loyalty user data securely via API.
 * @version 1.0.1
 * @last-updated 2026-02-19
 */

import { useState } from 'react';
import { LoyaltyService } from '../services/LoyaltyService';
import { LoyaltyProfile, LoyaltyTransaction } from '../types';

export const useLoyalty = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lookup a loyalty profile by card number (or code).
   */
  const getProfileByCard = async (code: string): Promise<LoyaltyProfile | null> => {
    setLoading(true);
    setError(null);
    try {
      const profile = await LoyaltyService.fetchProfile(code);
      if (!profile) {
        // Not meaningful to set error here if it's just not found, let caller handle
        return null;
      }
      return profile;
    } catch (err: any) {
      setError(err.message || 'Failed to lookup loyalty card');
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetch transaction history for a profile.
   */
  const getHistory = async (profileId: string): Promise<LoyaltyTransaction[]> => {
    setLoading(true);
    try {
      const history = await LoyaltyService.fetchHistory(profileId);
      return history;
    } catch (err: any) {
      console.error('Failed to fetch history', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    getProfileByCard,
    getHistory,
  };
};
