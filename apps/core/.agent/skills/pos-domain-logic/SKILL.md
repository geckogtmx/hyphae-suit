---
name: pos-domain-logic
description: The "Brain" of the POS. Contains canonical rules for Tax Calculations, Modifier Dependencies, Kitchen Routing, and Packaging Algorithms. Use this skill when implementing cart logic, totals, or backend order processing.
---

# POS Domain Logic

This skill defines the business rules for Hyphae POS.

## 1. Financial Calculations

### Tax
- **Rate:** 8.25% (Default/Configurable)
- **Rounding:** Round Half Up to nearest cent.
- **Timing:** Calculated on the `Subtotal` (Post-discount).

```typescript
const calculateTax = (subtotal: number, rate: number = 0.0825): number => {
  return Math.round(subtotal * rate * 100) / 100;
};
```

### Totals
- `ItemTotal` = `BasePrice` + `Sum(Modifiers)`
- `Subtotal` = `Sum(ItemTotals)` - `Discounts`
- `GrandTotal` = `Subtotal` + `Tax` + `Tips`

## 2. Modifier Logic

### Structure
- **Group:** A collection of options (e.g., "Sides", "Temperature").
- **Option:** A specific choice (e.g., "Fries", "Medium").
- **Variation:** `Normal` | `No` | `Side` | `Extra`.

### Dependency Rules
- **Sub-Item Variant:** If a group is `variant: 'sub_item'`, its options are treated as separate line items in the kitchen (e.g., "Fries" is a side to a "Burger").
- **Linked Logic:** If Group B depends on Group A, Group B only appears if a specific option in Group A is selected.

## 3. Kitchen Routing

### Categories
- **Hot:** Burgers, Tacos, Burritos -> `Hot Line` printer.
- **Cold:** Salads, Drinks -> `Cold / Bar` printer.
- **Expediter:** All items -> `Expo` screen.

### Aggregation
- Identical items with identical modifiers must group together.
- **Exception:** If `seatNumber` differs (Dine-In splits), do not group.

## 4. Packaging Algorithm

(See `packagingCalculator.ts`)

1. **Volume Analysis:** Calculate total `volumePoints` of order.
2. **Bag Filling:** Divide by `BAG_CAPACITY (8)` to determine bag count.
3. **Ancillaries:**
   - 1 Napkin per Main code.
   - +2 Napkins per "Messy" item (`wings`, `ribs`).
   - modifiers with `Side` variation get `CUP_2OZ` + `LID_2OZ`.
