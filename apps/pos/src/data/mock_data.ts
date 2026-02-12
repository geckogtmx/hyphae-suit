/**
 * @link e:\git\hyphae-pos\src\data\mock_data.ts
 * @author Hyphae POS Team
 * @description Centralized mock data for the application, including concepts, categories, and products.
 * @version 1.0.0
 * @last-updated 2026-01-20
 */
import {
  Concept,
  Category,
  Product,
  ModifierGroup,
  LoyaltyTier,
  LoyaltyProfile,
  InventoryItem,
  RecipeDefinition,
  StaffProfile,
  SystemInfo,
  LoyaltyTransaction,
  LoyaltyCard,
} from '../types';

// --- SYSTEM CONFIG ---
export const SYSTEM_CONFIG = {
  storeId: 'store_nyc_01',
  terminalId: 'term_counter_01',
};

export const STAFF_PROFILES: StaffProfile[] = [
  { id: 'staff_mgr', name: 'Sarah Manager', pin: '1234', role: 'Manager' },
  { id: 'staff_001', name: 'John Cashier', pin: '1111', role: 'Cashier' },
  { id: 'staff_002', name: 'Mike Line', pin: '2222', role: 'Kitchen' },
];

// --- INVENTORY ITEMS ---
export const INVENTORY_ITEMS: InventoryItem[] = [
  // RAW MEATS
  {
    id: 'inv_beef_patty',
    name: 'Raw Beef Patty (4oz)',
    type: 'RAW',
    stockUnit: 'count',
    costPerUnit: 1.5,
  },
  {
    id: 'inv_pork_shoulder',
    name: 'Pork Shoulder',
    type: 'RAW',
    stockUnit: 'lb',
    costPerUnit: 3.0,
  },
  {
    id: 'inv_chicken_breast',
    name: 'Chicken Breast',
    type: 'RAW',
    stockUnit: 'lb',
    costPerUnit: 4.5,
  },
  { id: 'inv_steak_skirt', name: 'Skirt Steak', type: 'RAW', stockUnit: 'lb', costPerUnit: 8.0 },

  // RAW PRODUCE
  { id: 'inv_onion_red', name: 'Red Onion', type: 'RAW', stockUnit: 'lb', costPerUnit: 0.8 },
  { id: 'inv_onion_yellow', name: 'Yellow Onion', type: 'RAW', stockUnit: 'lb', costPerUnit: 0.6 },
  { id: 'inv_tomato', name: 'Roma Tomato', type: 'RAW', stockUnit: 'lb', costPerUnit: 1.2 },
  { id: 'inv_jalapeno', name: 'Jalapeno', type: 'RAW', stockUnit: 'lb', costPerUnit: 1.5 },
  { id: 'inv_cilantro', name: 'Cilantro', type: 'RAW', stockUnit: 'count', costPerUnit: 0.5 },
  { id: 'inv_potatoes', name: 'Russet Potatoes', type: 'RAW', stockUnit: 'lb', costPerUnit: 0.4 },

  // DRY GOODS / BREAD
  { id: 'inv_brioche_bun', name: 'Brioche Bun', type: 'RAW', stockUnit: 'count', costPerUnit: 0.5 },
  {
    id: 'inv_tortilla_corn',
    name: 'Corn Tortilla 6in',
    type: 'RAW',
    stockUnit: 'count',
    costPerUnit: 0.08,
  },
  {
    id: 'inv_tortilla_flour',
    name: 'Flour Tortilla 12in',
    type: 'RAW',
    stockUnit: 'count',
    costPerUnit: 0.2,
  },

  // DAIRY
  {
    id: 'inv_american_slice',
    name: 'American Cheese Slice',
    type: 'RAW',
    stockUnit: 'count',
    costPerUnit: 0.12,
  },

  // PREP ITEMS (Produced by Recipes)
  {
    id: 'inv_salsa_roja_batch',
    name: 'Salsa Roja (Prep)',
    type: 'PREP',
    stockUnit: 'fl_oz',
    costPerUnit: 0.25,
  },
  {
    id: 'inv_salsa_verde_batch',
    name: 'Salsa Verde (Prep)',
    type: 'PREP',
    stockUnit: 'fl_oz',
    costPerUnit: 0.25,
  },
  {
    id: 'inv_pico_batch',
    name: 'Pico de Gallo (Prep)',
    type: 'PREP',
    stockUnit: 'oz',
    costPerUnit: 0.35,
  },
  {
    id: 'inv_carnitas_prep',
    name: 'Carnitas (Cooked)',
    type: 'PREP',
    stockUnit: 'lb',
    costPerUnit: 5.5,
  },
  { id: 'inv_fries_cut', name: 'Cut Fries', type: 'PREP', stockUnit: 'oz', costPerUnit: 0.08 },
  { id: 'inv_bacon_jam', name: 'Bacon Jam', type: 'PREP', stockUnit: 'oz', costPerUnit: 0.8 },
];

// --- RECIPES ---
export const RECIPES: RecipeDefinition[] = [
  // BATCH RECIPES (Prep Kitchen)
  {
    id: 'rec_salsa_roja_batch',
    name: 'Salsa Roja Batch',
    yieldQuantity: 128,
    yieldUnit: 'fl_oz',
    outputInventoryItemId: 'inv_salsa_roja_batch',
    components: [
      { inventoryItemId: 'inv_tomato', quantity: 5, unit: 'lb' },
      { inventoryItemId: 'inv_onion_yellow', quantity: 2, unit: 'lb' },
      { inventoryItemId: 'inv_jalapeno', quantity: 0.5, unit: 'lb' },
    ],
  },
  {
    id: 'rec_carnitas_batch',
    name: 'Carnitas Slow Cook',
    yieldQuantity: 10,
    yieldUnit: 'lb',
    outputInventoryItemId: 'inv_carnitas_prep',
    components: [
      { inventoryItemId: 'inv_pork_shoulder', quantity: 15, unit: 'lb', wasteFactor: 0.33 }, // 33% weight loss cooked
    ],
  },

  // ASSEMBLY RECIPES (Sales Items)
  {
    id: 'rec_codebs_burger_assembly',
    name: 'Code BS Burger Assembly',
    yieldQuantity: 1,
    yieldUnit: 'count',
    components: [
      { inventoryItemId: 'inv_brioche_bun', quantity: 1, unit: 'count' },
      { inventoryItemId: 'inv_beef_patty', quantity: 1, unit: 'count' },
    ],
  },
  {
    id: 'rec_taco_al_pastor',
    name: 'Taco Al Pastor Assembly',
    yieldQuantity: 1,
    yieldUnit: 'count',
    components: [
      { inventoryItemId: 'inv_tortilla_corn', quantity: 1, unit: 'count' },
      // Simplified: Al pastor meat inventory tracking logic would be here
    ],
  },
  {
    id: 'rec_taco_carnitas',
    name: 'Taco Carnitas Assembly',
    yieldQuantity: 1,
    yieldUnit: 'count',
    components: [
      { inventoryItemId: 'inv_tortilla_corn', quantity: 1, unit: 'count' },
      { inventoryItemId: 'inv_carnitas_prep', quantity: 0.25, unit: 'lb' },
    ],
  },
];

export const CONCEPTS: Concept[] = [
  { id: 'tacocracy', name: 'Tacocracy', color: 'orange-500' },
  { id: 'codebs_concept', name: 'Code BS', color: 'red-500' },
];

export const CATEGORIES: Category[] = [
  { id: 'burgers', name: 'Burgers', conceptId: 'codebs_concept' },
  { id: 'tacos', name: 'Tacos', conceptId: 'tacocracy' },
  { id: 'burritos', name: 'Burritos', conceptId: 'tacocracy' },
];

// --- MODIFIERS ---
const MOD_TORTILLA: ModifierGroup = {
  id: 'mod_tortilla',
  name: 'Tortilla Type',
  required: true,
  multiSelect: false,
  options: [
    {
      id: 'corn',
      name: 'Corn Tortilla',
      price: 0,
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_tortilla_corn', quantity: 1, unit: 'count' }],
      },
    },
    {
      id: 'flour',
      name: 'Flour Tortilla',
      price: 0.5,
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_tortilla_flour', quantity: 1, unit: 'count' }],
      },
    },
  ],
};

const MOD_SALSA: ModifierGroup = {
  id: 'mod_salsa',
  name: 'Salsa',
  required: true,
  multiSelect: false,
  options: [
    {
      id: 'roja',
      name: 'Salsa Roja',
      price: 0,
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_salsa_roja_batch', quantity: 2, unit: 'fl_oz' }],
      },
    },
    {
      id: 'verde',
      name: 'Salsa Verde',
      price: 0,
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_salsa_verde_batch', quantity: 2, unit: 'fl_oz' }],
      },
    },
    {
      id: 'pico',
      name: 'Pico de Gallo',
      price: 0,
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_pico_batch', quantity: 2, unit: 'oz' }],
      },
    },
    { id: 'none', name: 'No Salsa', price: 0 },
  ],
};

// --- CODE BS MODIFIERS ---
const MOD_BURGER_TYPE: ModifierGroup = {
  id: 'mod_burger_type',
  name: 'Burger Type',
  required: true,
  multiSelect: false,
  options: [
    {
      id: 'single',
      name: 'Single',
      price: 0,
      metadata: { kitchenLabel: 'Beef Patties', quantity: 1 },
    },
    {
      id: 'double',
      name: 'Double',
      price: 3.0,
      metadata: { kitchenLabel: 'Beef Patties', quantity: 2 },
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_beef_patty', quantity: 1, unit: 'count' }],
      },
    },
    {
      id: 'triple',
      name: 'Triple',
      price: 6.0,
      metadata: { kitchenLabel: 'Beef Patties', quantity: 3 },
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_beef_patty', quantity: 2, unit: 'count' }],
      },
    },
    {
      id: 'veggie',
      name: 'Veggie',
      price: 0,
      metadata: { kitchenLabel: 'Veggie Patties', quantity: 1 },
    },
  ],
};

const MOD_BURGER_TOPPINGS: ModifierGroup = {
  id: 'mod_burger_toppings',
  name: 'Topping Selection',
  required: true,
  multiSelect: false,
  options: [
    {
      id: 'plain',
      name: 'Plain Onion',
      price: 0,
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_onion_red', quantity: 1, unit: 'oz' }],
      },
    },
    {
      id: 'jalapeno',
      name: 'Jalapeño Onions',
      price: 0.5,
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_jalapeno', quantity: 1, unit: 'oz' }],
      },
    },
    {
      id: 'bacon_jam',
      name: 'Bacon Jam Onions',
      price: 1.5,
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_bacon_jam', quantity: 1, unit: 'oz' }],
      },
    },
    { id: 'blue_cheese', name: 'Blue Cheese Onions', price: 1.5 },
  ],
};

const MOD_BURGER_SAUCE: ModifierGroup = {
  id: 'mod_burger_sauce',
  name: 'Sauce Selection',
  required: false,
  multiSelect: true,
  options: [
    { id: 'alioli', name: 'Alioli', price: 0 },
    { id: 'vegan_mayo', name: 'Vegan Mayo', price: 0 },
    { id: 'chipotle', name: 'Chipotle', price: 0 },
    { id: 'ketchup', name: 'Ketchup', price: 0 },
    {
      id: 'american_cheese',
      name: 'American Cheese',
      price: 1.0,
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_american_slice', quantity: 1, unit: 'count' }],
      },
    },
  ],
};

const MOD_BURGER_SIDES: ModifierGroup = {
  id: 'mod_burger_sides',
  name: 'Sides',
  required: false,
  multiSelect: false,
  variant: 'sub_item',
  options: [
    {
      id: 'small_fries',
      name: 'Small Fries',
      price: 0,
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_fries_cut', quantity: 4, unit: 'oz' }],
      },
    },
    {
      id: 'large_fries',
      name: 'Large Fries',
      price: 1.5,
      inventoryMetadata: {
        directDepletion: [{ inventoryItemId: 'inv_fries_cut', quantity: 8, unit: 'oz' }],
      },
    },
  ],
};

const MOD_BURGER_SEASONING: ModifierGroup = {
  id: 'mod_burger_seasoning',
  name: 'Seasoning Selection',
  required: false,
  multiSelect: false,
  options: [
    { id: 'umami', name: 'Umami', price: 0 },
    { id: 'salt_vinegar', name: 'Salt N Vinegar', price: 0 },
    { id: 'tajin', name: 'Tajin', price: 0 },
    { id: 'truffles', name: 'Truffles', price: 0.5 },
    { id: 'plain', name: 'Plain', price: 0 },
    { id: 'dirty_style', name: 'Dirty Fries', price: 3.0 },
  ],
  dependency: {
    groupId: 'mod_burger_sides',
  },
};

export const PRODUCTS: Product[] = [
  // Code BS
  {
    id: 'codebs_burger',
    name: 'The Code BS',
    price: 10.0,
    categoryId: 'burgers',
    requiresMods: true,
    metadata: { kitchenLabel: 'Brioche Buns', quantity: 1 },
    packaging: { sku: 'SKU_WRAPPER', volumePoints: 2, isMessy: true },
    inventoryMetadata: { recipeId: 'rec_codebs_burger_assembly' }, // LINKED RECIPE
    modifierGroups: [
      MOD_BURGER_TYPE,
      MOD_BURGER_TOPPINGS,
      MOD_BURGER_SAUCE,
      MOD_BURGER_SIDES,
      MOD_BURGER_SEASONING,
    ],
  },
  {
    id: 'codebs_basic',
    name: 'Basic Smash',
    price: 8.0,
    categoryId: 'burgers',
    requiresMods: true,
    metadata: { kitchenLabel: 'Brioche Buns', quantity: 1 },
    packaging: { sku: 'SKU_WRAPPER', volumePoints: 2, isMessy: true },
    inventoryMetadata: { recipeId: 'rec_codebs_burger_assembly' },
    modifierGroups: [MOD_BURGER_TYPE, MOD_BURGER_SIDES, MOD_BURGER_SEASONING],
  },

  // Tacocracy - Tacos
  {
    id: 't1',
    name: 'Al Pastor',
    price: 4.5,
    categoryId: 'tacos',
    requiresMods: true,
    packaging: { sku: 'SKU_BOAT_SMALL', volumePoints: 1, isMessy: true },
    inventoryMetadata: { recipeId: 'rec_taco_al_pastor' },
    modifierGroups: [MOD_TORTILLA, MOD_SALSA],
  },
  {
    id: 't2',
    name: 'Carne Asada',
    price: 5.0,
    categoryId: 'tacos',
    requiresMods: true,
    packaging: { sku: 'SKU_BOAT_SMALL', volumePoints: 1, isMessy: true },
    modifierGroups: [MOD_TORTILLA, MOD_SALSA],
  },
  {
    id: 't3',
    name: 'Carnitas',
    price: 4.5,
    categoryId: 'tacos',
    requiresMods: true,
    packaging: { sku: 'SKU_BOAT_SMALL', volumePoints: 1, isMessy: true },
    inventoryMetadata: { recipeId: 'rec_taco_carnitas' },
    modifierGroups: [MOD_TORTILLA, MOD_SALSA],
  },
  {
    id: 't4',
    name: 'Veggie Nopal',
    price: 4.0,
    categoryId: 'tacos',
    requiresMods: true,
    packaging: { sku: 'SKU_BOAT_SMALL', volumePoints: 1, isMessy: true },
    modifierGroups: [MOD_TORTILLA, MOD_SALSA],
  },

  // Tacocracy - Burritos
  {
    id: 'b1',
    name: 'Mission Style',
    price: 12.0,
    categoryId: 'burritos',
    requiresMods: true,
    packaging: { sku: 'SKU_WRAPPER_XL', volumePoints: 3, isMessy: false },
    modifierGroups: [MOD_SALSA],
  },
  {
    id: 'b2',
    name: 'Cali Burrito',
    price: 13.5,
    categoryId: 'burritos',
    requiresMods: true,
    packaging: { sku: 'SKU_WRAPPER_XL', volumePoints: 3, isMessy: false },
    modifierGroups: [MOD_SALSA],
  },
  {
    id: 'b3',
    name: 'Bowl Option',
    price: 12.0,
    categoryId: 'burritos',
    requiresMods: true,
    packaging: { sku: 'SKU_BOWL_LID', volumePoints: 3, isMessy: false },
    modifierGroups: [MOD_SALSA],
  },
];

// --- LOYALTY DATA ---

export const LOYALTY_TIERS: LoyaltyTier[] = [
  {
    id: 'tier_starter',
    name: 'Starter',
    color: 'zinc-500',
    minPunches: 0,
    cashbackRate: 0,
    perks: ['Prove you are a regular'],
  },
  {
    id: 'tier_bronze',
    name: 'Bronze',
    color: 'amber-600',
    minPunches: 5,
    cashbackRate: 0.02,
    perks: ['2% Cashback', 'Welcome Reward'],
  },
  {
    id: 'tier_silver',
    name: 'Silver',
    color: 'zinc-300',
    minPunches: 15,
    cashbackRate: 0.03,
    perks: ['3% Cashback', 'Priority Service'],
  },
  {
    id: 'tier_gold',
    name: 'Gold',
    color: 'yellow-400',
    minPunches: 30,
    cashbackRate: 0.05,
    perks: ['5% Cashback', 'Free Fries w/ Burger'],
  },
];

export const LOYALTY_TRANSACTIONS: LoyaltyTransaction[] = [
  {
    id: 'tx_101',
    customerId: 'cust_2',
    cardId: 'card_bob_01',
    timestamp: Date.now() - 86400000 * 5,
    type: 'EARN',
    points: 45.0,
    description: 'Order #1105',
  },
  {
    id: 'tx_102',
    customerId: 'cust_2',
    cardId: 'card_bob_01',
    timestamp: Date.now() - 86400000 * 3,
    type: 'EARN',
    points: 25.0,
    description: 'Order #1142',
  },
  {
    id: 'tx_103',
    customerId: 'cust_2',
    cardId: 'card_bob_01',
    timestamp: Date.now() - 86400000 * 2,
    type: 'REDEEM',
    points: -15.0,
    description: 'Free Drink Reward',
  },
  {
    id: 'tx_104',
    customerId: 'cust_2',
    cardId: 'card_bob_01',
    timestamp: Date.now() - 86400000 * 1,
    type: 'EARN',
    points: 95.0,
    description: 'Catering Order',
  },
];

// Normalized Data Structure for Firebase Migration
export const LOYALTY_CARDS: LoyaltyCard[] = [
  {
    id: 'card_alice_01',
    code: '123456AB',
    userId: 'cust_1',
    status: 'ACTIVE',
    issuedAt: Date.now() - 10000000,
  },
  {
    id: 'card_bob_01',
    code: '888888GG',
    userId: 'cust_2',
    status: 'ACTIVE',
    issuedAt: Date.now() - 50000000,
  },
  {
    id: 'card_charlie_01',
    code: '111111SS',
    userId: 'cust_3',
    status: 'ACTIVE',
    issuedAt: Date.now() - 2000000,
  },
  {
    id: 'card_test_01',
    code: '12345A',
    userId: 'cust_test',
    status: 'ACTIVE',
    issuedAt: Date.now() - 90000000,
  },
];

export const LOYALTY_PROFILES: LoyaltyProfile[] = [
  {
    id: 'cust_1',
    name: 'Alice Regular',
    phone: '555-0101',
    currentTierId: 'tier_starter',
    totalPunches: 3,
    currentPoints: 12.5,
    lastVisitDate: '2023-10-25',
    joinedDate: Date.now() - 10000000,
  },
  {
    id: 'cust_2',
    name: 'Bob BigSpender',
    phone: '555-0102',
    currentTierId: 'tier_gold',
    totalPunches: 35,
    currentPoints: 150.0,
    lastVisitDate: '2023-10-20',
    joinedDate: Date.now() - 50000000,
  },
  {
    id: 'cust_3',
    name: 'Charlie Upgrade',
    phone: '555-0103',
    currentTierId: 'tier_starter',
    totalPunches: 4, // One away from Bronze
    currentPoints: 5.0,
    lastVisitDate: '2023-01-01', // Needs visit
    joinedDate: Date.now() - 2000000,
  },
  {
    id: 'cust_test',
    name: 'VIP Tester',
    phone: '555-9999',
    currentTierId: 'tier_gold',
    totalPunches: 42,
    currentPoints: 420.0,
    lastVisitDate: '2023-10-26',
    joinedDate: Date.now() - 90000000,
  },
];
