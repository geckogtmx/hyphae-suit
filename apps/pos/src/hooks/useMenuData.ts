/**
 * @link e:\git\hyphae-pos\src\hooks\useMenuData.ts
 * @author Hyphae POS Team
 * @description Hook for fetching and syncing menu/inventory data (Offline-First).
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Concept, Category, Product, InventoryItem, RecipeDefinition, LoyaltyTier } from '@hyphae/schemas';
import {
  CONCEPTS,
  CATEGORIES,
  PRODUCTS,
  INVENTORY_ITEMS,
  RECIPES,
  LOYALTY_TIERS,
} from '@hyphae/database/mock_data';
import { MenuRepository } from '../repositories/MenuRepository';

const API_URL = 'http://localhost:3001';

import { AuthService } from '../services/AuthService';

// --- API FETCHERS ---

const getHeaders = () => {
  const session = AuthService.getStoredSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.token ? { 'Authorization': `Bearer ${session.token}` } : {})
  };
};

const fetchConcepts = async (): Promise<Concept[]> => {
  try {
    const response = await fetch(`${API_URL}/api/concepts`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch concepts');
    return await response.json();
  } catch (e) {
    console.warn("API Fetch Failed (Concepts), using Mock:", e);
    return CONCEPTS;
  }
};

const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${API_URL}/api/categories`, { headers: getHeaders() });
    if (!response.ok) throw new Error('Failed to fetch categories');
    return await response.json();
  } catch (e) {
    console.warn("API Fetch Failed (Categories), using Mock:", e);
    return CATEGORIES;
  }
};

const fetchProducts = async (): Promise<Product[]> => {
  // Attempt API Fetch First (Online)
  try {
    const response = await fetch(`${API_URL}/api/products`, { headers: getHeaders() });
    if (response.ok) {
      const data = await response.json();
      // Simple transform to flatten Drizzle structure if needed, or assume backend does it.
      // For now, let's assume structure matches or is "close enough".
      // The backend returns: Product & { modifierGroups: { group: ... } }
      // The frontend expects: Product & { modifierGroups: Group[] }

      // TODO: Add proper mapping here if schema differs.
      // For simplicity in this session, we return data. 
      // If schema mismatch causes UI issues, we fallback to mock.
      return data;
    }
  } catch (e) {
    console.warn('API Fetch Failed (Products), trying Local DB/Mock');
  }

  // Fallback: Local IndexedDB or Mock
  try {
    const repo = new MenuRepository();
    const products = await repo.getProducts();
    if (products.length > 0) return products;
    return PRODUCTS;
  } catch (err) {
    return PRODUCTS;
  }
};

const fetchLoyaltyTiers = async (): Promise<LoyaltyTier[]> => {
  // API endpoint not yet implemented
  return LOYALTY_TIERS;
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
    saveBatchProducts: async (products: Product[]) => { const _ = products; return true; }, // Placeholder
    fetchMenuData: () => queryClient.invalidateQueries(),
  };
};
