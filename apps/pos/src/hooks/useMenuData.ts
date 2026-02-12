/**
 * @link e:\git\hyphae-pos\src\hooks\useMenuData.ts
 * @author Hyphae POS Team
 * @description Hook for fetching and syncing menu/inventory data (Offline-First).
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Concept, Category, Product, InventoryItem, RecipeDefinition, LoyaltyTier } from '../types';
import {
  CONCEPTS,
  CATEGORIES,
  PRODUCTS,
  INVENTORY_ITEMS,
  RECIPES,
  LOYALTY_TIERS,
} from '../data/mock_data';

const API_URL = 'http://localhost:3001';

// --- MOCK FETCHERS (Fallback to mock data if API is down) ---
const fetchConcepts = async (): Promise<Concept[]> => {
  try {
    const res = await fetch(`${API_URL}/concepts`);
    if (!res.ok) return CONCEPTS;
    return res.json();
  } catch {
    return CONCEPTS;
  }
};

const fetchCategories = async (): Promise<Category[]> => {
  try {
    const res = await fetch(`${API_URL}/categories`);
    if (!res.ok) return CATEGORIES;
    return res.json();
  } catch {
    return CATEGORIES;
  }
};

const fetchProducts = async (): Promise<Product[]> => {
  try {
    const res = await fetch(`${API_URL}/products`);
    if (!res.ok) return PRODUCTS;
    return res.json();
  } catch {
    return PRODUCTS;
  }
};

const fetchLoyaltyTiers = async (): Promise<LoyaltyTier[]> => {
  try {
    const res = await fetch(`${API_URL}/loyalty-tiers`);
    if (!res.ok) return LOYALTY_TIERS;
    return res.json();
  } catch {
    return LOYALTY_TIERS;
  }
};

export const useMenuData = () => {
  const queryClient = useQueryClient();

  // Queries
  const { data: concepts = CONCEPTS, isLoading: loadingConcepts } = useQuery({
    queryKey: ['concepts'],
    queryFn: fetchConcepts,
  });

  const { data: categories = CATEGORIES, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: products = PRODUCTS, isLoading: loadingProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: loyaltyTiers = LOYALTY_TIERS, isLoading: loadingTiers } = useQuery({
    queryKey: ['loyaltyTiers'],
    queryFn: fetchLoyaltyTiers,
  });

  // Mock Inventory/Recipes (No API yet)
  const inventory = INVENTORY_ITEMS;
  const recipes = RECIPES;

  const loading = loadingConcepts || loadingCategories || loadingProducts || loadingTiers;

  // Mutations
  const saveProductMutation = useMutation({
    mutationFn: async (product: Product) => {
      const response = await fetch(`${API_URL}/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!response.ok && response.status === 404) {
        await fetch(`${API_URL}/products`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(product),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const saveProduct = async (product: Product) => {
    try {
      await saveProductMutation.mutateAsync(product);
      return true;
    } catch {
      return false;
    }
  };

  // --- GETTERS ---
  const getCategoriesByConcept = (conceptId: string) => {
    return categories.filter((cat) => cat.conceptId === conceptId);
  };

  const getProductsByCategory = (categoryId: string) => {
    return products.filter((prod) => prod.categoryId === categoryId);
  };

  const getProductsByConcept = (conceptId: string) => {
    const conceptCatIds = categories
      .filter((cat) => cat.conceptId === conceptId)
      .map((cat) => cat.id);

    return products.filter((prod) => conceptCatIds.includes(prod.categoryId));
  };

  return {
    concepts,
    categories,
    products,
    loyaltyTiers,
    inventory,
    recipes,
    loading,
    error: null,
    getCategoriesByConcept,
    getProductsByCategory,
    getProductsByConcept,
    saveProduct,
    saveBatchProducts: async () => true, // Placeholder
    fetchMenuData: () => queryClient.invalidateQueries(),
  };
};
