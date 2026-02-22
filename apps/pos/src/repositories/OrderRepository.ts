/**
 * @link e:\git\hyphae-pos\src\repositories\OrderRepository.ts
 * @author Hyphae POS Team
 * @description Relational Drizzle implementation of the Order Repository.
 * @version 2.0.0
 * @last-updated 2026-02-22
 */

import { db } from '../db';
import { schema } from '@hyphae/database';
import { SavedOrder, OrderItem, PaymentDetails } from '../types';
import { IOrderRepository } from './interfaces';
import { eq, desc, ne, and, isNull } from 'drizzle-orm';

export class OrderRepository implements IOrderRepository {

  private async mapToOrder(orderRow: any): Promise<SavedOrder> {
    // Fetch items and payments for this order
    const items = await db.select().from(schema.orderItems).where(eq(schema.orderItems.orderId, orderRow.id));
    const payments = await db.select().from(schema.payments).where(eq(schema.payments.orderId, orderRow.id));

    return {
      id: orderRow.id,
      systemInfo: {
        storeId: orderRow.storeId,
        terminalId: orderRow.terminalId,
        staffId: orderRow.staffId,
      },
      createdAt: orderRow.createdAt,
      completedAt: orderRow.completedAt || undefined,
      items: items.map(i => ({
        id: i.productId,
        productId: i.productId,
        uniqueId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity || 1,
        selectedModifiers: i.modifiers ? JSON.parse(i.modifiers) : [],
        finalPrice: (i.price || 0) * (i.quantity || 1),
        categoryId: 'unknown',
        requiresMods: false,
        isActive: true
      }) as any),
      subtotal: orderRow.subtotal,
      tax: orderRow.tax,
      total: orderRow.total,
      status: orderRow.status as any,
      paymentStatus: orderRow.paymentStatus as any,
      orderType: orderRow.orderType as any,
      payment: payments[0] ? {
        method: payments[0].method as any,
        amount: payments[0].amount,
        transactionId: payments[0].transactionId || undefined
      } : { method: 'CASH', amount: orderRow.total },
      loyaltyProfileId: orderRow.loyaltyProfileId || undefined,
      syncedAt: orderRow.syncedAt || undefined
    };
  }

  async getActiveOrders(): Promise<SavedOrder[]> {
    const rows = await db
      .select()
      .from(schema.orders)
      .where(ne(schema.orders.status, 'Completed'))
      .orderBy(desc(schema.orders.createdAt));

    return Promise.all(rows.map((row) => this.mapToOrder(row)));
  }

  async getCompletedOrders(): Promise<SavedOrder[]> {
    const rows = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.status, 'Completed'))
      .orderBy(desc(schema.orders.createdAt));

    return Promise.all(rows.map((row) => this.mapToOrder(row)));
  }

  async getUnsyncedOrders(): Promise<SavedOrder[]> {
    const rows = await db
      .select()
      .from(schema.orders)
      .where(isNull(schema.orders.syncedAt))
      .orderBy(schema.orders.createdAt);

    return Promise.all(rows.map(row => this.mapToOrder(row)));
  }

  async saveOrder(order: SavedOrder): Promise<void> {
    await db.transaction(async (tx) => {
      // 1. Upsert Order
      await tx.insert(schema.orders).values({
        id: order.id,
        storeId: order.systemInfo?.storeId || 'default',
        terminalId: order.systemInfo?.terminalId || 'default',
        staffId: order.systemInfo?.staffId,
        loyaltyProfileId: order.loyaltyProfileId,
        status: order.status,
        paymentStatus: order.paymentStatus,
        orderType: order.orderType,
        subtotal: order.subtotal,
        tax: order.tax,
        total: order.total,
        createdAt: order.createdAt,
        completedAt: order.completedAt,
        syncedAt: order.syncedAt
      }).onConflictDoUpdate({
        target: schema.orders.id,
        set: {
          status: order.status,
          paymentStatus: order.paymentStatus,
          completedAt: order.completedAt,
          syncedAt: order.syncedAt
        }
      });

      // 2. Clear and Insert Items (Simplified re-sync)
      await tx.delete(schema.orderItems).where(eq(schema.orderItems.orderId, order.id));
      for (const item of order.items) {
        await tx.insert(schema.orderItems).values({
          id: `oi_${order.id}_${item.productId}`,
          orderId: order.id,
          productId: item.productId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          modifiers: item.modifiers ? JSON.stringify(item.modifiers) : null
        });
      }

      // 3. Upsert Payment
      if (order.payment) {
        await tx.insert(schema.payments).values({
          id: `pay_${order.id}`,
          orderId: order.id,
          method: order.payment.method,
          amount: order.payment.amount,
          status: 'COMPLETED',
          transactionId: order.payment.transactionId,
          timestamp: Date.now()
        }).onConflictDoNothing();
      }
    });
  }

  async setSynced(orderId: string): Promise<void> {
    await db.update(schema.orders)
      .set({ syncedAt: Date.now() })
      .where(eq(schema.orders.id, orderId));
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    await db
      .update(schema.orders)
      .set({
        status,
        completedAt: status === 'Completed' ? Date.now() : undefined,
      } as any)
      .where(eq(schema.orders.id, orderId));
  }
}
