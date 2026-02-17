
import { db } from './src/index';
import { products } from './src/schema';
import { eq } from 'drizzle-orm';

async function check() {
    try {
        const result = await db.select().from(products).where(eq(products.id, 'codebs_burger'));
        console.log('Product Found:', result);
        if (result.length === 0) {
            console.log('Product Missing! Attempting insert...');
            // Insert minimal product to satisfy FK
            await db.insert(products).values({
                id: 'codebs_burger',
                name: 'The Code BS [Rescue]',
                categoryId: 'burgers', // Assuming 'burgers' category exists, if not this will fail too
                price: 10.0
            }).onConflictDoNothing();
            console.log('Inserted rescue product.');
        }
    } catch (e) {
        console.error('Check failed:', e);
    }
}

check();
