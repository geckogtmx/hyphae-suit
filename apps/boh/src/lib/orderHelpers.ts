
// re-trigger HMR after install
import type { Product, ModifierGroup, ModifierOption } from '@hyphae/schemas';

// --- MOCKED / COPIED TYPES FROM POS ---
// Ideally these should live in shared schemas but for now we duplicate to avoid breaking POS type structure

export interface SelectedModifier {
    groupId: string;
    optionId: string;
    name: string;
    price: number;
    variation: 'Normal' | 'No' | 'Side' | 'Extra';
}

export interface OrderItem extends Product {
    uniqueId: string;
    selectedModifiers: SelectedModifier[];
    notes?: string;
    finalPrice?: number;
}

export interface SavedOrder {
    id: string;
    table: string;
    time: string;
    items: OrderItem[];
    orderType: string;
    status: string;
    // ... truncated
}

// --- DOMAIN LOGIC ---

export const calculateSpecificSummary = (orders: SavedOrder[]) => {
    const summary = {
        prep: {} as Record<string, { count: number }>,
        mains: {} as Record<string, number>,
        sides: {} as Record<string, number>,
    };

    if (!orders || !Array.isArray(orders)) return summary;

    orders.forEach((order) => {
        (order.items || []).forEach((item) => {
            const groups = item.modifierGroups || [];
            const selections = item.selectedModifiers || [];

            // Prep Counts (Metadata)
            if (item.metadata?.kitchenLabel) {
                const key = item.metadata.kitchenLabel;
                const qty = item.metadata.quantity || 1;
                if (!summary.prep[key]) summary.prep[key] = { count: 0 };
                summary.prep[key].count += qty;
            }

            // Mains
            if (!summary.mains[item.name]) summary.mains[item.name] = 0;
            summary.mains[item.name]++; // Assuming 1 per item row

            // Sides (Sub-items & Modifiers)
            selections.forEach((mod) => {
                const group = groups.find((g) => g.id === mod.groupId);
                if (group?.variant === 'sub_item') {
                    if (!summary.sides[mod.name]) summary.sides[mod.name] = 0;
                    summary.sides[mod.name]++;
                } else {
                    const optionDef = group?.options?.find((o) => o.id === mod.optionId);
                    if (optionDef?.metadata?.kitchenLabel) {
                        const key = optionDef.metadata.kitchenLabel;
                        const qty = optionDef.metadata.quantity || 1;
                        if (!summary.prep[key]) summary.prep[key] = { count: 0 };
                        summary.prep[key].count += qty;
                    }
                }
            });
        });
    });
    return summary;
};

// --- ASSEMBLY BUNDLER ---

export interface AssemblySide {
    name: string;
    modifiers: string[];
}

export interface AssemblyBundle {
    uniqueId: string;
    name: string;
    qty: number;
    mods: string[];
    sides: AssemblySide[];
    notes?: string;
}

export const groupItemsForAssembly = (order: SavedOrder) => {
    const bundlesMap = new Map<string, AssemblyBundle>();

    (order.items || []).forEach((item) => {
        const mods: string[] = [];
        const sidesMap = new Map<string, { name: string; modifiers: string[] }>();

        const groups = item.modifierGroups || [];
        const selections = item.selectedModifiers || [];

        // Sort selections by group index
        const sortedMods = [...selections].sort((a, b) => {
            const groupIndexA = groups.findIndex((g) => g.id === a.groupId) ?? -1;
            const groupIndexB = groups.findIndex((g) => g.id === b.groupId) ?? -1;
            return groupIndexA - groupIndexB;
        });

        // Pass 1: Sides
        sortedMods.forEach((mod) => {
            const group = groups.find((g) => g.id === mod.groupId);
            if (group?.variant === 'sub_item') {
                sidesMap.set(group.id, { name: mod.name, modifiers: [] });
            }
        });

        // Pass 2: Main Mods & Sub-Mod Assignment
        sortedMods.forEach((mod) => {
            const group = groups.find((g) => g.id === mod.groupId);
            if (group?.variant === 'sub_item') return;

            let isAssignedToSide = false;
            if (group?.dependency) {
                const parentGroup = groups.find((pg) => pg.id === group.dependency?.groupId);
                if (parentGroup?.variant === 'sub_item') {
                    const sideEntry = sidesMap.get(parentGroup.id);
                    if (sideEntry) {
                        const label = mod.variation !== 'Normal' ? `${mod.variation} ${mod.name}` : mod.name;
                        sideEntry.modifiers.push(label);
                        isAssignedToSide = true;
                    }
                }
            }

            if (!isAssignedToSide) {
                if (mod.variation !== 'Normal') {
                    mods.push(`${mod.variation} ${mod.name}`);
                } else {
                    mods.push(mod.name);
                }
            }
        });

        const sidesArray = Array.from(sidesMap.values());
        // Simple signature for bundling identical items within same order
        const signature = `${item.id}|${mods.join('|')}|${JSON.stringify(sidesArray)}|${item.notes || ''}`;

        if (bundlesMap.has(signature)) {
            bundlesMap.get(signature)!.qty++;
        } else {
            bundlesMap.set(signature, {
                uniqueId: item.uniqueId,
                name: item.name,
                qty: 1,
                mods,
                sides: sidesArray,
                notes: item.notes
            });
        }
    });
    return Array.from(bundlesMap.values());
};
