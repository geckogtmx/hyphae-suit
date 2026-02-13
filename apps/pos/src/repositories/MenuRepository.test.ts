
import { describe, it, expect, beforeAll } from 'vitest';
import { MenuRepository } from './MenuRepository';

describe('MenuRepository (Live DB)', () => {
    let repo: MenuRepository;

    beforeAll(() => {
        repo = new MenuRepository();
    });

    it('should fetch all products with modifiers', async () => {
        const products = await repo.getProducts();
        expect(products.length).toBeGreaterThan(0);

        const burger = products.find(p => p.name === 'The Code BS');
        expect(burger).toBeDefined();
        expect(burger?.modifierGroups).toBeDefined();
        expect(burger?.modifierGroups?.length).toBeGreaterThan(0);
        expect(burger?.modifierGroups?.[0].options.length).toBeGreaterThan(0);
    });

    it('should fetch product by ID', async () => {
        const products = await repo.getProducts();
        const first = products[0];

        const fetched = await repo.getProductById(first.id);
        expect(fetched).toBeDefined();
        expect(fetched?.id).toBe(first.id);
        expect(fetched?.name).toBe(first.name);
    });

    it('should fetch by concept', async () => {
        // Concept IDs: 'tacocracy', 'codebs_concept'
        const codebs = await repo.getProductsByConcept('codebs_concept');
        expect(codebs.length).toBeGreaterThan(0);
        expect(codebs.every(p => p.categoryId === 'burgers')).toBe(true);

        const tacos = await repo.getProductsByConcept('tacocracy');
        expect(tacos.length).toBeGreaterThan(0);
        expect(tacos.every(p => ['tacos', 'burritos'].includes(p.categoryId))).toBe(true);
    });
});
