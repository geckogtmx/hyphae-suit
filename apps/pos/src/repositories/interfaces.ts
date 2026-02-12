/**
 * @link e:\git\hyphae-pos\src\repositories\interfaces.ts
 * @author Hyphae POS Team
 * @description Repository interfaces for database abstraction.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { Product, SavedOrder } from '../types';

export interface IMenuRepository {
  getProducts(): Promise<Product[]>;
  getProductById(id: string): Promise<Product | undefined>;
  getProductsByConcept(conceptId: string): Promise<Product[]>;
  saveProduct(product: Product): Promise<void>;
  saveBatchProducts(products: Product[]): Promise<void>;
}

export interface IOrderRepository {
  getActiveOrders(): Promise<SavedOrder[]>;
  getCompletedOrders(): Promise<SavedOrder[]>;
  saveOrder(order: SavedOrder): Promise<void>;
  updateOrderStatus(orderId: string, status: string): Promise<void>;
}
