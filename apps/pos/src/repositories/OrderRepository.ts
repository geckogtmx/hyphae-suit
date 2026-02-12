/**
 * @link e:\git\hyphae-pos\src\repositories\OrderRepository.ts
 * @author Hyphae POS Team
 * @description Drizzle implementation of the Order Repository.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { db } from '../db';
import { orders } from '../db/schema';
import { SavedOrder } from '../types';
import { IOrderRepository } from './interfaces';
import { eq, desc, ne } from 'drizzle-orm';

export class OrderRepository implements IOrderRepository {
  private mapToOrder(row: any): SavedOrder {
    return {
      id: row.id,
      table: row.table,
      time: row.time,
      systemInfo: {
        storeId: row.storeId,
        terminalId: row.terminalId,
        staffId: row.staffId,
      },
      createdAt: row.createdAt,
      cookingStartedAt: row.cookingStartedAt || undefined,
      readyAt: row.readyAt || undefined,
      completedAt: row.completedAt || undefined,
      items: JSON.parse(row.items),
      subtotal: row.subtotal,
      tax: row.tax,
      total: row.total,
      amountPaid: row.amountPaid,
      status: row.status as any,
      paymentStatus: row.paymentStatus as any,
      orderType: row.orderType as any,
      confirmationNumber: row.confirmationNumber || undefined,
      tenderedAmount: row.tenderedAmount || undefined,
      tipAmount: row.tipAmount || undefined,
      isLoyalty: row.isLoyalty || undefined,
      loyaltySnapshot: row.loyaltySnapshot ? JSON.parse(row.loyaltySnapshot) : undefined,
    };
  }

  private mapToRow(order: SavedOrder) {
    return {
      id: order.id,
      table: order.table,
      time: order.time,
      storeId: order.systemInfo?.storeId || 'unknown',
      terminalId: order.systemInfo?.terminalId || 'unknown',
      staffId: order.systemInfo?.staffId || 'unknown',
      createdAt: order.createdAt,
      cookingStartedAt: order.cookingStartedAt || null,
      readyAt: order.readyAt || null,
      completedAt: order.completedAt || null,
      updatedAt: Date.now(),
      items: JSON.stringify(order.items),
      subtotal: order.subtotal,
      tax: order.tax,
      total: order.total,
      amountPaid: order.amountPaid,
      status: order.status,
      paymentStatus: order.paymentStatus,
      orderType: order.orderType,
      confirmationNumber: order.confirmationNumber || null,
      tenderedAmount: order.tenderedAmount || null,
      tipAmount: order.tipAmount || null,
      isLoyalty: order.isLoyalty || false,
      loyaltySnapshot: order.loyaltySnapshot ? JSON.stringify(order.loyaltySnapshot) : null,
    };
  }

  async getActiveOrders(): Promise<SavedOrder[]> {
    const rows = await db
      .select()
      .from(orders)
      .where(ne(orders.status, 'Completed'))
      .orderBy(desc(orders.createdAt));
    return rows.map((row) => this.mapToOrder(row));
  }

  async getCompletedOrders(): Promise<SavedOrder[]> {
    const rows = await db
      .select()
      .from(orders)
      .where(eq(orders.status, 'Completed'))
      .orderBy(desc(orders.createdAt));
    return rows.map((row) => this.mapToOrder(row));
  }

  async saveOrder(order: SavedOrder): Promise<void> {
    await db
      .insert(orders)
      .values(this.mapToRow(order))
      .onConflictDoUpdate({
        target: orders.id,
        set: this.mapToRow(order),
      });
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await db
      .update(orders)
      .set({
        status,
        updatedAt: Date.now(),
        cookingStartedAt: status === 'Kitchen' ? Date.now() : undefined,
        readyAt: status === 'Ready' ? Date.now() : undefined,
        completedAt: status === 'Completed' ? Date.now() : undefined,
      } as any)
      .where(eq(orders.id, orderId));
  }
}
