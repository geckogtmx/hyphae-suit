# Hyphae BOH (BatchPrep Manager) - AI Model Prompt

## Instructions for Use

This is a **multi-shot prompt** for initializing the Hyphae BOH (Back of House) application. Copy and paste each section in sequence, waiting for the model's response before proceeding to the next shot.

> ⚠️ **IMPORTANT**: The "BatchPrep Manager (BPM)" PDF is a **conceptual guideline only**.
> The **source of truth** for data types is `hyphae-pos/src/types.ts` and `hyphae-core/types/schema.ts`.
> The BOH app must integrate with the **existing** POS and CORE ecosystem, using their real types.

---

# 🎯 SHOT 1: Context & Architecture

Copy this first:

```
You are helping me build the **Hyphae BOH (Back of House)** application, also known as the **BatchPrep Manager (BPM)** or "The Kitchen Manager."

## Project Context

This is part of the **Hyphae Suit** - a multi-app restaurant management ecosystem:

1. **Hyphae POS** (Complete) - Tablet point-of-sale for order entry
2. **Hyphae Core** (In Progress) - Backend API + Admin dashboard
3. **Hyphae BOH** (This Project) - Kitchen Management System

## Ecosystem Architecture

```

┌─────────────────────────────────────────────────────────────┐
│ HYPHAE ECOSYSTEM │
├─────────────────────────────────────────────────────────────┤
│ │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │
│ │ POS │ │ BOH │ │ ADMIN │ │ CORE │ │
│ │ (Tablet) │ │ (Kitchen)│ │(Dashboard)│ │ (API) │ │
│ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬────┘ │
│ │ │ │ │ │
│ └──────────────┴──────────────┴──────────────┘ │
│ │ │
│ ┌─────┴─────┐ │
│ │ CORE API │ │
│ │ WebSocket │ │
│ └───────────┘ │
│ │
└─────────────────────────────────────────────────────────────┘

````

## Tech Stack (Must Match Monorepo)

- **Framework:** React 19 + Vite 6
- **Styling:** TailwindCSS with SHASO design system
- **State:** React Query + Zustand
- **Real-time:** Socket.io client
- **Types:** Shared from `@hyphae/schemas` package
- **Language:** TypeScript 5.8 (strict mode)

## Design System: SHASO (Single Hand Solo Operator)

The BOH app must follow SHASO principles:
- **Touch-first:** 60px minimum touch targets
- **Dark mode:** "Abyssal" palette (Ink/Jet/Teal)
- **High contrast:** Readable in bright kitchen environments
- **One-hand operation:** Gloved hands, greasy fingers
- **Audio feedback:** Sounds for new orders, alerts

## Color Palette

```css
--ink-100: #0A0A0A;    /* Darkest background */
--ink-500: #121214;    /* App background */
--jet-500: #1A1B1E;    /* Card background */
--jet-700: #2A2B2E;    /* Elevated surfaces */
--teal-deep: #0D9488;  /* Primary actions */
--teal-mid: #14B8A6;   /* Secondary actions */
--teal-bright: #2DD4BF; /* Highlights */
--lime-500: #84CC16;   /* Success/Ready state */
--red-500: #EF4444;    /* Urgent/SOS state */
--amber-500: #F59E0B;  /* Warning/Delayed state */
````

Confirm you understand the context, then I'll provide the BOH-specific requirements.

```

# 🎯 SHOT 2: BOH Core Concept & Features

After model confirms, send this:

```

## BOH (BatchPrep Manager) - Core Concept

### ⚠️ PARADIGM SHIFT: This is NOT a KDS

Most kitchen apps focus on **live order processing** (Kitchen Display Systems). Hyphae BOH is **completely different**.

**Hyphae BOH is a PREP KITCHEN MANAGEMENT SYSTEM** - designed for operations where food is prepared **in advance** (over days/weeks) and then sold from a separate location (mobile cart, pop-up, event booth).

> **Note:** If you need live order tracking, the **POS already has a built-in KDS column**. BOH is specifically for batch prep workflows, not real-time orders.

---

## 🔵 PRIMARY: Prep Kitchen Management

### Use Case: Mobile Food Cart Operation

**Scenario:**

- A food cart sells at weekend farmers markets
- The cart uses **Hyphae POS** for sales at the event
- Between events, a **prep kitchen** (home kitchen, commissary, shared space) is used to prepare:
  - Bread (baked Wednesday for Saturday market)
  - Sauces (salsa roja, aioli, guacamole made Thursday)
  - Vegetables (chopped Friday morning)
  - Proteins (marinated overnight)
  - Par-baked items (partially cooked, finished at cart)

**BOH manages this entire prep workflow:**

```
┌─────────────────────────────────────────────────────────────┐
│                    WEEKLY PREP CYCLE                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  MONDAY       TUESDAY      WEDNESDAY    THURSDAY   FRIDAY   │
│  ────────     ────────     ──────────   ─────────  ──────   │
│  Planning     Shopping     Bread Bake   Sauce Day  Final    │
│  Inventory    Prep Math    Batch 1      Cold Prep  Prep     │
│  Par Levels   Ordering     Freeze       Proteins   Portion  │
│                                                    Pack     │
│                                                             │
│  ────────────────────────────────────────────────────────── │
│                                                             │
│  SATURDAY: Market Day (POS at cart, BOH off)                │
│  SUNDAY: Rest + Inventory Count                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Core Features: Prep Kitchen Mode

### 1. Prep Schedules & Task Lists

**Prep Schedule:** A named collection of tasks targeting a specific event.

```typescript
interface PrepSchedule {
  id: string;
  name: string; // "Saturday Market - Feb 15"
  targetDate: string; // "2026-02-15"
  status: 'planning' | 'active' | 'completed';
  estimatedSalesUnits: number; // Expected units to sell
  tasks: PrepTask[];
  createdAt: number;
  completedAt?: number;
}

interface PrepTask {
  id: string;
  scheduleId: string;
  recipeId: string; // Links to RecipeDefinition
  targetQuantity: number; // "Make 20 portions"
  unit: string; // "portions" | "batches" | "kg"

  assignedDay: string; // "2026-02-12" (Wednesday)
  estimatedMinutes: number; // How long this takes

  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  completedQuantity?: number; // Actual amount made
  completedAt?: number;
  completedBy?: string; // Staff ID

  notes?: string; // "Used last batch of flour"

  // Dependency tracking
  dependsOn?: string[]; // Task IDs that must complete first
  blockedReason?: string;
}
```

**UI: Task List View**

```
┌─────────────────────────────────────────────────────────────┐
│  📅 Saturday Market - Feb 15                    [+ Add Task]│
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  WEDNESDAY (Feb 12)                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☐ Brioche Buns (x40)                      ~2 hrs    │   │
│  │   Recipe: brioche_batch_20 × 2                      │   │
│  │   [Start Task]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☐ Focaccia Loaves (x8)                    ~1.5 hrs  │   │
│  │   Recipe: focaccia_batch_4 × 2                      │   │
│  │   [Start Task]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  THURSDAY (Feb 13)                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☐ Salsa Roja (x5 liters)                  ~45 min   │   │
│  │   Recipe: salsa_roja_5L                             │   │
│  │   [Start Task]                                      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☑ Guacamole (x3 kg)                       DONE ✓    │   │
│  │   Completed by: Maria @ 2:30 PM                     │   │
│  │   Note: Made 3.2 kg (avocados were larger)          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 2. Recipe Execution (The Core Workflow)

When a task is started, BOH guides the user through the recipe:

```typescript
interface RecipeDefinition {
  id: string;
  name: string; // "Salsa Roja (5L Batch)"
  category: 'bread' | 'sauce' | 'protein' | 'produce' | 'assembly';

  yieldQuantity: number; // 5
  yieldUnit: string; // "liters"

  activeTimeMinutes: number; // Hands-on time
  totalTimeMinutes: number; // Including wait/bake time

  components: RecipeComponent[]; // Ingredients with quantities

  steps: RecipeStep[]; // Execution instructions

  equipment: string[]; // "Blender", "Large pot"

  storageInstructions?: string; // "Refrigerate, use within 5 days"
  shelfLifeDays?: number; // 5

  outputInventoryItemId?: string; // Creates this inventory item when done
}

interface RecipeStep {
  stepNumber: number;
  instruction: string; // "Toast dried chiles in dry pan 2 min"
  durationMinutes?: number; // Timer for this step
  isCheckpoint?: boolean; // Pause for user confirmation
  image?: string; // Visual reference
}
```

**UI: Recipe Execution View**

```
┌─────────────────────────────────────────────────────────────┐
│  🍅 Salsa Roja (5L Batch)                     Step 3 of 8  │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                                     │   │
│  │     [ TIMER: 2:00 ]                                 │   │
│  │                                                     │   │
│  │     Toast dried chiles in dry pan                   │   │
│  │     until fragrant and slightly darkened            │   │
│  │                                                     │   │
│  │     ⚠️ Don't burn them - watch carefully!           │   │
│  │                                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  INGREDIENTS FOR THIS STEP:                                 │
│  • 6 Guajillo chiles (stems removed)                       │
│  • 4 Ancho chiles (stems removed)                          │
│                                                             │
│  ─────────────────────────────────────────────────────────  │
│  │  [◀ PREV]              [TIMER]              [NEXT ▶]  │ │
│  │                        [02:00]                        │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 3. Inventory Integration

BOH tracks:

- **Raw Ingredients:** What you bought (flour, tomatoes, chiles)
- **Prepped Items:** What you made (salsa, chopped onions, marinated chicken)
- **Par Levels:** Minimum quantities needed for expected sales

```typescript
interface InventoryItem {
  id: string;
  name: string;
  type: 'RAW' | 'PREP'; // RAW = purchased, PREP = made in-house
  stockUnit: MeasurementUnit; // 'kg', 'liters', 'count'
  currentStock: number;
  parLevel?: number; // Target minimum
  costPerUnit: number;
  location?: string; // "Walk-in", "Dry Storage", "Freezer"
  expiresAt?: number; // For perishables
}
```

**Automatic Inventory Actions:**

- **When task started:** Deduct raw ingredients from inventory
- **When task completed:** Add prepped item to inventory
- **Low stock alerts:** Warn when below par level

**UI: Inventory Dashboard**

```
┌─────────────────────────────────────────────────────────────┐
│  📦 Inventory Status                        [+ Add Item]    │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ⚠️ LOW STOCK (Below Par Level)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔴 Brioche Buns    12 ct    (Par: 40)    -28       │   │
│  │ 🟡 Salsa Roja      2.1 L    (Par: 5)     -2.9 L    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ✅ ADEQUATE STOCK                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 Guacamole       3.2 kg   (Par: 3)     +0.2 kg   │   │
│  │ 🟢 Flour           8 kg     (Par: 5)     +3 kg     │   │
│  │ 🟢 Tomatoes        6 kg     (Par: 4)     +2 kg     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 4. Prep Math & Planning

BOH helps calculate how much to prep based on expected sales:

```typescript
interface PrepCalculation {
  eventId: string;
  expectedSales: SalesProjection[];
  requiredPrep: PrepRequirement[];
}

interface SalesProjection {
  productId: string; // "burger_classic"
  expectedUnits: number; // 50 burgers
  confidenceLevel: 'low' | 'medium' | 'high';
}

interface PrepRequirement {
  inventoryItemId: string; // "brioche_bun"
  requiredQuantity: number; // 50 buns
  currentStock: number; // 12 buns
  toPrepare: number; // 38 buns (plus buffer)
  recipeId: string; // "brioche_batch_20"
  batchesNeeded: number; // 2 batches (yields 40)
}
```

**UI: Prep Planner**

```
┌─────────────────────────────────────────────────────────────┐
│  🧮 Prep Math for Saturday Market                           │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  EXPECTED SALES (adjust as needed):                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Classic Burger        [ 50 ] units                  │   │
│  │ Loaded Fries          [ 40 ] units                  │   │
│  │ Tacos (3-pack)        [ 30 ] units                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  PREP REQUIREMENTS (auto-calculated):                       │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                       NEED    HAVE    PREP    BATCH │   │
│  │ Brioche Buns          50      12      38      x2    │   │
│  │ Salsa Roja            5L      2L      3L      x1    │   │
│  │ Guacamole             3kg     3.2kg   -       -     │   │
│  │ Chopped Onions        2kg     0       2kg     x1    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [Generate Prep Schedule]                                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 5. Waste Tracking & Logging

Track what didn't get used or went bad:

```typescript
interface WasteLog {
  id: string;
  inventoryItemId: string;
  quantity: number;
  reason: 'expired' | 'damaged' | 'overproduced' | 'quality';
  notes?: string;
  loggedAt: number;
  loggedBy: string;
}
```

---

## 🟢 OPTIONAL FEATURE: Live Kitchen Display (KDS)

### When This Feature is Needed

As operations grow, you might add:

- A sit-down restaurant alongside the cart
- A kitchen that receives live orders from POS
- A commissary that fulfills catering orders

In these cases, BOH can switch to **Live Mode** to function as a traditional KDS.

### Live Mode Features

- Real-time order queue from POS via WebSocket
- Prep timers counting up from order received
- Bump actions: Start → Ready → Completed
- Station filtering (Grill, Fry, Assembly)
- Audio alerts for new orders
- SOS flagging for problems

### Mode Toggle

```
┌─────────────────────────────────────────────────────────────┐
│  ⚙️ BOH Mode                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                             │
│  ◉ PREP MODE (Default)                                     │
│    Batch tasks, recipes, inventory management              │
│    No live order processing                                │
│                                                             │
│  ○ LIVE MODE                                               │
│    Real-time order display from POS                        │
│    Requires active WebSocket connection to HYPHAE API      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary: BOH is a Prep-First System

| Feature                | Priority       | Description                              |
| ---------------------- | -------------- | ---------------------------------------- |
| **Prep Schedules**     | P0 (Core)      | Plan what to make for upcoming events    |
| **Task Lists**         | P0 (Core)      | Daily checklist of prep items            |
| **Recipe Execution**   | P0 (Core)      | Step-by-step cooking guidance            |
| **Inventory Tracking** | P0 (Core)      | Track raw → prepped items                |
| **Prep Math**          | P1 (Important) | Calculate quantities from sales forecast |
| **Waste Logging**      | P1 (Important) | Track and reduce waste                   |
| **Live KDS**           | P2 (Feature)   | Real-time orders when connected to POS   |

Confirm you understand that **Prep Kitchen is the core paradigm**, and Live KDS is an add-on feature. Then I'll provide the file structure.

```

---

# 🎯 SHOT 3: Technical Implementation

After model confirms, send this:

```

## BOH App Implementation

### Directory Structure

Create this structure inside the monorepo:

```
apps/boh/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── src/
│   ├── main.tsx                    # Entry point
│   ├── App.tsx                     # Mode router (Prep vs Live)
│   ├── index.css                   # Tailwind + SHASO tokens
│   ├── types.ts                    # All BOH types (PrepTask, Recipe, Inventory)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Mode indicator, clock, settings
│   │   │   ├── Navigation.tsx      # Bottom nav (Prep, Inventory, Schedule, Settings)
│   │   │   └── ModeSwitcher.tsx    # Toggle Prep/Live Mode
│   │   │
│   │   ├── prep/                   # === PRIMARY: Prep Kitchen ===
│   │   │   ├── PrepDashboard.tsx   # Main prep view with today's tasks
│   │   │   ├── TaskList.tsx        # List of tasks for selected day
│   │   │   ├── TaskCard.tsx        # Single prep task card
│   │   │   ├── RecipeExecution.tsx # Step-by-step recipe guide
│   │   │   ├── RecipeStep.tsx      # Single step with timer
│   │   │   ├── PrepScheduleView.tsx# Week calendar with all events
│   │   │   ├── PrepPlanner.tsx     # Sales forecast → prep math
│   │   │   └── TaskCompletionModal.tsx # Log completion details
│   │   │
│   │   ├── inventory/              # === Inventory Management ===
│   │   │   ├── InventoryDashboard.tsx # Overview with par level status
│   │   │   ├── InventoryItem.tsx   # Single item row
│   │   │   ├── StockAdjustment.tsx # Add/remove stock modal
│   │   │   ├── WasteLogger.tsx     # Log waste with reason
│   │   │   └── ParLevelEditor.tsx  # Set minimum stock levels
│   │   │
│   │   ├── recipe/                 # === Recipe Library ===
│   │   │   ├── RecipeList.tsx      # Browse all recipes
│   │   │   ├── RecipeDetail.tsx    # Full recipe view
│   │   │   └── RecipeCard.tsx      # Recipe preview card
│   │   │
│   │   └── ui/                     # === Shared UI Components ===
│   │       ├── Button.tsx          # Action buttons
│   │       ├── Badge.tsx           # Status badges
│   │       ├── Checkbox.tsx        # Task completion
│   │       ├── Timer.tsx           # Countdown/countup timer
│   │       ├── ProgressBar.tsx     # Recipe progress
│   │       └── AudioPlayer.tsx     # Sound effects
│   │
│   ├── hooks/
│   │   ├── usePrepSchedule.ts      # Current schedule & tasks
│   │   ├── useRecipe.ts            # Recipe execution state
│   │   ├── useInventory.ts         # Inventory queries & mutations
│   │   ├── usePrepMath.ts          # Sales → prep calculations
│   │   ├── useTimer.ts             # Step timers
│   │   └── useAudio.ts             # Sound effects
│   │
│   ├── services/
│   │   └── api.ts                  # REST API for prep, inventory, recipes
│   │
│   ├── stores/
│   │   ├── prepStore.ts            # Active schedule, current task
│   │   ├── inventoryStore.ts       # Local inventory cache
│   │   └── configStore.ts          # BOH settings
│   │
│   └── lib/
│       └── sounds/
│           ├── task-complete.mp3   # Prep task done
│           ├── timer-done.mp3      # Step timer finished
│           └── low-stock.mp3       # Par level warning
```

### package.json

```json
{
  "name": "boh",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite --port 3002",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@hyphae/schemas": "workspace:*",
    "@hyphae/ui": "workspace:*",
    "@tanstack/react-query": "^5.90.0",
    "lucide-react": "^0.555.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "zustand": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^5.0.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.5.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.8.0",
    "vite": "^6.2.0"
  }
}
```

### Key Type Definitions (FROM ACTUAL POS CODEBASE)

> These types are from `hyphae-pos/src/types.ts` - use them exactly as-is.

```typescript
// ACTUAL types from hyphae-pos/src/types.ts

export type OrderType = 'DineIn' | 'Takeout' | 'Delivery';
export type OrderStatus = 'Pending' | 'Kitchen' | 'Ready' | 'Completed';
export type PaymentStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Refunded';
export type PaymentMethod = 'Cash' | 'Clip' | 'Transfer' | 'Split';

export interface SystemInfo {
  storeId: string;
  terminalId: string;
  staffId: string;
  shiftId?: string;
}

export interface ModifierOption {
  id: string;
  name: string;
  price: number;
  metadata?: {
    kitchenLabel?: string;
    quantity?: number;
  };
}

export type ModifierVariation = 'Normal' | 'No' | 'Side' | 'Extra';

export interface SelectedModifier {
  groupId: string;
  optionId: string;
  name: string;
  price: number;
  variation: ModifierVariation;
}

export interface OrderItem {
  id: string;
  uniqueId: string;
  name: string;
  price: number;
  categoryId: string;
  requiresMods: boolean;
  selectedModifiers: SelectedModifier[];
  notes?: string;
  finalPrice: number;
}

export interface SavedOrder {
  id: string;
  table: string;
  time: string;

  systemInfo?: SystemInfo;

  // Timestamps for BOH lifecycle tracking
  createdAt: number;
  cookingStartedAt?: number; // <-- BOH sets this when "Start" pressed
  readyAt?: number; // <-- BOH sets this when "Ready" pressed
  completedAt?: number;

  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  amountPaid: number;
  status: OrderStatus; // <-- BOH transitions: Pending → Kitchen → Ready
  paymentStatus: PaymentStatus;
  orderType: OrderType;
  confirmationNumber?: string;

  isLoyalty?: boolean;
  loyaltySnapshot?: {
    tierName: string;
    tierColor: string;
    pointsEarned: number;
  };
}

// BOH-SPECIFIC EXTENSIONS (new for BOH app)
export interface KitchenOrder extends SavedOrder {
  // BOH adds these fields locally
  isSOS: boolean;
  sosReason?: string;
  stationProgress: Record<string, 'pending' | 'cooking' | 'done'>;
}

// Station definitions (customize per kitchen)
export interface Station {
  id: string;
  name: string;
  color: string;
  icon: string; // Lucide icon name
}

export const STATIONS: Station[] = [
  { id: 'all', name: 'All Stations', color: 'gray', icon: 'LayoutGrid' },
  { id: 'grill', name: 'Grill', color: 'orange', icon: 'Flame' },
  { id: 'fry', name: 'Fryer', color: 'yellow', icon: 'Droplets' },
  { id: 'cold', name: 'Cold Line', color: 'blue', icon: 'Snowflake' },
  { id: 'assembly', name: 'Assembly', color: 'green', icon: 'PackageCheck' },
];
```

**Critical Integration Note:** The `SavedOrder` type already has `status`, `cookingStartedAt`, and `readyAt` fields. BOH should UPDATE these fields and sync back to CORE, which then notifies POS. Do NOT create a parallel order type. However, **this is only relevant for Live KDS mode** - the primary Prep Mode does not use SavedOrder at all.

Now, please generate the initial implementation starting with **Prep Mode (the core functionality)**:

1. `src/main.tsx` - Entry point with QueryClient and Zustand
2. `src/App.tsx` - Mode router (defaults to Prep Mode)
3. `src/types.ts` - PrepSchedule, PrepTask, RecipeDefinition, InventoryItem types
4. `src/components/prep/PrepDashboard.tsx` - Main prep view with today's tasks
5. `src/components/prep/TaskCard.tsx` - Single prep task card with Start/Complete actions
6. `src/components/prep/RecipeExecution.tsx` - Step-by-step recipe execution
7. `src/hooks/usePrepSchedule.ts` - Schedule and task state management

Use the SHASO design system. Focus on touch-friendly, kitchen-safe UI. Make it production-ready.

```

---

# 🎯 SHOT 4: Detailed Component Specs (Prep Mode)

After model generates initial files, send this:

```

Excellent. Now let's refine the core Prep Mode components.

## TaskCard Component Requirements

The TaskCard is the heart of Prep Mode. It must be:

1. **Glanceable** - Know task status in < 1 second
2. **Touch-friendly** - Large Start/Complete buttons for greasy/gloved hands
3. **Informative** - Show recipe, quantity, and estimated time

### Visual Layout

```
┌────────────────────────────────────────────────────────────────┐
│  ☐ Brioche Buns (x40)                              ~2 hrs     │  <- Title + estimate
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  � Recipe: brioche_batch_20 × 2 batches                       │
│  📦 Yield: 40 buns → Inventory: brioche_bun                    │
│  🧺 Requires: flour (2kg), eggs (12), butter (500g)            │
│                                                                │
│  ⚠️ Note: Check yeast expiration date                          │  <- Optional notes
│                                                                │
├────────────────────────────────────────────────────────────────┤
│        [ START TASK ]                 [ SKIP ]                 │  <- Action buttons
└────────────────────────────────────────────────────────────────┘

-- When IN PROGRESS --

┌────────────────────────────────────────────────────────────────┐
│  🔵 Brioche Buns (x40)                     ⏱ 01:23:45          │  <- Blue = in progress
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Step 3 of 12: Knead dough until smooth                        │
│                                                                │
│  [ VIEW RECIPE ]                                               │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  [ MARK COMPLETE ]            [ PAUSE ]       [ PROBLEM ]      │
└────────────────────────────────────────────────────────────────┘

-- When COMPLETED --

┌────────────────────────────────────────────────────────────────┐
│  ✅ Brioche Buns (x40)                     DONE in 1h 45m      │  <- Green = done
├────────────────────────────────────────────────────────────────┤
│  Completed by: Maria @ 2:30 PM                                 │
│  Actual yield: 42 buns (entered on completion)                 │
│  Note: "Made 2 extra for taste testing"                        │
└────────────────────────────────────────────────────────────────┘
```

### State Transitions

```
PENDING (gray)
    │
    │ [START TASK] button pressed
    │   → Deduct raw ingredients from inventory
    │   → Start task timer
    ▼
IN_PROGRESS (blue, timer running)
    │
    │ [MARK COMPLETE] button pressed
    │   → Show completion modal
    ▼
COMPLETING (modal)
    │
    │ User enters actual yield + notes
    │   → Add prepped item to inventory
    ▼
COMPLETED (green, collapsed)
```

### Task Completion Modal

```
┌────────────────────────────────────────────────────────────────┐
│  ✅ Complete Task: Brioche Buns                                │
│  ───────────────────────────────────────────────────────────   │
│                                                                │
│  Actual yield:                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  [ 42 ] buns  (target was 40)                           │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  Notes (optional):                                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Made 2 extra for taste testing                         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│  Storage location:                                             │
│  [ Walk-in Cooler ▼ ]                                         │
│                                                                │
│  Expiration: [ 3 ] days from now                               │
│                                                                │
│  ───────────────────────────────────────────────────────────   │
│              [ CANCEL ]              [ CONFIRM ✓ ]             │
└────────────────────────────────────────────────────────────────┘
```

## RecipeExecution Component

Full-screen recipe execution view for guided cooking:

### Visual Layout

```
┌────────────────────────────────────────────────────────────────┐
│  🍞 Brioche Buns                              Step 3 of 12     │
│  ───────────────────────────────────────────────────────────   │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                                                          │ │
│  │     ╭─────────────────────╮                             │ │
│  │     │      03:00          │   <- Step timer              │ │
│  │     │      ━━━━━━━━━━━━   │                             │ │
│  │     ╰─────────────────────╯                             │ │
│  │                                                          │ │
│  │     KNEAD DOUGH                                          │ │
│  │     until smooth and elastic                             │ │
│  │     (windowpane test should pass)                        │ │
│  │                                                          │ │
│  │     💡 TIP: Add flour 1 tbsp at a time if too sticky     │ │
│  │                                                          │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  INGREDIENTS FOR THIS STEP:                                    │
│  • Proofed dough from step 2                                   │
│  • 2 tbsp flour (for dusting)                                  │
│                                                                │
│  ───────────────────────────────────────────────────────────   │
│  │  [◀ PREV]        [ ⏱ START TIMER ]         [NEXT ▶]     │  │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

### Recipe Step Component Props

```typescript
interface RecipeStepProps {
  step: RecipeStep;
  stepNumber: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onTimerComplete: () => void;
}

interface RecipeStep {
  stepNumber: number;
  instruction: string; // Main instruction text
  duration?: number; // Optional timer in seconds
  tips?: string[]; // Optional tips
  ingredients?: string[]; // Ingredients used in this step
  checkpoint?: boolean; // If true, require confirmation
  image?: string; // Optional visual reference
}
```

### Timer Behavior

- **No duration:** Show "No timer" button (disabled)
- **With duration:** Show duration, click to start countdown
- **Timer running:** Countdown with progress ring, audio chime at 10s, 3s, 0s
- **Timer complete:** Auto-advance to next step OR require confirmation if checkpoint

## Audio Integration (Prep Mode)

```typescript
// src/hooks/useAudio.ts
export function useAudio() {
  const playTaskComplete = () => playSound('/sounds/task-complete.mp3');
  const playTimerTick = () => playSound('/sounds/timer-tick.mp3'); // At 10s, 3s
  const playTimerDone = () => playSound('/sounds/timer-done.mp3'); // At 0s
  const playLowStock = () => playSound('/sounds/low-stock.mp3'); // Par level warning

  return {
    playTaskComplete,
    playTimerTick,
    playTimerDone,
    playLowStock,
  };
}
```

**Note:** Use Web Audio API for reliable playback in kitchen environment.

## Inventory Integration on Task Actions

```typescript
// When task is STARTED:
async function onTaskStart(task: PrepTask) {
  const recipe = await getRecipe(task.recipeId);

  // Deduct raw ingredients
  for (const component of recipe.components) {
    await deductInventory(component.inventoryItemId, component.quantity * task.batchCount);
  }

  // Update task status
  await updateTask(task.id, { status: 'in_progress', startedAt: Date.now() });
}

// When task is COMPLETED:
async function onTaskComplete(task: PrepTask, actualYield: number, notes: string) {
  const recipe = await getRecipe(task.recipeId);

  // Add prepped item to inventory
  if (recipe.outputInventoryItemId) {
    await addInventory(recipe.outputInventoryItemId, actualYield);
  }

  // Update task status
  await updateTask(task.id, {
    status: 'completed',
    completedAt: Date.now(),
    completedQuantity: actualYield,
    notes,
  });
}
```

Please update and refine the components based on these specifications. Focus on:

- Smooth animations (framer-motion or CSS)
- Proper accessibility (ARIA labels)
- Error boundaries
- Loading states
- Touch-optimized interactions (60px minimum targets)

```

---

# 🎯 SHOT 5: State Management & API Integration (Prep Mode)

After model updates components, send this:

```

Now let's implement the state management and API integration for Prep Mode.

## REST API Service

The primary data source for Prep Mode. WebSocket is only used for optional Live KDS mode.

```typescript
// src/services/api.ts
const API_BASE = import.meta.env.VITE_CORE_API_URL || 'http://localhost:3001';

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

async function apiRequest<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = localStorage.getItem('boh_token');

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// === PREP SCHEDULES ===
export const prepApi = {
  // Get all schedules (optionally filter by status)
  getSchedules: (status?: 'planning' | 'active' | 'completed') =>
    apiRequest<PrepSchedule[]>(`/prep/schedules${status ? `?status=${status}` : ''}`),

  // Get single schedule with tasks
  getSchedule: (id: string) => apiRequest<PrepSchedule>(`/prep/schedules/${id}`),

  // Create new schedule
  createSchedule: (data: Omit<PrepSchedule, 'id' | 'createdAt'>) =>
    apiRequest<PrepSchedule>('/prep/schedules', { method: 'POST', body: data }),

  // Update schedule
  updateSchedule: (id: string, data: Partial<PrepSchedule>) =>
    apiRequest<PrepSchedule>(`/prep/schedules/${id}`, { method: 'PATCH', body: data }),
};

// === PREP TASKS ===
export const taskApi = {
  // Get tasks for a schedule
  getTasks: (scheduleId: string) => apiRequest<PrepTask[]>(`/prep/schedules/${scheduleId}/tasks`),

  // Get tasks for today (across all active schedules)
  getTodaysTasks: () => apiRequest<PrepTask[]>('/prep/tasks/today'),

  // Update task status
  updateTask: (taskId: string, data: Partial<PrepTask>) =>
    apiRequest<PrepTask>(`/prep/tasks/${taskId}`, { method: 'PATCH', body: data }),

  // Start task (deducts ingredients, starts timer)
  startTask: (taskId: string) =>
    apiRequest<PrepTask>(`/prep/tasks/${taskId}/start`, { method: 'POST' }),

  // Complete task (adds to inventory, records yield)
  completeTask: (
    taskId: string,
    data: { actualYield: number; notes?: string; storageLocation?: string }
  ) => apiRequest<PrepTask>(`/prep/tasks/${taskId}/complete`, { method: 'POST', body: data }),

  // Skip task
  skipTask: (taskId: string, reason?: string) =>
    apiRequest<PrepTask>(`/prep/tasks/${taskId}/skip`, { method: 'POST', body: { reason } }),
};

// === RECIPES ===
export const recipeApi = {
  // Get all recipes
  getRecipes: (category?: string) =>
    apiRequest<RecipeDefinition[]>(`/recipes${category ? `?category=${category}` : ''}`),

  // Get single recipe with steps
  getRecipe: (id: string) => apiRequest<RecipeDefinition>(`/recipes/${id}`),
};

// === INVENTORY ===
export const inventoryApi = {
  // Get all inventory items
  getInventory: (type?: 'RAW' | 'PREP') =>
    apiRequest<InventoryItem[]>(`/inventory${type ? `?type=${type}` : ''}`),

  // Get items below par level
  getLowStock: () => apiRequest<InventoryItem[]>('/inventory/low-stock'),

  // Update stock level
  adjustStock: (itemId: string, quantity: number, reason: string) =>
    apiRequest<InventoryItem>(`/inventory/${itemId}/adjust`, {
      method: 'POST',
      body: { quantity, reason },
    }),

  // Log waste
  logWaste: (itemId: string, data: { quantity: number; reason: string; notes?: string }) =>
    apiRequest<WasteLog>(`/inventory/${itemId}/waste`, { method: 'POST', body: data }),
};
```

## Zustand Prep Store

Main state management for Prep Mode:

```typescript
// src/stores/prepStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PrepSchedule, PrepTask, RecipeDefinition } from '../types';
import { prepApi, taskApi, recipeApi } from '../services/api';

interface PrepStore {
  // Current state
  activeSchedule: PrepSchedule | null;
  todaysTasks: PrepTask[];
  currentTask: PrepTask | null;
  currentRecipe: RecipeDefinition | null;
  currentStep: number;

  // Loading states
  isLoading: boolean;
  error: string | null;

  // Actions: Schedule
  loadActiveSchedule: () => Promise<void>;
  setActiveSchedule: (schedule: PrepSchedule) => void;

  // Actions: Tasks
  loadTodaysTasks: () => Promise<void>;
  startTask: (taskId: string) => Promise<void>;
  completeTask: (taskId: string, yield: number, notes?: string) => Promise<void>;
  skipTask: (taskId: string, reason?: string) => Promise<void>;

  // Actions: Recipe Execution
  startRecipeExecution: (task: PrepTask) => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
  exitRecipe: () => void;

  // Computed
  getTasksByDay: (day: string) => PrepTask[];
  getCompletedCount: () => number;
  getPendingCount: () => number;
}

export const usePrepStore = create<PrepStore>()(
  persist(
    (set, get) => ({
      activeSchedule: null,
      todaysTasks: [],
      currentTask: null,
      currentRecipe: null,
      currentStep: 0,
      isLoading: false,
      error: null,

      loadActiveSchedule: async () => {
        set({ isLoading: true, error: null });
        try {
          const schedules = await prepApi.getSchedules('active');
          if (schedules.length > 0) {
            set({ activeSchedule: schedules[0] });
          }
        } catch (e) {
          set({ error: (e as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      setActiveSchedule: (schedule) => set({ activeSchedule: schedule }),

      loadTodaysTasks: async () => {
        set({ isLoading: true, error: null });
        try {
          const tasks = await taskApi.getTodaysTasks();
          set({ todaysTasks: tasks });
        } catch (e) {
          set({ error: (e as Error).message });
        } finally {
          set({ isLoading: false });
        }
      },

      startTask: async (taskId) => {
        const task = await taskApi.startTask(taskId);
        set((state) => ({
          todaysTasks: state.todaysTasks.map((t) => (t.id === taskId ? task : t)),
          currentTask: task,
        }));
      },

      completeTask: async (taskId, actualYield, notes) => {
        const task = await taskApi.completeTask(taskId, { actualYield, notes });
        set((state) => ({
          todaysTasks: state.todaysTasks.map((t) => (t.id === taskId ? task : t)),
          currentTask: null,
          currentRecipe: null,
          currentStep: 0,
        }));
      },

      skipTask: async (taskId, reason) => {
        const task = await taskApi.skipTask(taskId, reason);
        set((state) => ({
          todaysTasks: state.todaysTasks.map((t) => (t.id === taskId ? task : t)),
        }));
      },

      startRecipeExecution: async (task) => {
        const recipe = await recipeApi.getRecipe(task.recipeId);
        set({ currentTask: task, currentRecipe: recipe, currentStep: 0 });
      },

      nextStep: () =>
        set((state) => ({
          currentStep: Math.min(
            state.currentStep + 1,
            (state.currentRecipe?.steps.length || 1) - 1
          ),
        })),

      prevStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
        })),

      exitRecipe: () => set({ currentRecipe: null, currentStep: 0 }),

      getTasksByDay: (day) => get().todaysTasks.filter((t) => t.assignedDay === day),

      getCompletedCount: () => get().todaysTasks.filter((t) => t.status === 'completed').length,

      getPendingCount: () => get().todaysTasks.filter((t) => t.status === 'pending').length,
    }),
    {
      name: 'boh-prep-store',
      partialize: (state) => ({
        activeSchedule: state.activeSchedule,
        // Don't persist current recipe execution state
      }),
    }
  )
);
```

## Inventory Store

Separate store for inventory to keep concerns separated:

```typescript
// src/stores/inventoryStore.ts
import { create } from 'zustand';
import { InventoryItem } from '../types';
import { inventoryApi } from '../services/api';

interface InventoryStore {
  items: InventoryItem[];
  lowStockItems: InventoryItem[];
  isLoading: boolean;
  error: string | null;

  loadInventory: () => Promise<void>;
  loadLowStock: () => Promise<void>;
  adjustStock: (itemId: string, quantity: number, reason: string) => Promise<void>;
  logWaste: (itemId: string, quantity: number, reason: string, notes?: string) => Promise<void>;

  getItemById: (id: string) => InventoryItem | undefined;
  getItemsByType: (type: 'RAW' | 'PREP') => InventoryItem[];
}

export const useInventoryStore = create<InventoryStore>((set, get) => ({
  items: [],
  lowStockItems: [],
  isLoading: false,
  error: null,

  loadInventory: async () => {
    set({ isLoading: true });
    try {
      const items = await inventoryApi.getInventory();
      set({ items, error: null });
    } catch (e) {
      set({ error: (e as Error).message });
    } finally {
      set({ isLoading: false });
    }
  },

  loadLowStock: async () => {
    try {
      const lowStockItems = await inventoryApi.getLowStock();
      set({ lowStockItems });
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },

  adjustStock: async (itemId, quantity, reason) => {
    const updated = await inventoryApi.adjustStock(itemId, quantity, reason);
    set((state) => ({
      items: state.items.map((item) => (item.id === itemId ? updated : item)),
    }));
  },

  logWaste: async (itemId, quantity, reason, notes) => {
    await inventoryApi.logWaste(itemId, { quantity, reason, notes });
    // Reload inventory to get updated quantities
    get().loadInventory();
  },

  getItemById: (id) => get().items.find((item) => item.id === id),

  getItemsByType: (type) => get().items.filter((item) => item.type === type),
}));
```

## React Query Hooks (Optional Enhancement)

For better caching and automatic refetching:

```typescript
// src/hooks/usePrepSchedule.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prepApi, taskApi } from '../services/api';

export function usePrepSchedules(status?: 'planning' | 'active' | 'completed') {
  return useQuery({
    queryKey: ['prep-schedules', status],
    queryFn: () => prepApi.getSchedules(status),
  });
}

export function useTodaysTasks() {
  return useQuery({
    queryKey: ['prep-tasks', 'today'],
    queryFn: () => taskApi.getTodaysTasks(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useStartTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: string) => taskApi.startTask(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prep-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useCompleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      taskId,
      actualYield,
      notes,
    }: {
      taskId: string;
      actualYield: number;
      notes?: string;
    }) => taskApi.completeTask(taskId, { actualYield, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prep-tasks'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
```

Please implement these with proper TypeScript types, error handling, and ensure they integrate with the components from the previous shot.

```

---

# 🎯 SHOT 6: Final Polish & Development Tooling

After model implements Prep state management, send this:

```

Final polish. Let's add finishing touches to Prep Mode.

## Prep Mode Polish

### 1. Empty State (No Tasks Today)

When all tasks are complete or no tasks scheduled:

```
┌────────────────────────────────────────────────────────────────┐
│                                                                │
│                         ✅                                     │
│                                                                │
│              All prep complete for today!                      │
│              Great work, team.                                 │
│                                                                │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │   📅 Next prep day: Thursday, Feb 13                    │   │
│  │   🎯 Target: Farmers Market Weekend                     │   │
│  │   📝 8 tasks scheduled                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                │
│              [ VIEW UPCOMING SCHEDULE ]                        │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 2. Progress Dashboard Header

Top of PrepDashboard, always visible:

```
┌────────────────────────────────────────────────────────────────┐
│  📅 Today: Feb 10                          🎯 Market Weekend   │
├────────────────────────────────────────────────────────────────┤
│  ✅ 4/12 Complete  │  � 1 In Progress  │  ⏰ ~6h remaining    │
│  ━━━━━━━━━━━━━━━━━━░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
└────────────────────────────────────────────────────────────────┘
```

### 3. Low Stock Alert Banner

When inventory below par level:

```
┌────────────────────────────────────────────────────────────────┐
│  ⚠️ LOW STOCK: Brioche Buns (12 remaining, par: 40)           │
│     Eggs (6 remaining, par: 24)                                │
│                               [ VIEW INVENTORY ]  [ DISMISS ]  │
└────────────────────────────────────────────────────────────────┘
```

### 4. Error Boundary

Wrap critical sections so one task card crash doesn't take down the app.

```typescript
// src/components/layout/ErrorBoundary.tsx
```

### 5. Service Worker (Offline Support)

Basic offline capability for prep mode:

```typescript
// src/sw.ts - Cache recipes and current schedule
```

---

### 6. Mock Data for Development

```typescript
// src/lib/mockData.ts
export function generateMockSchedule(): PrepSchedule {
  // Mock schedule generator for development
}

export function generateMockTasks(): PrepTask[] {
  // Mock task list for testing prep workflows
}

export function generateMockInventory(): InventoryItem[] {
  // Mock inventory data
}

// Use in development mode
if (import.meta.env.DEV) {
  // Initialize with mock data if no API connection
}
```

---

Please implement these final components and provide a complete, runnable BOH application.

Also create a README.md for the apps/boh directory explaining:

1. How to run locally
2. How to connect to HYPHAE API
3. Environment variables needed
4. How prep schedules and inventory integration works

> **Note:** If you need live order tracking (KDS), use the **POS app's built-in KDS column**. BOH is specifically for batch prep workflows.

```

---

## Summary: What the Model Should Create

After completing all shots, the model should have created:

### Core Features
1. **Complete `apps/boh/` directory** with all files
2. **Prep Dashboard** with today's tasks
3. **Task Cards** with Start/Complete workflow
4. **Recipe Execution** step-by-step guide with timers
5. **Inventory Integration** auto-update on task completion
6. **Prep Schedule** week view targeting events
7. **Prep Math** (sales forecasts → prep quantities)
8. **Waste Logging** for tracking losses

### Technical Implementation
9. **SHASO-compliant UI** (dark theme, touch-friendly, 60px touch targets)
10. **Audio system** (task complete, timer alerts, low stock warnings)
11. **State management** (Zustand + React Query)
12. **REST API integration** (schedules, tasks, inventory, recipes)
13. **Development tooling** (mock data generators)

### What BOH Does NOT Include
- ❌ Live order queue (use POS KDS column instead)
- ❌ WebSocket/real-time orders
- ❌ Order bump actions
- ❌ Station filtering for live orders

---

*Created: 2026-02-07*
*Updated: 2026-02-07 - Refocused on Prep Kitchen as sole feature (KDS handled by POS)*
*For use with: Claude, Gemini, GPT-4, or compatible models*
```
