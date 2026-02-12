/**
 * @link e:\git\hyphae-pos\src\db\seed.ts
 * @author Hyphae POS Team
 * @description Seed script to populate the database with initial mock data.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { PRODUCTS } from '../data/mock_data';
import { MenuRepository } from '../repositories/MenuRepository';

const seed = async () => {
  console.log('🌱 Seeding database...');
  const menuRepo = new MenuRepository();

  try {
    console.log(`📦 Seeding ${PRODUCTS.length} products...`);
    await menuRepo.saveBatchProducts(PRODUCTS);
    console.log('✅ Seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seed();
