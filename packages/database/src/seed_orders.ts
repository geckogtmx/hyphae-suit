import { db } from './index';
import * as schema from './schema';
import { PRODUCTS, STAFF_PROFILES, LOYALTY_PROFILES } from './mock_data';

export const generateMockOrders = async (daysBack = 30) => {
    console.log(`📊 Generating ${daysBack} days of order history...`);

    const ordersData: any[] = [];
    const orderItemsData: any[] = [];
    const paymentsData: any[] = [];
    const loyaltyTransactionsData: any[] = [];

    const now = new Date();
    const dayMs = 86400000;

    for (let d = 0; d < daysBack; d++) {
        const date = new Date(now.getTime() - (d * dayMs));
        const dateString = date.toISOString().split('T')[0];

        // Weekend Multiplier (Fri, Sat, Sun)
        const dayOfWeek = date.getDay();
        let dailyVolume = Math.floor(Math.random() * (40 - 20) + 20); // Base 20-40 orders
        if (dayOfWeek === 0 || dayOfWeek === 5 || dayOfWeek === 6) {
            dailyVolume = Math.floor(dailyVolume * 1.5);
        }

        console.log(`  📅 ${dateString}: Generating ${dailyVolume} orders...`);

        for (let i = 0; i < dailyVolume; i++) {
            // Random Time: 11:00 AM - 10:00 PM
            const hour = Math.floor(Math.random() * (22 - 11) + 11);
            const minute = Math.floor(Math.random() * 60);
            const orderTime = new Date(date);
            orderTime.setHours(hour, minute, 0, 0);

            const orderId = `ord_${dateString.replace(/-/g, '')}_${i.toString().padStart(3, '0')}`;
            const staff = STAFF_PROFILES[Math.floor(Math.random() * STAFF_PROFILES.length)];

            // 20% chance of a loyalty order
            let loyaltyProfile = null;
            if (Math.random() > 0.8) {
                loyaltyProfile = LOYALTY_PROFILES[Math.floor(Math.random() * LOYALTY_PROFILES.length)];
            }

            // Generate Items
            const itemCount = Math.floor(Math.random() * 4) + 1; // 1-4 items
            let subtotal = 0;

            for (let j = 0; j < itemCount; j++) {
                const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];

                let itemPrice = product.price;
                const modifiers = [];

                if (product.categoryId === 'burgers' && Math.random() > 0.7) {
                    itemPrice += 3.0;
                    modifiers.push({ name: 'Double Patty', price: 3.0 });
                }

                orderItemsData.push({
                    id: `${orderId}_item_${j}`,
                    orderId: orderId,
                    productId: product.id,
                    name: product.name,
                    price: itemPrice,
                    quantity: 1,
                    modifiers: JSON.stringify(modifiers)
                });

                subtotal += itemPrice;
            }

            const tax = subtotal * 0.08875;
            const total = subtotal + tax;

            ordersData.push({
                id: orderId,
                storeId: 'store_nyc_01',
                terminalId: 'term_01',
                staffId: staff.id,
                loyaltyProfileId: loyaltyProfile?.id,
                status: 'Completed',
                paymentStatus: 'Paid',
                orderType: Math.random() > 0.3 ? 'DineIn' : 'Takeout',
                subtotal: subtotal,
                tax: tax,
                total: total,
                createdAt: orderTime.getTime(),
                completedAt: orderTime.getTime() + (15 * 60000)
            });

            // Create Payment Record
            paymentsData.push({
                id: `pay_${orderId}`,
                orderId: orderId,
                method: Math.random() > 0.2 ? 'CARD' : 'CASH',
                amount: total,
                status: 'COMPLETED',
                transactionId: `txn_${Math.random().toString(36).substring(7)}`,
                timestamp: orderTime.getTime() + (5 * 60000)
            });

            // If Loyalty, record the EARN transaction
            if (loyaltyProfile) {
                loyaltyTransactionsData.push({
                    id: `ltx_seed_${orderId}`,
                    profileId: loyaltyProfile.id,
                    type: 'EARN',
                    points: Math.floor(total),
                    orderId: orderId,
                    timestamp: orderTime.getTime()
                });
            }
        }
    }

    // Batch Insert (Chunking to avoid huge queries if needed, but for <2000 items SQLite handles it ok usually)
    // Drizzle insert many
    for (const i of [0]) { // Placeholder loop to keep structure similar if I wanted to chunk more
        // Reuse chunkSize if needed, but keeping it simple for these
    }

    // Chunking to be safe
    const chunkSize = 100;
    console.log(`💾 Inserting ${ordersData.length} Orders...`);
    for (let i = 0; i < ordersData.length; i += chunkSize) {
        await db.insert(schema.orders).values(ordersData.slice(i, i + chunkSize)).onConflictDoNothing();
    }

    console.log(`💾 Inserting ${orderItemsData.length} Items...`);
    for (let i = 0; i < orderItemsData.length; i += chunkSize) {
        await db.insert(schema.orderItems).values(orderItemsData.slice(i, i + chunkSize)).onConflictDoNothing();
    }

    console.log(`💾 Inserting ${paymentsData.length} Payment Records...`);
    for (let i = 0; i < paymentsData.length; i += chunkSize) {
        await db.insert(schema.payments).values(paymentsData.slice(i, i + chunkSize)).onConflictDoNothing();
    }

    console.log(`💾 Inserting ${loyaltyTransactionsData.length} Loyalty Transactions...`);
    for (let i = 0; i < loyaltyTransactionsData.length; i += chunkSize) {
        await db.insert(schema.loyaltyTransactions).values(loyaltyTransactionsData.slice(i, i + chunkSize)).onConflictDoNothing();
    }

    console.log('✅ Order History Generated.');
};
