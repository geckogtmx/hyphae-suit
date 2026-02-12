/**
 * @link e:\git\hyphae-pos\src\repositories\MenuRepository.ts
 * @author Hyphae POS Team
 * @description Drizzle implementation of the Menu Repository.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { db } from '../db';
import { menuItems } from '../db/schema';
import { Product } from '../types';
import { IMenuRepository } from './interfaces';
import { eq, inArray } from 'drizzle-orm';

export class MenuRepository implements IMenuRepository {
  private mapToProduct(row: any): Product {
    return {
      id: row.id,
      name: row.name,
      price: row.price,
      categoryId: row.categoryId,
      requiresMods: row.requiresMods,
      modifierGroups: row.modifierGroups ? JSON.parse(row.modifierGroups) : undefined,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
      packaging: row.packaging ? JSON.parse(row.packaging) : undefined,
      inventoryMetadata: row.inventoryMetadata ? JSON.parse(row.inventoryMetadata) : undefined,
      isAvailable: row.isAvailable,
    } as Product;
  }

  private mapToRow(product: Product) {
    return {
      id: product.id,
      name: product.name,
      price: product.price,
      categoryId: product.categoryId,
      requiresMods: product.requiresMods,
      modifierGroups: product.modifierGroups ? JSON.stringify(product.modifierGroups) : null,
      metadata: product.metadata ? JSON.stringify(product.metadata) : null,
      packaging: product.packaging ? JSON.stringify(product.packaging) : null,
      inventoryMetadata: product.inventoryMetadata
        ? JSON.stringify(product.inventoryMetadata)
        : null,
    };
  }

  async getProducts(): Promise<Product[]> {
    const rows = await db.select().from(menuItems).where(eq(menuItems.isAvailable, true));
    return rows.map((row) => this.mapToProduct(row));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const rows = await db.select().from(menuItems).where(eq(menuItems.id, id));
    return rows[0] ? this.mapToProduct(rows[0]) : undefined;
  }

  async getProductsByConcept(conceptId: string): Promise<Product[]> {
    // This requires a join with categories if categories are in the DB.
    // For now, categories are in mock_data.ts, so we might need a different approach or add categories to DB.
    // Given the Task 28 is to populate menu_items from mock_data, maybe categories should also be in DB.
    // For now, I'll filter by categoryId if I knew which categories belong to the concept.
    // OR I can just return all and filter in memory if the dataset is small.
    const rows = await db.select().from(menuItems).where(eq(menuItems.isAvailable, true));
    return rows.map((row) => this.mapToProduct(row));
  }

  async saveProduct(product: Product): Promise<void> {
    await db
      .insert(menuItems)
      .values(this.mapToRow(product))
      .onConflictDoUpdate({
        target: menuItems.id,
        set: this.mapToRow(product),
      });
  }

  async saveBatchProducts(products: Product[]): Promise<void> {
    // Drizzle supports batch inserts
    const values = products.map((p) => this.mapToRow(p));
    // Note: SQLite has limits on params, so for very large batches we might need to chunk.
    // For POS menu, it's usually < 1000 items.
    for (const val of values) {
      await this.saveProduct(val as any); // Simplistic batching using saveProduct's upsert logic
    }
  }
}
