
import { MenuRepository } from './repositories/MenuRepository';
import { db } from '@hyphae/database';

const verify = async () => {
    console.log('🔍 Verifying DB Access...');
    try {
        console.log('DB Query Keys:', Object.keys(db.query));

        const repo = new MenuRepository();
        console.log('1. Fetching Products...');
        const products = await repo.getProducts();
        console.log(`✅ Found ${products.length} products.`);

        if (products.length > 0) {
            console.log('First Product:', JSON.stringify(products[0], null, 2));
            if (products[0].modifierGroups) {
                console.log('✅ Modifiers linked correctly.');
            } else {
                console.warn('⚠️ No modifiers linked (might be expected for some, but check "The Code BS")');
            }
        } else {
            console.error('❌ No products found! Seed might have failed/rolled back.');
        }

        console.log('2. Fetching by ID...');
        if (products.length > 0) {
            const p = await repo.getProductById(products[0].id);
            console.log(`✅ Fetched ${p?.name} by ID.`);
        }

    } catch (e: any) {
        console.error('❌ Verification Failed:', e);
        if (e.message && e.message.includes('no such table')) {
            console.error('Hint: Table missing. Check schema push.');
        }
    }
};

verify();
