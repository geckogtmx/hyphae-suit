
import { db } from './index';
import * as schema from './schema';
import { PRODUCTS, STAFF_PROFILES } from './mock_data';

export const generateMockOrders = async (daysBack = 30) => {
    console.log(`📊 Generating ${daysBack} days of order history...`);

    const ordersData: any[] = [];
    const orderItemsData: any[] = [];

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

            // Generate Items
            const itemCount = Math.floor(Math.random() * 4) + 1; // 1-4 items
            let subtotal = 0;
            const items = [];

            for (let j = 0; j < itemCount; j++) {
                const product = PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];

                // Simulate Modifiers (simple calculation for now)
                let itemPrice = product.price;
                const modifiers = [];

                // 30% chance of "Double" burger if applicable
                if (product.categoryId === 'burgers' && Math.random() > 0.7) {
                    itemPrice += 3.0; // Mock upcharge
                    modifiers.push({ name: 'Double Patty', price: 3.0 });
                }

                // 20% chance of "Fries"
                if (Math.random() > 0.8) {
                    // Logic would go here but keeping it simple for volume
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

            const tax = subtotal * 0.08875; // NYC Tax approx
            const total = subtotal + tax;

            ordersData.push({
                id: orderId,
                storeId: 'store_nyc_01',
                terminalId: 'term_01',
                staffId: staff.id,
                status: 'Completed',
                paymentStatus: 'Paid',
                orderType: Math.random() > 0.3 ? 'DineIn' : 'Takeout',
                subtotal: subtotal,
                tax: tax,
                total: total,
                createdAt: orderTime.getTime(),
                completedAt: orderTime.getTime() + (15 * 60000) // +15 mins
            });
        }
    }

    // Batch Insert (Chunking to avoid huge queries if needed, but for <2000 items SQLite handles it ok usually)
    // Drizzle insert many
    console.log(`💾 Inserting ${ordersData.length} Orders and ${orderItemsData.length} Items...`);

    // Chunking to be safe
    const chunkSize = 100;
    for (let i = 0; i < ordersData.length; i += chunkSize) {
        await db.insert(schema.orders).values(ordersData.slice(i, i + chunkSize)).onConflictDoNothing();
    }

    for (let i = 0; i < orderItemsData.length; i += chunkSize) {
        await db.insert(schema.orderItems).values(orderItemsData.slice(i, i + chunkSize)).onConflictDoNothing();
    }

    console.log('✅ Order History Generated.');
};
