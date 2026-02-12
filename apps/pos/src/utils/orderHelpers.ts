/**
 * @link e:\git\hyphae-pos\src\utils\orderHelpers.ts
 * @author Hyphae POS Team
 * @description Pure utility functions for order formatting, time calculation, and aggregation.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */

import { SavedOrder } from '../types';

// --- TIME HELPERS ---

export const formatDuration = (startTime?: number) => {
  if (!startTime) return '0:00';
  const diff = Math.floor((Date.now() - startTime) / 1000);
  const mins = Math.floor(diff / 60);
  const secs = diff % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const getDurationSecs = (start?: number, end?: number) => {
  if (!start) return 0;
  const endTime = end || Date.now();
  return Math.floor((endTime - start) / 1000);
};

export const formatSecs = (secs: number) => {
  const mins = Math.floor(secs / 60);
  const s = secs % 60;
  return `${mins}m ${s}s`;
};

// --- KITCHEN SUMMARY CALCULATOR ---

export const calculateSpecificSummary = (orders: SavedOrder[]) => {
  const summary = {
    prep: {} as Record<string, { count: number }>,
    mains: {} as Record<string, number>,
    sides: {} as Record<string, number>,
  };

  if (!orders || !Array.isArray(orders)) return summary;

  orders.forEach((order) => {
    (order.items || []).forEach((item) => {
      // Safe access
      const groups = item.modifierGroups || [];
      const selections = item.selectedModifiers || [];

      if (item.metadata?.kitchenLabel) {
        const key = item.metadata.kitchenLabel;
        const qty = item.metadata.quantity || 1;
        if (!summary.prep[key]) summary.prep[key] = { count: 0 };
        summary.prep[key].count += qty;
      }
      if (!summary.mains[item.name]) summary.mains[item.name] = 0;
      summary.mains[item.name]++;

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
}

export const groupItemsForAssembly = (order: SavedOrder) => {
  const bundlesMap = new Map<string, AssemblyBundle>();

  (order.items || []).forEach((item) => {
    const mods: string[] = [];
    const sidesMap = new Map<string, { name: string; modifiers: string[] }>();

    const groups = item.modifierGroups || [];
    const selections = item.selectedModifiers || [];

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

    // Pass 2: Main Mods
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
    const signature = `${item.id}|${mods.join('|')}|${JSON.stringify(sidesArray)}|${item.notes || ''}`;

    if (bundlesMap.has(signature)) {
      bundlesMap.get(signature).qty++;
    } else {
      bundlesMap.set(signature, {
        uniqueId: item.uniqueId,
        name: item.name,
        qty: 1,
        mods,
        sides: sidesArray,
      });
    }
  });
  return Array.from(bundlesMap.values());
};
