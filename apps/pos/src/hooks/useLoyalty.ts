/**
 * @link e:\git\hyphae-pos\src\hooks\useLoyalty.ts
 * @author Hyphae POS Team
 * @description Hook for fetching loyalty user data (Profiles, Cards, Transactions).
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoyaltyProfile, LoyaltyCard, LoyaltyTransaction } from '../types';
import { LOYALTY_PROFILES, LOYALTY_CARDS, LOYALTY_TRANSACTIONS } from '../data/mock_data';

const API_URL = 'http://localhost:3001';

// --- MOCK FETCHERS ---
const fetchProfiles = async (): Promise<LoyaltyProfile[]> => {
  try {
    const res = await fetch(`${API_URL}/loyalty-profiles`);
    if (!res.ok) return LOYALTY_PROFILES;
    return res.json();
  } catch {
    return LOYALTY_PROFILES;
  }
};

const fetchCards = async (): Promise<LoyaltyCard[]> => {
  try {
    const res = await fetch(`${API_URL}/loyalty-cards`);
    if (!res.ok) return LOYALTY_CARDS;
    return res.json();
  } catch {
    return LOYALTY_CARDS;
  }
};

const fetchTransactions = async (): Promise<LoyaltyTransaction[]> => {
  try {
    const res = await fetch(`${API_URL}/loyalty-transactions`);
    if (!res.ok) return LOYALTY_TRANSACTIONS;
    return res.json();
  } catch {
    return LOYALTY_TRANSACTIONS;
  }
};

export const useLoyalty = () => {
  const queryClient = useQueryClient();

  const { data: profiles = LOYALTY_PROFILES, isLoading: loadingProfiles } = useQuery({
    queryKey: ['loyaltyProfiles'],
    queryFn: fetchProfiles,
  });

  const { data: cards = LOYALTY_CARDS, isLoading: loadingCards } = useQuery({
    queryKey: ['loyaltyCards'],
    queryFn: fetchCards,
  });

  const { data: transactions = LOYALTY_TRANSACTIONS, isLoading: loadingTx } = useQuery({
    queryKey: ['loyaltyTransactions'],
    queryFn: fetchTransactions,
  });

  const loading = loadingProfiles || loadingCards || loadingTx;

  // --- LOGIC ---

  // Find Profile by Card Code
  const getProfileByCard = (code: string): LoyaltyProfile | null => {
    const cardCode = code.toUpperCase();
    const activeCard = cards.find((c) => c.code === cardCode && c.status === 'ACTIVE');

    if (!activeCard) return null;

    const profile = profiles.find((p) => p.id === activeCard.userId);
    if (!profile) return null;

    // Hydrate
    const userTx = transactions
      .filter((t) => t.customerId === profile.id)
      .sort((a, b) => b.timestamp - a.timestamp);

    return {
      ...profile,
      activeCard: activeCard,
      recentTransactions: userTx,
    };
  };

  return {
    profiles,
    cards,
    transactions,
    loading,
    getProfileByCard,
  };
};
