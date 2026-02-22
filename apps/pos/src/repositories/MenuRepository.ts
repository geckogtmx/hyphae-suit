/**
 * @link e:\git\hyphae-pos\src\repositories\MenuRepository.ts
 * @author Hyphae POS Team
 * @description Drizzle implementation of the Menu Repository using relational schema.
 * @version 2.0.0
 * @last-updated 2026-02-12
 */

import { db } from '../db';
import { schema } from '@hyphae/database';
import { Product, ModifierGroup, ModifierOption } from '@hyphae/schemas';
import { IMenuRepository } from './interfaces';
import { eq } from 'drizzle-orm';

export class MenuRepository implements IMenuRepository {

  // Helper to transform DB result to Domain Object
  private mapToProduct(row: any): Product {
    // row is the result of db.query.products.findFirst/Many with relations

    const modifierGroups: ModifierGroup[] = (row.modifierGroups || []).map((pm: any) => {
      const group = pm.group;
      if (!group) return null;

      return {
        id: group.id,
        name: group.name,
        required: group.required,
        multiSelect: group.multiSelect,
        options: (group.options || []).map((opt: any) => ({
          id: opt.id,
          name: opt.name,
          price: opt.price,
          kitchenLabel: opt.kitchenLabel,
          inventoryMetadata: {
            recipeId: opt.recipeId || undefined,
            directDepletion: opt.inventoryItemId ? [{ inventoryItemId: opt.inventoryItemId, quantity: 1, unit: 'count' }] : undefined
          }
        }))
      };
    }).filter((g: any) => g !== null);

    return {
      id: row.id,
      name: row.name,
      categoryId: row.categoryId,
      price: row.price,
      requiresMods: row.requiresMods,
      packaging: row.packagingSku ? { sku: row.packagingSku, volumePoints: 0, isMessy: false } : undefined,
      metadata: { kitchenLabel: row.kitchenLabel },
      inventoryMetadata: {
        recipeId: row.recipeId || undefined,
        directDepletion: row.inventoryItemId ? [{ inventoryItemId: row.inventoryItemId, quantity: 1, unit: 'count' }] : undefined
      },
      modifierGroups: modifierGroups.length > 0 ? modifierGroups : undefined,
      active: row.isActive
    };
  }

  async getProducts(): Promise<Product[]> {
    const rows = await db.query.products.findMany({
      where: eq(schema.products.isActive, true),
      with: {
        modifierGroups: {
          with: {
            group: {
              with: {
                options: true
              }
            }
          },
          orderBy: (productModifiers, { asc }) => [asc(productModifiers.sortOrder)]
        }
      }
    });

    return rows.map(row => this.mapToProduct(row));
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const row = await db.query.products.findFirst({
      where: eq(schema.products.id, id),
      with: {
        modifierGroups: {
          with: {
            group: {
              with: {
                options: true
              }
            }
          },
          orderBy: (productModifiers, { asc }) => [asc(productModifiers.sortOrder)]
        }
      }
    });

    return row ? this.mapToProduct(row) : undefined;
  }

  async getProductsByConcept(conceptId: string): Promise<Product[]> {
    // Join with categories to filter by concept
    // Drizzle query builder makes this easy if relations exist
    // However, product -> category relation is defined
    const rows = await db.query.products.findMany({
      where: eq(schema.products.isActive, true),
      with: {
        category: true,
        modifierGroups: {
          with: {
            group: {
              with: {
                options: true
              }
            }
          },
          orderBy: (productModifiers, { asc }) => [asc(productModifiers.sortOrder)]
        }
      }
    });

    // Filter in memory or use advanced where clause if relation filtering is supported in this version
    // For now, in memory filter is safe for POS data sizes
    return rows
      .filter(r => r.category.conceptId === conceptId)
      .map(row => this.mapToProduct(row));
  }

  async saveProduct(product: Product): Promise<void> {
    throw new Error("Save Not Implemented for Relational Schema yet - Use Seed Script");
  }

  async saveBatchProducts(products: Product[]): Promise<void> {
    throw new Error("Batch Save Not Implemented for Relational Schema yet - Use Seed Script");
  }
}
